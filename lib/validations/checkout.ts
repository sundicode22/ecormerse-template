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

export const paymentMethodSchema = z.enum(["mtn", "orange", "whatsapp"])

export const checkoutSchema = z
  .object({
    deliveryType: z.enum(["pickup", "local", "international"]),
    shippingAddress: shippingAddressDraftSchema,
    paymentMethod: paymentMethodSchema,
    paymentPhone: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "pickup") {
      const result = pickupContactSchema.safeParse({
        name: data.shippingAddress.name,
        phone: data.shippingAddress.phone,
      })
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ["shippingAddress", ...issue.path],
          })
        }
      }
    } else {
      const result = shippingAddressSchema.safeParse(data.shippingAddress)
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ["shippingAddress", ...issue.path],
          })
        }
      }
    }

    if (data.paymentMethod === "mtn" || data.paymentMethod === "orange") {
      const phone = data.paymentPhone.trim()
      if (phone.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentPhone"],
          message: "Enter your Mobile Money number",
        })
      }
    }
  })

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
