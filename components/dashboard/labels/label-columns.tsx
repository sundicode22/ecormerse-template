"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Label } from "@/hooks/api/useLabels"
import { useDeleteLabel } from "@/hooks/api/useLabels"
import { usePageModal } from "@/components/shared/page-modal"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { formatTableDate } from "@/lib/format-date"

export function useLabelColumns() {
  const { openModal } = usePageModal()
  const deleteLabel = useDeleteLabel()

  const columns: ColumnDef<Label>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const label = row.original
        return (
          <Badge
            style={{
              backgroundColor: label.color || "#6b7280",
              color: "#fff",
            }}
          >
            {label.name}
          </Badge>
        )
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        const color = row.getValue("color") as string
        return (
          <div className="flex items-center gap-2">
            <div
              className="size-4 rounded-full border"
              style={{ backgroundColor: color || "#6b7280" }}
            />
            <span className="text-muted-foreground text-sm">{color}</span>
          </div>
        )
      },
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
        const label = row.original
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              onEdit={() =>
                openModal("edit-label", { id: String(label.id) })
              }
              deleteTitle={`Delete “${label.name}”?`}
              deleteDescription="Products linked to this label will be unlinked. This cannot be undone."
              onDelete={() => deleteLabel.mutateAsync(label.id)}
            />
          </div>
        )
      },
    },
  ]

  return columns
}
