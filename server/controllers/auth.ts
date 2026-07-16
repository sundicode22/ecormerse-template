import { Elysia, t } from "elysia"
import { and, eq } from "drizzle-orm"
import { createHash, randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accounts, users, verificationTokens } from "@/lib/db/schema"
import { ROLES } from "@/lib/auth/roles"
import { requireAuth } from "@/server/plugins/require-auth"

function siteUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

function shouldExposeResetLink() {
  if (process.env.AUTH_SHOW_RESET_LINK === "true") return true
  if (process.env.AUTH_SHOW_RESET_LINK === "false") return false
  return process.env.NODE_ENV !== "production"
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/register",
    async ({ body, set }) => {
      const email = body.email.trim().toLowerCase()
      const name = body.name.trim()

      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (existing?.password) {
        set.status = 409
        throw new Error("An account with this email already exists. Sign in instead.")
      }

      if (existing && !existing.password) {
        set.status = 409
        throw new Error(
          "This email is linked to Google. Sign in with Google, then set a password to enable email login."
        )
      }

      const passwordHash = await bcrypt.hash(body.password, 12)
      const [created] = await db
        .insert(users)
        .values({
          name,
          email,
          password: passwordHash,
          role: ROLES.USER,
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        })

      return {
        user: created,
        message: "Account created. You can sign in now.",
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .post(
    "/account-status",
    async ({ body }) => {
      const email = body.email.trim().toLowerCase()
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user) {
        return {
          exists: false,
          hasPassword: false,
          hasGoogle: false,
        }
      }

      const googleAccount = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.provider, "google")),
      })

      return {
        exists: true,
        hasPassword: Boolean(user.password),
        hasGoogle: Boolean(googleAccount),
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .post(
    "/forgot-password",
    async ({ body }) => {
      const email = body.email.trim().toLowerCase()
      const genericMessage =
        "If an account exists for that email, a reset link is ready."

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user?.password) {
        return {
          message: genericMessage,
          resetUrl: null as string | null,
        }
      }

      const rawToken = randomBytes(32).toString("hex")
      const token = hashToken(rawToken)
      const expires = new Date(Date.now() + 60 * 60 * 1000)

      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, email))

      await db.insert(verificationTokens).values({
        identifier: email,
        token,
        expires,
      })

      const resetUrl = `${siteUrl()}/login?mode=reset&email=${encodeURIComponent(email)}&token=${rawToken}`
      console.log(`[Auth] Password reset link for ${email}: ${resetUrl}`)

      return {
        message: genericMessage,
        resetUrl: shouldExposeResetLink() ? resetUrl : null,
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .post(
    "/reset-password",
    async ({ body, set }) => {
      const email = body.email.trim().toLowerCase()
      const tokenHash = hashToken(body.token)

      const record = await db.query.verificationTokens.findFirst({
        where: and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, tokenHash)
        ),
      })

      if (!record || record.expires.getTime() < Date.now()) {
        set.status = 400
        throw new Error("This reset link is invalid or has expired.")
      }

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user) {
        set.status = 400
        throw new Error("This reset link is invalid or has expired.")
      }

      const passwordHash = await bcrypt.hash(body.password, 12)
      await db
        .update(users)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(users.id, user.id))

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, tokenHash)
          )
        )

      return { message: "Password updated. You can sign in now." }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        token: t.String({ minLength: 10 }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .use(requireAuth)
  .post(
    "/set-password",
    async ({ body, set }) => {
      const session = await auth()
      const userId = session!.user.id

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        set.status = 404
        throw new Error("User not found")
      }

      if (user.password) {
        if (!body.currentPassword) {
          set.status = 400
          throw new Error("Current password is required")
        }
        const match = await bcrypt.compare(body.currentPassword, user.password)
        if (!match) {
          set.status = 400
          throw new Error("Current password is incorrect")
        }
      }

      const passwordHash = await bcrypt.hash(body.password, 12)
      await db
        .update(users)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(users.id, userId))

      return {
        message: user.password
          ? "Password updated."
          : "Password set. You can now sign in with email as well as Google.",
        linked: !user.password,
      }
    },
    {
      body: t.Object({
        currentPassword: t.Optional(t.String()),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .get("/me", async () => {
    const session = await auth()
    const userId = session!.user.id
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        password: true,
      },
    })

    if (!user) {
      return null
    }

    const googleAccount = await db.query.accounts.findFirst({
      where: and(eq(accounts.userId, user.id), eq(accounts.provider, "google")),
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      hasPassword: Boolean(user.password),
      hasGoogle: Boolean(googleAccount),
    }
  })
