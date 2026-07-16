import { z } from "zod"

export const authEmailSchema = z.string().email("Enter a valid email address")

export const authPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")

export const signInSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: authEmailSchema,
    password: authPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const recoverSchema = z.object({
  email: authEmailSchema,
})

export const resetPasswordSchema = z
  .object({
    email: authEmailSchema,
    token: z.string().min(10, "Invalid reset link"),
    password: authPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const setPasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    password: authPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignInInput = z.infer<typeof signInSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RecoverInput = z.infer<typeof recoverSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type SetPasswordInput = z.infer<typeof setPasswordSchema>

export type AuthMode = "signin" | "register" | "recover" | "reset" | "link"
