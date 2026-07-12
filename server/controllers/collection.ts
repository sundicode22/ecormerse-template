import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import { collections } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/server/plugins/require-admin"
import { slugify } from "@/lib/slugify"

export const collectionController = new Elysia()
  .get("/collections", async () => {
    return await db.query.collections.findMany({
      orderBy: (collections, { asc }) => [asc(collections.name)],
    })
  })
  .use(requireAdmin)
  .post(
    "/collections",
    async ({ body }) => {
      const [newCollection] = await db
        .insert(collections)
        .values({
          ...body,
          slug: slugify(body.name) || body.slug,
        })
        .returning()
      return newCollection
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        description: t.Optional(t.String()),
        image: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/collections/:id",
    async ({ params, body }) => {
      const [updated] = await db
        .update(collections)
        .set({
          ...body,
          ...(body.name ? { slug: slugify(body.name) || body.slug } : {}),
          updatedAt: new Date(),
        })
        .where(eq(collections.id, parseInt(params.id)))
        .returning()
      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(
        t.Object({
          name: t.String(),
          slug: t.String(),
          description: t.String(),
          image: t.String(),
        })
      ),
    }
  )
  .delete(
    "/collections/:id",
    async ({ params }) => {
      await db.delete(collections).where(eq(collections.id, parseInt(params.id)))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
