"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Collection } from "@/hooks/api/useCollections"
import { useDeleteCollection } from "@/hooks/api/useCollections"
import { usePageModal } from "@/components/shared/page-modal"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { formatTableDate } from "@/lib/format-date"
import { TableImage } from "@/components/shared/table-image"

export function useCollectionColumns() {
  const { openModal } = usePageModal()
  const deleteCollection = useDeleteCollection()

  const columns: ColumnDef<Collection>[] = [
    {
      id: "image",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => (
        <TableImage src={row.original.image} alt={row.original.name} />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("slug")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1">
          {row.getValue("description") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatTableDate(row.getValue("createdAt")),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => formatTableDate(row.getValue("updatedAt")),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const collection = row.original
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              onEdit={() =>
                openModal("edit-collection", { id: String(collection.id) })
              }
              deleteTitle={`Delete “${collection.name}”?`}
              deleteDescription="Products linked to this collection will be unlinked. This cannot be undone."
              onDelete={() => deleteCollection.mutateAsync(collection.id)}
            />
          </div>
        )
      },
    },
  ]

  return columns
}
