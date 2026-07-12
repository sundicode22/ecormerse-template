import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import { labels } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/server/plugins/require-admin"

export const labelController = new Elysia()
  .get("/labels", async () => {
    return await db.query.labels.findMany({
      orderBy: (labels, { asc }) => [asc(labels.name)],
    })
  })
  .use(requireAdmin)
  .post(
    "/labels",
    async ({ body }) => {
      const [newLabel] = await db.insert(labels).values(body).returning()
      return newLabel
    },
    {
      body: t.Object({
        name: t.String(),
        color: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/labels/:id",
    async ({ params, body }) => {
      const [updated] = await db
        .update(labels)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(labels.id, parseInt(params.id)))
        .returning()
      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(t.Object({ name: t.String(), color: t.String() })),
    }
  )
  .delete(
    "/labels/:id",
    async ({ params }) => {
      await db.delete(labels).where(eq(labels.id, parseInt(params.id)))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
