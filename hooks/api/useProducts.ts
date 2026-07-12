import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { notify } from "@/lib/toast"
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations/product"
import type { ApiResponse } from "@/types/api"

export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  basePrice: string
  compareAtPrice: string | null
  sku: string | null
  stock: number
  images: string[] | null
  isActive: boolean | null
  isFeatured: boolean | null
  isOnPromotion: boolean | null
  createdAt: string | null
  updatedAt: string | null
  productCategories?: { categoryId: number }[]
  productCollections?: { collectionId: number }[]
  productLabels?: { labelId: number }[]
  variations?: { id: number; name: string; options: { name: string; priceAdjustment: number; stock: number }[] }[]
  modifiers?: { id: number; name: string; required: boolean; priceAdjustment: string }[]
}

export function useProducts() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product[]>>("/products")
      return data
    },
  })
}

export function useProduct(id: number | null) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useProductBySlug(slug: string | null) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ["products", "slug", slug],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product>>(`/products/by-slug/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const { data } = await apiClient.post<ApiResponse<Product>>("/products", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      notify.success("Product created")
    },
    onError: () => {
      notify.error("Failed to create product")
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProductInput & { id: number }) => {
      const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      notify.success("Product updated")
    },
    onError: () => {
      notify.error("Failed to update product")
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<{ success: boolean; deactivated?: boolean }>>(
        `/products/${id}`
      )
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      if (result.data?.deactivated) {
        notify.info("Product deactivated", "It appears on past orders and was marked inactive.")
      } else {
        notify.success("Product deleted")
      }
    },
    onError: () => {
      notify.error("Failed to delete product")
    },
  })
}
