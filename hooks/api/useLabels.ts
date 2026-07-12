import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { CreateLabelInput, UpdateLabelInput } from "@/lib/validations/label"
import type { ApiResponse } from "@/types/api"

export type Label = {
  id: number
  name: string
  color: string | null
  createdAt: string | null
  updatedAt: string | null
}

export function useLabels() {
  return useQuery<ApiResponse<Label[]>>({
    queryKey: ["labels"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Label[]>>("/labels")
      return data
    },
  })
}

export function useCreateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateLabelInput) => {
      const { data } = await apiClient.post<ApiResponse<Label>>("/labels", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      notify.success("Label created")
    },
    onError: () => {
      notify.error("Failed to create label")
    },
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLabelInput & { id: number }) => {
      const { data } = await apiClient.put<ApiResponse<Label>>(`/labels/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      notify.success("Label updated")
    },
    onError: () => {
      notify.error("Failed to update label")
    },
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/labels/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      notify.success("Label deleted")
    },
    onError: () => {
      notify.error("Failed to delete label")
    },
  })
}
