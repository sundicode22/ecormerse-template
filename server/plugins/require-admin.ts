import { Elysia } from "elysia"
import { auth } from "@/auth"
import { isAdmin } from "@/lib/auth/roles"

/**
 * Requires an authenticated admin session.
 * Apply after public GET routes so only subsequent handlers are protected.
 */
export const requireAdmin = new Elysia({ name: "require-admin" }).onBeforeHandle(
  { as: "scoped" },
  async ({ set }) => {
    const session = await auth()

    if (!session?.user) {
      set.status = 401
      return {
        success: false,
        error: {
          message: "Authentication required",
          code: "UNAUTHORIZED",
        },
      }
    }

    if (!isAdmin(session.user.role)) {
      set.status = 403
      return {
        success: false,
        error: {
          message: "Admin access required",
          code: "FORBIDDEN",
        },
      }
    }
  }
)
