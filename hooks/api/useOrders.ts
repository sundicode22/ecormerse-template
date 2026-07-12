import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { ApiResponse } from "@/types/api"

export type Order = {
  id: string
  userId: string
  status: string
  totalAmount: string
  deliveryType: string
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  } | null
  createdAt: string | null
  updatedAt: string | null
  items?: {
    id: number
    productId: number
    quantity: number
    price: string
  }[]
}

export function useOrders() {
  return useQuery<ApiResponse<Order[]>>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Order[]>>("/orders")
      return data
    },
  })
}

export function useMyOrders() {
  return useQuery<ApiResponse<Order[]>>({
    queryKey: ["orders", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Order[]>>("/orders/me")
      return data
    },
  })
}

export function useDeliveryOrders() {
  return useQuery<ApiResponse<Order[]>>({
    queryKey: ["orders", "deliveries"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Order[]>>(
        "/orders/deliveries"
      )
      return data
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const toastId = notify.loading("Updating order status…")
      try {
        const { data } = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, { status })
        notify.dismiss(toastId)
        notify.success("Order status updated", `Marked as ${status}`)
        return data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error("Failed to update order status")
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderInput: {
      deliveryType: string
      totalAmount: number
      shippingAddress?: Order["shippingAddress"]
      items: {
        productId: number
        quantity: number
        price: number
        selectedVariations?: Record<string, string>
        selectedModifiers?: string[]
      }[]
    }) => {
      const toastId = notify.loading("Placing your order…")
      try {
        const { data } = await apiClient.post<ApiResponse<Order>>("/orders", orderInput)
        notify.dismiss(toastId)
        notify.success("Order placed", "Thank you for shopping at SAAKINUN.")
        return data
      } catch (error) {
        notify.dismiss(toastId)
        notify.error("Could not place order", "Please try again.")
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] })
    },
  })
}
