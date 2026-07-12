import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/server/plugins/require-admin"
import { slugify } from "@/lib/slugify"

export const categoryController = new Elysia()
  .get("/categories", async () => {
    return await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    })
  })
  .use(requireAdmin)
  .post(
    "/categories",
    async ({ body }) => {
      const [newCategory] = await db
        .insert(categories)
        .values({
          ...body,
          slug: slugify(body.name) || body.slug,
        })
        .returning()
      return newCategory
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        description: t.Optional(t.String()),
        image: t.Optional(t.String()),
        parentId: t.Optional(t.Nullable(t.Number())),
      }),
    }
  )
  .put(
    "/categories/:id",
    async ({ params, body }) => {
      const [updated] = await db
        .update(categories)
        .set({
          ...body,
          ...(body.name ? { slug: slugify(body.name) || body.slug } : {}),
          updatedAt: new Date(),
        })
        .where(eq(categories.id, parseInt(params.id)))
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
          parentId: t.Nullable(t.Number()),
        })
      ),
    }
  )
  .delete(
    "/categories/:id",
    async ({ params }) => {
      await db.delete(categories).where(eq(categories.id, parseInt(params.id)))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
