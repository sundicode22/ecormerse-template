import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"
import type { CreateReviewInput } from "@/lib/validations/review"

export type Review = {
  id: number
  productId: number
  userId: string | null
  authorName: string
  rating: number
  title: string | null
  body: string
  isPublished: boolean | null
  createdAt: string | null
  product?: {
    id: number
    name: string
    slug: string
    images: string[] | null
  } | null
}

function unwrapReviews(payload: unknown): Review[] {
  if (Array.isArray(payload)) return payload as Review[]
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as ApiResponse<Review[]>).data)
  ) {
    return (payload as ApiResponse<Review[]>).data
  }
  return []
}

export function useReviews(params?: { productId?: number; limit?: number }) {
  return useQuery({
    queryKey: ["reviews", params?.productId ?? "all", params?.limit ?? 20],
    queryFn: async (): Promise<Review[]> => {
      const search = new URLSearchParams()
      if (params?.productId) search.set("productId", String(params.productId))
      if (params?.limit) search.set("limit", String(params.limit))
      const qs = search.toString()
      const { data } = await apiClient.get(`/reviews${qs ? `?${qs}` : ""}`)

      if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        (data as ApiResponse<Review[]>).success === false
      ) {
        throw new Error(
          (data as ApiResponse<Review[]>).error?.message ||
            "Could not load reviews"
        )
      }

      return unwrapReviews(data)
    },
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data } = await apiClient.post<ApiResponse<Review>>("/reviews", input)
      if (data && data.success === false) {
        throw new Error(data.error?.message || "Could not submit review")
      }
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      })
      notify.success("Review submitted")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Could not submit review"
      notify.error(message)
    },
  })
}
