import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"

export type SavedAddress = {
  id: number
  userId: string
  label: string | null
  name: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

export type AddressInput = {
  label?: string
  name: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export function useAddresses(enabled = true) {
  return useQuery<ApiResponse<SavedAddress[]>>({
    queryKey: ["addresses"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SavedAddress[]>>(
        "/addresses"
      )
      return data
    },
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddressInput) => {
      const toastId = notify.loading("Saving address…")
      try {
        const { data } = await apiClient.post<ApiResponse<SavedAddress>>(
          "/addresses",
          input
        )
        notify.dismiss(toastId)
        notify.success("Address saved")
        return data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error("Failed to save address")
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-addresses"] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const toastId = notify.loading("Deleting address…")
      try {
        const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(
          `/addresses/${id}`
        )
        notify.dismiss(toastId)
        notify.success("Address deleted")
        return data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error("Failed to delete address")
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-addresses"] })
    },
  })
}

export type AdminAddress = SavedAddress & {
  user?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export function useAdminAddresses() {
  return useQuery<ApiResponse<AdminAddress[]>>({
    queryKey: ["admin-addresses"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AdminAddress[]>>(
        "/addresses/admin/all"
      )
      return data
    },
  })
}

export function useAdminDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const toastId = notify.loading("Deleting address…")
      try {
        const { data } = await apiClient.delete<ApiResponse<{ id: number }>>(
          `/addresses/admin/${id}`
        )
        notify.dismiss(toastId)
        notify.success("Address deleted")
        return data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error("Failed to delete address")
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-addresses"] })
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}
