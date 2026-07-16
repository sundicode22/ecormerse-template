import { Elysia } from "elysia"
import { productController } from "./controllers/product"
import { categoryController } from "./controllers/category"
import { collectionController } from "./controllers/collection"
import { labelController } from "./controllers/label"
import { orderController } from "./controllers/order"
import { uploadController } from "./controllers/upload"
import { presetController } from "./controllers/preset"
import { reviewController } from "./controllers/review"
import { userController } from "./controllers/user"
import { addressController } from "./controllers/address"
import { authController } from "./controllers/auth"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === "string") return message
  }
  return String(error)
}

export const app = new Elysia({ prefix: "/api" })
  .onError(({ code, error }) => {
    const message = getErrorMessage(error)
    console.error(`[Elysia Error] Code: ${code} - Msg: ${message}`)
    return {
      success: false,
      error: {
        message,
        code: String(code),
      },
    }
  })
  .mapResponse(({ response }) => {
    if (response && typeof response === "object" && "success" in response) {
      return response as never
    }
    if (response instanceof Response) {
      return response
    }
    return {
      success: true,
      data: response,
    } as never
  })
  .use(productController)
  .use(categoryController)
  .use(collectionController)
  .use(labelController)
  .use(orderController)
  .use(uploadController)
  .use(presetController)
  .use(reviewController)
  .use(userController)
  .use(addressController)
  .use(authController)

export type App = typeof app
export type { Product } from "@/hooks/api/useProducts"
export type { Category } from "@/hooks/api/useCategories"
export type { Collection } from "@/hooks/api/useCollections"
export type { Label } from "@/hooks/api/useLabels"
export type { Order } from "@/hooks/api/useOrders"
export type { Preset } from "@/hooks/api/usePresets"
export type { Review } from "@/hooks/api/useReviews"
export type { AdminUser } from "@/hooks/api/useUsers"
