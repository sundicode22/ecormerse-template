import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import {
  products,
  productCategories,
  productCollections,
  productLabels,
  productVariations,
  productModifiers,
  orderItems,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/server/plugins/require-admin"
import { slugify, generateSku } from "@/lib/slugify"

export const productController = new Elysia()
  .get("/products", async () => {
    return await db.query.products.findMany({
      with: {
        productCategories: true,
        productCollections: true,
        productLabels: true,
        variations: true,
        modifiers: true,
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    })
  })

  .get(
    "/products/by-slug/:slug",
    async ({ params }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.slug, params.slug),
        with: {
          productCategories: true,
          productCollections: true,
          productLabels: true,
          variations: true,
          modifiers: true,
        },
      })
      if (!product) throw new Error("Product not found")
      return product
    },
    { params: t.Object({ slug: t.String() }) }
  )

  .get(
    "/products/:id",
    async ({ params }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, parseInt(params.id)),
        with: {
          productCategories: true,
          productCollections: true,
          productLabels: true,
          variations: true,
          modifiers: true,
        },
      })
      if (!product) throw new Error("Product not found")
      return product
    },
    { params: t.Object({ id: t.String() }) }
  )
  .use(requireAdmin)
  .post(
    "/products",
    async ({ body }) => {
      const { categoryIds, collectionIds, labelIds, variations, modifiers, compareAtPrice, ...productData } = body

      const [newProduct] = await db
        .insert(products)
        .values({
          ...productData,
          slug: slugify(productData.name) || productData.slug,
          sku: generateSku(productData.name) || productData.sku || null,
          basePrice: String(productData.basePrice),
          compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
        })
        .returning()

      if (categoryIds?.length) {
        await db.insert(productCategories).values(
          categoryIds.map((categoryId: number) => ({
            productId: newProduct.id,
            categoryId,
          }))
        )
      }
      if (collectionIds?.length) {
        await db.insert(productCollections).values(
          collectionIds.map((collectionId: number) => ({
            productId: newProduct.id,
            collectionId,
          }))
        )
      }
      if (labelIds?.length) {
        await db.insert(productLabels).values(
          labelIds.map((labelId: number) => ({
            productId: newProduct.id,
            labelId,
          }))
        )
      }
      if (variations?.length) {
        await db.insert(productVariations).values(
          variations.map(
            (v: {
              name: string
              options: { name: string; priceAdjustment: number; stock: number }[]
            }) => ({
              productId: newProduct.id,
              name: v.name,
              options: v.options,
            })
          )
        )
      }
      if (modifiers?.length) {
        await db.insert(productModifiers).values(
          modifiers.map((m: { name: string; required?: boolean; priceAdjustment?: number }) => ({
            productId: newProduct.id,
            name: m.name,
            required: m.required ?? false,
            priceAdjustment: String(m.priceAdjustment ?? 0),
          }))
        )
      }

      return newProduct
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        description: t.Optional(t.String()),
        basePrice: t.Number(),
        compareAtPrice: t.Optional(t.Nullable(t.Union([t.Number(), t.String()]))),
        sku: t.Optional(t.String()),
        stock: t.Optional(t.Number()),
        images: t.Optional(t.Array(t.String())),
        isActive: t.Optional(t.Boolean()),
        isFeatured: t.Optional(t.Boolean()),
        isOnPromotion: t.Optional(t.Boolean()),
        categoryIds: t.Optional(t.Array(t.Number())),
        collectionIds: t.Optional(t.Array(t.Number())),
        labelIds: t.Optional(t.Array(t.Number())),
        variations: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              options: t.Array(
                t.Object({
                  name: t.String(),
                  priceAdjustment: t.Number(),
                  stock: t.Number(),
                })
              ),
            })
          )
        ),
        modifiers: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              required: t.Optional(t.Boolean()),
              priceAdjustment: t.Optional(t.Number()),
            })
          )
        ),
      }),
    }
  )

  .put(
    "/products/:id",
    async ({ params, body }) => {
      const productId = parseInt(params.id)
      const { categoryIds, collectionIds, labelIds, variations, modifiers, compareAtPrice, ...productData } = body

      const updateFields: Record<string, unknown> = {}
      if (productData.name !== undefined) {
        updateFields.name = productData.name
        updateFields.slug = slugify(productData.name) || productData.slug
        updateFields.sku = generateSku(productData.name) || productData.sku
      } else if (productData.slug !== undefined) {
        updateFields.slug = productData.slug
      }
      if (productData.description !== undefined) updateFields.description = productData.description
      if (productData.basePrice !== undefined) updateFields.basePrice = String(productData.basePrice)
      if (compareAtPrice !== undefined) updateFields.compareAtPrice = compareAtPrice ? String(compareAtPrice) : null
      if (productData.name === undefined && productData.sku !== undefined) {
        updateFields.sku = productData.sku
      }
      if (productData.stock !== undefined) updateFields.stock = productData.stock
      if (productData.images !== undefined) updateFields.images = productData.images
      if (productData.isActive !== undefined) updateFields.isActive = productData.isActive
      if (productData.isFeatured !== undefined) updateFields.isFeatured = productData.isFeatured
      if (productData.isOnPromotion !== undefined) {
        updateFields.isOnPromotion = productData.isOnPromotion
      }
      updateFields.updatedAt = new Date()

      const [updated] = await db
        .update(products)
        .set(updateFields)
        .where(eq(products.id, productId))
        .returning()

      if (categoryIds !== undefined) {
        await db.delete(productCategories).where(eq(productCategories.productId, productId))
        if (categoryIds.length) {
          await db.insert(productCategories).values(
            categoryIds.map((categoryId: number) => ({ productId, categoryId }))
          )
        }
      }
      if (collectionIds !== undefined) {
        await db.delete(productCollections).where(eq(productCollections.productId, productId))
        if (collectionIds.length) {
          await db.insert(productCollections).values(
            collectionIds.map((collectionId: number) => ({ productId, collectionId }))
          )
        }
      }
      if (labelIds !== undefined) {
        await db.delete(productLabels).where(eq(productLabels.productId, productId))
        if (labelIds.length) {
          await db.insert(productLabels).values(
            labelIds.map((labelId: number) => ({ productId, labelId }))
          )
        }
      }
      if (variations !== undefined) {
        await db.delete(productVariations).where(eq(productVariations.productId, productId))
        if (variations.length) {
          await db.insert(productVariations).values(
            variations.map(
              (v: {
                name: string
                options: { name: string; priceAdjustment: number; stock: number }[]
              }) => ({
                productId,
                name: v.name,
                options: v.options,
              })
            )
          )
        }
      }
      if (modifiers !== undefined) {
        await db.delete(productModifiers).where(eq(productModifiers.productId, productId))
        if (modifiers.length) {
          await db.insert(productModifiers).values(
            modifiers.map((m: { name: string; required?: boolean; priceAdjustment?: number }) => ({
              productId,
              name: m.name,
              required: m.required ?? false,
              priceAdjustment: String(m.priceAdjustment ?? 0),
            }))
          )
        }
      }

      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(
        t.Object({
          name: t.String(),
          slug: t.String(),
          description: t.String(),
          basePrice: t.Number(),
          compareAtPrice: t.Nullable(t.Union([t.Number(), t.String()])),
          sku: t.String(),
          stock: t.Number(),
          images: t.Array(t.String()),
          isActive: t.Boolean(),
          isFeatured: t.Boolean(),
          isOnPromotion: t.Boolean(),
          categoryIds: t.Array(t.Number()),
          collectionIds: t.Array(t.Number()),
          labelIds: t.Array(t.Number()),
          variations: t.Array(
            t.Object({
              name: t.String(),
              options: t.Array(
                t.Object({ name: t.String(), priceAdjustment: t.Number(), stock: t.Number() })
              ),
            })
          ),
          modifiers: t.Array(
            t.Object({
              name: t.String(),
              required: t.Optional(t.Boolean()),
              priceAdjustment: t.Optional(t.Number()),
            })
          ),
        })
      ),
    }
  )

  .delete(
    "/products/:id",
    async ({ params }) => {
      const productId = parseInt(params.id, 10)
      const [linkedOrderItem] = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.productId, productId))
        .limit(1)

      // Products on past orders cannot be hard-deleted (FK). Deactivate instead.
      if (linkedOrderItem) {
        await db
          .update(products)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(products.id, productId))
        return { success: true, deactivated: true }
      }

      await db.delete(products).where(eq(products.id, productId))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
