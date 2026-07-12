import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { CreateCollectionInput, UpdateCollectionInput } from "@/lib/validations/collection"
import type { ApiResponse } from "@/types/api"

export type Collection = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string | null
  updatedAt: string | null
}

export function useCollections() {
  return useQuery<ApiResponse<Collection[]>>({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Collection[]>>("/collections")
      return data
    },
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const { data } = await apiClient.post<ApiResponse<Collection>>("/collections", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      notify.success("Collection created")
    },
    onError: () => {
      notify.error("Failed to create collection")
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCollectionInput & { id: number }) => {
      const { data } = await apiClient.put<ApiResponse<Collection>>(`/collections/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      notify.success("Collection updated")
    },
    onError: () => {
      notify.error("Failed to update collection")
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/collections/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      notify.success("Collection deleted")
    },
    onError: () => {
      notify.error("Failed to delete collection")
    },
  })
}
