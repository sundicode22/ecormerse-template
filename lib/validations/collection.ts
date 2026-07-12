import { z } from "zod"

const optionalImage = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().url("Must be a valid image URL").optional()
)

export const createCollectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  image: optionalImage,
})

export const updateCollectionSchema = createCollectionSchema.partial()

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
