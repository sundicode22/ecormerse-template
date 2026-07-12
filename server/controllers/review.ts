import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { requireAdmin } from "@/server/plugins/require-admin"

const publicReviews = new Elysia()
  .get(
    "/reviews",
    async ({ query }) => {
      const productId = query.productId ? parseInt(query.productId, 10) : null
      const limit = query.limit ? parseInt(query.limit, 10) : 20
      const safeLimit = Number.isNaN(limit) ? 20 : Math.min(Math.max(limit, 1), 50)

      const conditions = [eq(reviews.isPublished, true)]
      if (productId && !Number.isNaN(productId)) {
        conditions.push(eq(reviews.productId, productId))
      }

      try {
        return await db.query.reviews.findMany({
          where: and(...conditions),
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
          orderBy: [desc(reviews.createdAt)],
          limit: safeLimit,
        })
      } catch (error) {
        console.error("[reviews] list failed, falling back without relations", error)
        // Still return reviews even if product relation join fails
        return await db.query.reviews.findMany({
          where: and(...conditions),
          orderBy: [desc(reviews.createdAt)],
          limit: safeLimit,
        })
      }
    },
    {
      query: t.Object({
        productId: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/reviews",
    async ({ body, set }) => {
      const session = await auth()
      if (!session?.user?.id) {
        set.status = 401
        return {
          success: false,
          error: { message: "Sign in to leave a review", code: "UNAUTHORIZED" },
        }
      }

      if (body.rating < 1 || body.rating > 5) {
        set.status = 400
        return {
          success: false,
          error: { message: "Rating must be between 1 and 5", code: "BAD_REQUEST" },
        }
      }

      const [created] = await db
        .insert(reviews)
        .values({
          productId: body.productId,
          userId: session.user.id,
          authorName: body.authorName?.trim() || session.user.name || "Customer",
          rating: body.rating,
          title: body.title?.trim() || null,
          body: body.body.trim(),
          isPublished: true,
        })
        .returning()

      return created
    },
    {
      body: t.Object({
        productId: t.Number(),
        authorName: t.String(),
        rating: t.Number(),
        title: t.Optional(t.String()),
        body: t.String(),
      }),
    }
  )

const adminReviews = new Elysia()
  .use(requireAdmin)
  .delete(
    "/reviews/:id",
    async ({ params }) => {
      await db.delete(reviews).where(eq(reviews.id, parseInt(params.id, 10)))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .put(
    "/reviews/:id",
    async ({ params, body }) => {
      const [updated] = await db
        .update(reviews)
        .set({
          ...(body.isPublished !== undefined
            ? { isPublished: body.isPublished }
            : {}),
        })
        .where(eq(reviews.id, parseInt(params.id, 10)))
        .returning()
      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        isPublished: t.Optional(t.Boolean()),
      }),
    }
  )

export const reviewController = new Elysia()
  .use(publicReviews)
  .use(adminReviews)
