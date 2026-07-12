import { z } from "zod"

const optionalImage = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().url("Must be a valid image URL").optional()
)

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  image: optionalImage,
  parentId: z.number().optional().nullable(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
