import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api"

export type Preset = {
  id: number
  name: string
  type: string // "variation" | "modifier"
  data: unknown
  createdAt: string | null
}

export function usePresets(type?: string) {
  return useQuery<ApiResponse<Preset[]>>({
    queryKey: ["presets", type],
    queryFn: async () => {
      const params = type ? { type } : {}
      const { data } = await apiClient.get<ApiResponse<Preset[]>>("/presets", { params })
      return data
    },
  })
}

export function useCreatePreset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; type: string; data: unknown }) => {
      const { data } = await apiClient.post<ApiResponse<Preset>>("/presets", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] })
    },
  })
}

export function useDeletePreset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/presets/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] })
    },
  })
}
