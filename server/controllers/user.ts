import { Elysia, t } from "elysia"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { requireAdmin } from "@/server/plugins/require-admin"
import { ROLES } from "@/lib/auth/roles"

function toPublicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? ROLES.USER,
    image: user.image,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const userController = new Elysia()
  .use(requireAdmin)
  .get("/users", async () => {
    const rows = await db.query.users.findMany({
      orderBy: (usersTable, { desc }) => [desc(usersTable.email)],
    })
    return rows.map(toPublicUser)
  })
  .post(
    "/users",
    async ({ body }) => {
      const email = body.email.trim().toLowerCase()
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (existing) {
        throw new Error("A user with this email already exists")
      }

      const passwordHash = await bcrypt.hash(body.password, 12)
      const [created] = await db
        .insert(users)
        .values({
          name: body.name.trim(),
          email,
          password: passwordHash,
          role: body.role || ROLES.ADMIN,
        })
        .returning()

      return toPublicUser(created)
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
      }),
    }
  )
  .put(
    "/users/:id",
    async ({ params, body }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.id, params.id),
      })
      if (!existing) throw new Error("User not found")

      const updates: Partial<typeof users.$inferInsert> = {
        updatedAt: new Date(),
      }
      if (body.name !== undefined) updates.name = body.name.trim()
      if (body.role !== undefined) updates.role = body.role
      if (body.password) {
        updates.password = await bcrypt.hash(body.password, 12)
      }

      const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, params.id))
        .returning()

      return toPublicUser(updated)
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        role: t.Optional(t.Union([t.Literal("admin"), t.Literal("user")])),
        password: t.Optional(t.String({ minLength: 8 })),
      }),
    }
  )
  .delete(
    "/users/:id",
    async ({ params }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.id, params.id),
      })
      if (!existing) throw new Error("User not found")

      if (existing.role === ROLES.ADMIN) {
        const admins = await db.query.users.findMany({
          where: eq(users.role, ROLES.ADMIN),
        })
        if (admins.length <= 1) {
          throw new Error("Cannot delete the last admin account")
        }
      }

      await db.delete(users).where(eq(users.id, params.id))
      return { success: true }
    },
    { params: t.Object({ id: t.String() }) }
  )
