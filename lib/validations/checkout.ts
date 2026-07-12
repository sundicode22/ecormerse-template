import { z } from "zod"

export const shippingAddressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  line1: z.string().min(2, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(6, "Phone number is required"),
})

/** Form draft — always present; strict rules applied in superRefine by delivery type. */
const shippingAddressDraftSchema = z.object({
  name: z.string(),
  line1: z.string(),
  line2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
})

const pickupContactSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Phone number is required"),
})

export const checkoutSchema = z
  .object({
    deliveryType: z.enum(["pickup", "local", "international"]),
    shippingAddress: shippingAddressDraftSchema,
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "pickup") {
      const result = pickupContactSchema.safeParse({
        name: data.shippingAddress.name,
        phone: data.shippingAddress.phone,
      })
      if (result.success) return
      for (const issue of result.error.issues) {
        ctx.addIssue({
          ...issue,
          path: ["shippingAddress", ...issue.path],
        })
      }
      return
    }

    const result = shippingAddressSchema.safeParse(data.shippingAddress)
    if (result.success) return
    for (const issue of result.error.issues) {
      ctx.addIssue({
        ...issue,
        path: ["shippingAddress", ...issue.path],
      })
    }
  })

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
