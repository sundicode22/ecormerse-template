import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category"
import type { ApiResponse } from "@/types/api"

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: number | null
  createdAt: string | null
  updatedAt: string | null
}

export function useCategories() {
  return useQuery<ApiResponse<Category[]>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories")
      return data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data } = await apiClient.post<ApiResponse<Category>>("/categories", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notify.success("Category created")
    },
    onError: () => {
      notify.error("Failed to create category")
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCategoryInput & { id: number }) => {
      const { data } = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notify.success("Category updated")
    },
    onError: () => {
      notify.error("Failed to update category")
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/categories/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      notify.success("Category deleted")
    },
    onError: () => {
      notify.error("Failed to delete category")
    },
  })
}
