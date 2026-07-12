import { Elysia, t } from "elysia"
import { and, desc, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { addresses } from "@/lib/db/schema"
import { requireAuth } from "@/server/plugins/require-auth"
import { requireAdmin } from "@/server/plugins/require-admin"

const addressBody = t.Object({
  label: t.Optional(t.String()),
  name: t.String({ minLength: 2 }),
  line1: t.String({ minLength: 2 }),
  line2: t.Optional(t.String()),
  city: t.String({ minLength: 2 }),
  state: t.Optional(t.String()),
  postalCode: t.String({ minLength: 2 }),
  country: t.String({ minLength: 2 }),
  phone: t.Optional(t.String()),
  isDefault: t.Optional(t.Boolean()),
})

export const addressController = new Elysia({ prefix: "/addresses" })
  .use(requireAuth)
  .get("/", async () => {
    const session = await auth()
    const userId = session!.user.id

    const rows = await db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
      orderBy: [desc(addresses.isDefault), desc(addresses.updatedAt)],
    })

    return rows
  })
  .post(
    "/",
    async ({ body }) => {
      const session = await auth()
      const userId = session!.user.id

      if (body.isDefault) {
        await db
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(addresses.userId, userId))
      }

      const existing = await db.query.addresses.findMany({
        where: eq(addresses.userId, userId),
      })

      const [created] = await db
        .insert(addresses)
        .values({
          userId,
          label: body.label?.trim() || "Home",
          name: body.name.trim(),
          line1: body.line1.trim(),
          line2: body.line2?.trim() || null,
          city: body.city.trim(),
          state: body.state?.trim() || null,
          postalCode: body.postalCode.trim(),
          country: body.country.trim(),
          phone: body.phone?.trim() || null,
          isDefault: body.isDefault ?? existing.length === 0,
        })
        .returning()

      return created
    },
    { body: addressBody }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const session = await auth()
      const userId = session!.user.id
      const id = Number(params.id)

      const existing = await db.query.addresses.findFirst({
        where: and(eq(addresses.id, id), eq(addresses.userId, userId)),
      })

      if (!existing) {
        set.status = 404
        throw new Error("Address not found")
      }

      if (body.isDefault) {
        await db
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(addresses.userId, userId))
      }

      const [updated] = await db
        .update(addresses)
        .set({
          label: body.label?.trim() || existing.label,
          name: body.name.trim(),
          line1: body.line1.trim(),
          line2: body.line2?.trim() || null,
          city: body.city.trim(),
          state: body.state?.trim() || null,
          postalCode: body.postalCode.trim(),
          country: body.country.trim(),
          phone: body.phone?.trim() || null,
          isDefault: body.isDefault ?? existing.isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, id))
        .returning()

      return updated
    },
    { body: addressBody }
  )
  .delete("/:id", async ({ params, set }) => {
    const session = await auth()
    const userId = session!.user.id
    const id = Number(params.id)

    const existing = await db.query.addresses.findFirst({
      where: and(eq(addresses.id, id), eq(addresses.userId, userId)),
    })

    if (!existing) {
      set.status = 404
      throw new Error("Address not found")
    }

    await db.delete(addresses).where(eq(addresses.id, id))
    return { id }
  })
  // Admin — list / delete any address
  .use(requireAdmin)
  .get("/admin/all", async () => {
    return await db.query.addresses.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(addresses.updatedAt)],
    })
  })
  .delete("/admin/:id", async ({ params, set }) => {
    const id = Number(params.id)
    const existing = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    })

    if (!existing) {
      set.status = 404
      throw new Error("Address not found")
    }

    await db.delete(addresses).where(eq(addresses.id, id))
    return { id }
  })
