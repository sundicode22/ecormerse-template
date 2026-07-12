import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"

/**
 * Hook for uploading files to Cloudinary via our backend.
 * Returns the Cloudinary URL of the uploaded file.
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const toastId = notify.loading("Uploading image…")
      try {
        const formData = new FormData()
        formData.append("file", file)
        const { data } = await apiClient.post<
          ApiResponse<{ url: string; publicId?: string }>
        >("/upload", formData)
        const url = data.data?.url
        if (!url) {
          throw new Error(data.error?.message || "Upload failed")
        }
        notify.dismiss(toastId)
        notify.success("Image uploaded")
        return url
      } catch (error) {
        notify.dismiss(toastId)
        notify.error(
          error instanceof Error ? error.message : "Upload failed"
        )
        throw error
      }
    },
  })
}
