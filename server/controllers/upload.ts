import { Elysia } from "elysia"
import { requireAdmin } from "@/server/plugins/require-admin"
import { uploadImageToCloudinary } from "@/lib/cloudinary"

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

export const uploadController = new Elysia()
  .use(requireAdmin)
  .post("/upload", async ({ request, set }) => {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      set.status = 400
      throw new Error("No file provided")
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      set.status = 400
      throw new Error("Only JPG, PNG, WebP, GIF, and AVIF images are allowed")
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      set.status = 400
      throw new Error("Image must be between 1 byte and 8MB")
    }

    const uploaded = await uploadImageToCloudinary(file, "shop")
    return {
      url: uploaded.url,
      publicId: uploaded.publicId,
    }
  })
