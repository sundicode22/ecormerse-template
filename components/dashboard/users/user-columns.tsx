"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { AdminUser } from "@/hooks/api/useUsers"
import { useDeleteUser } from "@/hooks/api/useUsers"
import { usePageModal } from "@/components/shared/page-modal"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { formatTableDate } from "@/lib/format-date"
import { ROLES } from "@/lib/auth/roles"

export function useUserColumns() {
  const { openModal } = usePageModal()
  const deleteUser = useDeleteUser()

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") || "—"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email") || "—"}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === ROLES.ADMIN ? "default" : "secondary"}>
            {role === ROLES.ADMIN ? "Admin" : "User"}
          </Badge>
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
        const user = row.original
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              onEdit={() => openModal("edit-user", { id: user.id })}
              deleteTitle={`Delete “${user.name || user.email || "user"}”?`}
              deleteDescription="This permanently removes the account. The last admin cannot be deleted."
              onDelete={() => deleteUser.mutateAsync(user.id)}
            />
          </div>
        )
      },
    },
  ]

  return columns
}
