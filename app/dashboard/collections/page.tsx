"use client"

import { Suspense } from "react"
import { useCollections } from "@/hooks/api/useCollections"
import { useCollectionColumns } from "@/components/dashboard/collections/collection-columns"
import { CollectionForm } from "@/components/dashboard/collections/collection-form"
import { DataTable } from "@/components/shared/data-table"
import { PageModal, usePageModal } from "@/components/shared/page-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function CollectionsContent() {
  const { data: collectionsResponse, isLoading } = useCollections()
  const collections = collectionsResponse?.data || []
  const columns = useCollectionColumns()
  const { openModal, getParam } = usePageModal()

  const editId = getParam("id")
  const editingCollection = editId
    ? collections.find((c) => c.id === Number(editId))
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
        <Button onClick={() => openModal("create-collection")}>
          + Add Collection
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
          data={collections}
          searchKey="name"
          searchPlaceholder="Search collections..."
        />
      )}

      <PageModal
        modalKey="create-collection"
        title="Create Collection"
        description="Add a new product collection."
      >
        <CollectionForm />
      </PageModal>

      <PageModal
        modalKey="edit-collection"
        title="Edit Collection"
        description="Update collection details."
      >
        <CollectionForm collection={editingCollection} />
      </PageModal>
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <CollectionsContent />
    </Suspense>
  )
}
