"use client"

import { Suspense } from "react"
import { useProducts } from "@/hooks/api/useProducts"
import { useProductColumns } from "@/components/dashboard/products/product-columns"
import { ProductForm } from "@/components/dashboard/products/product-form"
import { DataTable } from "@/components/shared/data-table"
import { PageModal, usePageModal } from "@/components/shared/page-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function ProductsContent() {
  const { data: productsResponse, isLoading } = useProducts()
  const products = productsResponse?.data || []
  const columns = useProductColumns()
  const { openModal, getParam } = usePageModal()

  const editId = getParam("id")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => openModal("create-product")}>
          + Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products..."
          filters={[
            {
              id: "isActive",
              label: "Status",
              options: [
                { label: "Active", value: "true" },
                { label: "Draft", value: "false" },
              ],
            },
          ]}
        />
      )}

      <PageModal
        modalKey="create-product"
        title="Create Product"
        description="Add a new product to your store."
      >
        <ProductForm />
      </PageModal>

      <PageModal
        modalKey="edit-product"
        title="Edit Product"
        description="Update product details."
      >
        <ProductForm productId={editId ? Number(editId) : null} />
      </PageModal>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}
