import { Elysia } from "elysia"
import { auth } from "@/auth"

/**
 * Requires any authenticated session (customer or admin).
 */
export const requireAuth = new Elysia({ name: "require-auth" }).onBeforeHandle(
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
  }
)
