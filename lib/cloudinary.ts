import { v2 as cloudinary } from "cloudinary"

let configured = false

export function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    )
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
    configured = true
  }

  return cloudinary
}

export async function uploadImageToCloudinary(
  file: File,
  folder = "shop"
): Promise<{ url: string; publicId: string }> {
  const cloudinary = getCloudinary()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const result = await new Promise<{
    secure_url: string
    public_id: string
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      },
      (error, uploaded) => {
        if (error || !uploaded?.secure_url) {
          reject(
            new Error(error?.message || "Cloudinary upload failed")
          )
          return
        }
        resolve({
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        })
      }
    )
    stream.end(buffer)
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}
