import { z } from "zod"

export const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  authorName: z.string().min(1, "Name is required").max(80),
  rating: z.number().int().min(1, "Select a rating").max(5),
  title: z
    .string()
    .max(120, "Title is too long")
    .optional()
    .or(z.literal("")),
  body: z.string().min(5, "Review must be at least 5 characters").max(2000),
})

export const reviewFormSchema = createReviewSchema.omit({ productId: true })

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReviewFormInput = z.infer<typeof reviewFormSchema>
