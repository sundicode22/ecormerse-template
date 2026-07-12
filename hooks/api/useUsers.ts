import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"
import type { CreateAdminInput, UpdateUserInput } from "@/lib/validations/user"

export type AdminUser = {
  id: string
  name: string | null
  email: string | null
  role: string
  image: string | null
  emailVerified: string | null
  createdAt: string | null
  updatedAt: string | null
}

export function useUsers() {
  return useQuery<ApiResponse<AdminUser[]>>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AdminUser[]>>("/users")
      return data
    },
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateAdminInput) => {
      const { data } = await apiClient.post<ApiResponse<AdminUser>>("/users", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      notify.success("Admin created")
    },
    onError: () => {
      notify.error("Failed to create admin")
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateUserInput & { id: string }) => {
      const payload = {
        ...input,
        password: input.password ? input.password : undefined,
      }
      const { data } = await apiClient.put<ApiResponse<AdminUser>>(
        `/users/${id}`,
        payload
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      notify.success("User updated")
    },
    onError: () => {
      notify.error("Failed to update user")
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/users/${id}`
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      notify.success("User deleted")
    },
    onError: () => {
      notify.error("Failed to delete user")
    },
  })
}
