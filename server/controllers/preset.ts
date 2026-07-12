import { Elysia, t } from "elysia"
import { db } from "@/lib/db"
import { presets } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/server/plugins/require-admin"

export const presetController = new Elysia()
  .get("/presets", async ({ query }) => {
    if (query.type) {
      return await db.query.presets.findMany({
        where: eq(presets.type, query.type),
      })
    }
    return await db.query.presets.findMany()
  })
  .use(requireAdmin)
  .post(
    "/presets",
    async ({ body }) => {
      const [newPreset] = await db.insert(presets).values(body).returning()
      return newPreset
    },
    {
      body: t.Object({
        name: t.String(),
        type: t.String(),
        data: t.Any(),
      }),
    }
  )
  .delete(
    "/presets/:id",
    async ({ params }) => {
      await db.delete(presets).where(eq(presets.id, parseInt(params.id)))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
