import { z } from "zod"
import { ROLES } from "@/lib/auth/roles"

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum([ROLES.ADMIN, ROLES.USER]).default(ROLES.ADMIN),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum([ROLES.ADMIN, ROLES.USER]).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number")
    .optional()
    .or(z.literal("")),
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
