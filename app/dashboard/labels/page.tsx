"use client"

import { Suspense } from "react"
import { useLabels } from "@/hooks/api/useLabels"
import { useLabelColumns } from "@/components/dashboard/labels/label-columns"
import { LabelForm } from "@/components/dashboard/labels/label-form"
import { DataTable } from "@/components/shared/data-table"
import { PageModal, usePageModal } from "@/components/shared/page-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function LabelsContent() {
  const { data: labelsResponse, isLoading } = useLabels()
  const labels = labelsResponse?.data || []
  const columns = useLabelColumns()
  const { openModal, getParam } = usePageModal()

  const editId = getParam("id")
  const editingLabel = editId
    ? labels.find((l) => l.id === Number(editId))
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Labels</h1>
        <Button onClick={() => openModal("create-label")}>
          + Add Label
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
          data={labels}
          searchKey="name"
          searchPlaceholder="Search labels..."
          filters={[{ id: "color", label: "Color" }]}
        />
      )}

      <PageModal
        modalKey="create-label"
        title="Create Label"
        description="Add a new product label."
      >
        <LabelForm />
      </PageModal>

      <PageModal
        modalKey="edit-label"
        title="Edit Label"
        description="Update label details."
      >
        <LabelForm label={editingLabel} />
      </PageModal>
    </div>
  )
}

export default function LabelsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <LabelsContent />
    </Suspense>
  )
}
