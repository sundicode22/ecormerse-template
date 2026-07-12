"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { AdminAddress } from "@/hooks/api/useAddresses"
import { useAdminDeleteAddress } from "@/hooks/api/useAddresses"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { formatTableDate } from "@/lib/format-date"

export function useAddressColumns() {
  const deleteAddress = useAdminDeleteAddress()

  const columns: ColumnDef<AdminAddress>[] = [
    {
      id: "user",
      accessorFn: (row) => row.user?.email || row.user?.name || row.userId,
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user
        return (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {user?.name || "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || row.original.userId}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.label || "Address"}</span>
          {row.original.isDefault ? (
            <Badge variant="secondary">Default</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Recipient",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      id: "address",
      accessorFn: (row) =>
        [row.line1, row.city, row.country].filter(Boolean).join(", "),
      header: "Address",
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="max-w-[280px] text-sm text-muted-foreground">
            <p className="truncate text-foreground">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
            </p>
            <p className="truncate">
              {a.city}
              {a.state ? `, ${a.state}` : ""} {a.postalCode}
            </p>
            <p className="truncate">{a.country}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("phone") as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("country")}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => formatTableDate(row.getValue("updatedAt")),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const address = row.original
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              deleteTitle={`Delete “${address.label || address.name}”?`}
              deleteDescription="This permanently removes the saved address for this user."
              onDelete={() => deleteAddress.mutateAsync(address.id)}
            />
          </div>
        )
      },
    },
  ]

  return columns
}
