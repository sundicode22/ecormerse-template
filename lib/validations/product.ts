import { z } from "zod"

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined
  if (typeof value === "number" && Number.isNaN(value)) return undefined
  return value
}

export const variationOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  priceAdjustment: z.coerce.number().default(0),
  stock: z.coerce.number().int().min(0).default(0),
})

export const variationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  options: z.array(variationOptionSchema).min(1, "At least one option is required"),
})

export const modifierSchema = z.object({
  name: z.string().min(1, "Modifier name is required"),
  required: z.boolean(),
  priceAdjustment: z.coerce.number(),
})

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  // Auto-generated from name — validated after slugify on submit/server
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive("Compare at price must be positive").optional()
  ),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "Add at least one product image"),
  isActive: z.boolean(),
  isFeatured: z.boolean().default(false),
  isOnPromotion: z.boolean().default(false),
  categoryIds: z.array(z.number()),
  collectionIds: z.array(z.number()),
  labelIds: z.array(z.number()),
  variations: z.array(variationSchema),
  modifiers: z.array(modifierSchema),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type VariationInput = z.infer<typeof variationSchema>
export type ModifierInput = z.infer<typeof modifierSchema>
