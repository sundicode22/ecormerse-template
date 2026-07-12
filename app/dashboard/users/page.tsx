"use client"

import { Suspense } from "react"
import { useUsers } from "@/hooks/api/useUsers"
import { useUserColumns } from "@/components/dashboard/users/user-columns"
import { UserForm } from "@/components/dashboard/users/user-form"
import { DataTable } from "@/components/shared/data-table"
import { PageModal, usePageModal } from "@/components/shared/page-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function UsersContent() {
  const { data: usersResponse, isLoading } = useUsers()
  const users = usersResponse?.data || []
  const columns = useUserColumns()
  const { openModal, getParam } = usePageModal()

  const editId = getParam("id")
  const editingUser = editId ? users.find((u) => u.id === editId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage store customers and admin accounts.
          </p>
        </div>
        <Button onClick={() => openModal("create-admin")}>+ Add admin</Button>
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
          data={users}
          searchKey="email"
          searchPlaceholder="Search users..."
          filters={[{ id: "role", label: "Role" }]}
        />
      )}

      <PageModal
        modalKey="create-admin"
        title="Add admin"
        description="Create a new administrator account."
      >
        <UserForm />
      </PageModal>

      <PageModal
        modalKey="edit-user"
        title="Edit user"
        description="Update role, name, or password."
      >
        <UserForm user={editingUser} />
      </PageModal>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <UsersContent />
    </Suspense>
  )
}
