import { z } from "zod"
import { signInSchema } from "@/lib/validations/auth"

/** @deprecated Prefer signInSchema from `@/lib/validations/auth` */
export const loginSchema = signInSchema

export type LoginInput = z.infer<typeof loginSchema>
