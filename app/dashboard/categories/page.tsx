"use client"

import { Suspense } from "react"
import { useCategories } from "@/hooks/api/useCategories"
import { useCategoryColumns } from "@/components/dashboard/categories/category-columns"
import { CategoryForm } from "@/components/dashboard/categories/category-form"
import { DataTable } from "@/components/shared/data-table"
import { PageModal, usePageModal } from "@/components/shared/page-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function CategoriesContent() {
  const { data: categoriesResponse, isLoading } = useCategories()
  const categories = categoriesResponse?.data || []
  const columns = useCategoryColumns()
  const { openModal, getParam } = usePageModal()

  const editId = getParam("id")
  const editingCategory = editId
    ? categories.find((c) => c.id === Number(editId))
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => openModal("create-category")}>
          + Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories..."
        />
      )}

      <PageModal
        modalKey="create-category"
        title="Create Category"
        description="Add a new product category."
      >
        <CategoryForm />
      </PageModal>

      <PageModal
        modalKey="edit-category"
        title="Edit Category"
        description="Update category details."
      >
        <CategoryForm category={editingCategory} />
      </PageModal>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <CategoriesContent />
    </Suspense>
  )
}
