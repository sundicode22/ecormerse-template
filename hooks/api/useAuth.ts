import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"

export type AccountStatus = {
  exists: boolean
  hasPassword: boolean
  hasGoogle: boolean
}

export type AuthMe = {
  id: string
  name: string | null
  email: string | null
  role: string | null
  image: string | null
  hasPassword: boolean
  hasGoogle: boolean
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: { message?: string } } } })
      .response?.data?.error?.message === "string"
  ) {
    return (
      (error as { response: { data: { error: { message: string } } } }).response
        .data.error.message || fallback
    )
  }
  return fallback
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: {
      name: string
      email: string
      password: string
    }) => {
      const { data } = await apiClient.post<
        ApiResponse<{ user: { id: string }; message: string }>
      >("/auth/register", input)
      return data
    },
  })
}

export function useAccountStatus() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<ApiResponse<AccountStatus>>(
        "/auth/account-status",
        { email }
      )
      return data.data
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<
        ApiResponse<{ message: string; resetUrl: string | null }>
      >("/auth/forgot-password", { email })
      return data.data
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: {
      email: string
      token: string
      password: string
    }) => {
      const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
        "/auth/reset-password",
        input
      )
      return data.data
    },
  })
}

export function useSetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      currentPassword?: string
      password: string
    }) => {
      const toastId = notify.loading("Saving password…")
      try {
        const { data } = await apiClient.post<
          ApiResponse<{ message: string; linked: boolean }>
        >("/auth/set-password", input)
        notify.dismiss(toastId)
        notify.success(data.data.message)
        return data.data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error(apiErrorMessage(error, "Could not save password"))
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })
}

export function useAuthMe(enabled = true) {
  return useQuery({
    queryKey: ["auth", "me"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AuthMe | null>>("/auth/me")
      return data.data
    },
  })
}

export { apiErrorMessage }
