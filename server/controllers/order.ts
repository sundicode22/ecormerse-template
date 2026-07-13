import { Elysia, t } from "elysia"
import { inArray, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders, products } from "@/lib/db/schema"
import { auth } from "@/auth"
import { requireAdmin } from "@/server/plugins/require-admin"

export const orderController = new Elysia()
  // Authenticated checkout — place order
  .post(
    "/orders",
    async ({ body, set }) => {
      const session = await auth()
      if (!session?.user?.id) {
        set.status = 401
        throw new Error("Sign in to place an order")
      }

      const {
        deliveryType,
        shippingAddress,
        items,
        totalAmount,
        paymentMethod,
        paymentPhone,
      } = body
      const userId = session.user.id

      const normalizedAddress =
        shippingAddress == null
          ? null
          : {
              name: shippingAddress.name,
              line1: shippingAddress.line1 ?? "",
              line2: shippingAddress.line2,
              city: shippingAddress.city ?? "",
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode ?? "",
              country: shippingAddress.country ?? "",
              phone: shippingAddress.phone,
            }

      const status =
        paymentMethod === "mtn" || paymentMethod === "orange"
          ? "awaiting_payment"
          : "pending"

      const [newOrder] = await db
        .insert(orders)
        .values({
          userId,
          status,
          totalAmount: String(totalAmount),
          deliveryType,
          paymentMethod,
          paymentPhone:
            paymentMethod === "mtn" || paymentMethod === "orange"
              ? paymentPhone?.trim() || null
              : null,
          shippingAddress: normalizedAddress,
        })
        .returning()

      const productIds = [...new Set(items.map((item) => item.productId))]
      const productRows =
        productIds.length > 0
          ? await db.query.products.findMany({
              where: inArray(products.id, productIds),
              columns: { id: true, name: true, slug: true },
            })
          : []
      const productById = new Map(productRows.map((p) => [p.id, p]))

      const { orderItems: orderItemsTable } = await import("@/lib/db/schema")
      await db.insert(orderItemsTable).values(
        items.map(
          (item: {
            productId: number
            quantity: number
            price: number
            selectedVariations?: Record<string, string> | null
            selectedModifiers?: string[] | null
          }) => {
            const product = productById.get(item.productId)
            return {
              orderId: newOrder.id,
              productId: item.productId,
              productName: product?.name ?? null,
              productSlug: product?.slug ?? null,
              quantity: item.quantity,
              price: String(item.price),
              selectedVariations: item.selectedVariations ?? null,
              selectedModifiers: item.selectedModifiers ?? null,
            }
          }
        )
      )

      if (deliveryType !== "pickup" && shippingAddress) {
        console.log(
          `[DHL API Integration] Shipping request successfully created for Order ${newOrder.id}`
        )
        console.log(
          `[DHL API] Carrier: DHL ${deliveryType === "international" ? "Express International" : "Ground Local"}`
        )
        console.log(
          `[DHL API] Ship To: ${shippingAddress.name}, ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.country}`
        )
      }

      const withItems = await db.query.orders.findFirst({
        where: eq(orders.id, newOrder.id),
        with: { items: true },
      })

      return withItems ?? newOrder
    },
    {
      body: t.Object({
        deliveryType: t.String(),
        totalAmount: t.Number(),
        paymentMethod: t.Union([
          t.Literal("mtn"),
          t.Literal("orange"),
          t.Literal("whatsapp"),
        ]),
        paymentPhone: t.Optional(t.Nullable(t.String())),
        shippingAddress: t.Optional(
          t.Nullable(
            t.Object({
              name: t.String(),
              line1: t.Optional(t.String()),
              line2: t.Optional(t.String()),
              city: t.Optional(t.String()),
              state: t.Optional(t.String()),
              postalCode: t.Optional(t.String()),
              country: t.Optional(t.String()),
              phone: t.Optional(t.String()),
            })
          )
        ),
        items: t.Array(
          t.Object({
            productId: t.Number(),
            quantity: t.Number(),
            price: t.Number(),
            selectedVariations: t.Optional(t.Any()),
            selectedModifiers: t.Optional(t.Any()),
          })
        ),
      }),
    }
  )
  // Authenticated — current user's orders
  .get("/orders/me", async ({ set }) => {
    const session = await auth()
    if (!session?.user?.id) {
      set.status = 401
      throw new Error("Sign in to view your orders")
    }

    return await db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      with: { items: true },
      orderBy: (ordersTable, { desc }) => [desc(ordersTable.createdAt)],
    })
  })
  // Admin — list and update orders
  .use(requireAdmin)
  .get("/orders", async () => {
    return await db.query.orders.findMany({
      with: { items: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    })
  })
  .get("/orders/deliveries", async () => {
    const all = await db.query.orders.findMany({
      with: { items: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    })
    return all.filter(
      (order) =>
        order.deliveryType === "local" || order.deliveryType === "international"
    )
  })
  .put(
    "/orders/:id",
    async ({ params, body }) => {
      const [updated] = await db
        .update(orders)
        .set({ status: body.status, updatedAt: new Date() })
        .where(eq(orders.id, params.id))
        .returning()
      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ status: t.String() }),
    }
  )
