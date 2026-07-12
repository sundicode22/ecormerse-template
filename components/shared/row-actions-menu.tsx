"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { notify } from "@/lib/toast"

interface RowActionsMenuProps {
  onEdit?: () => void
  deleteTitle: string
  deleteDescription?: string
  onDelete: () => Promise<unknown>
}

export function RowActionsMenu({
  onEdit,
  deleteTitle,
  deleteDescription = "This action cannot be undone.",
  onDelete,
}: RowActionsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Open actions"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {onEdit ? (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setError(null)
              setConfirmOpen(true)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!loading) setConfirmOpen(next)
        }}
        title={deleteTitle}
        description={error || deleteDescription}
        loading={loading}
        onConfirm={async () => {
          setLoading(true)
          setError(null)
          const toastId = notify.loading("Deleting…")
          try {
            await onDelete()
            notify.dismiss(toastId)
            setConfirmOpen(false)
          } catch (err) {
            notify.dismiss(toastId)
            const message =
              err instanceof Error
                ? err.message
                : "Delete failed. Please try again."
            setError(message)
            notify.error(message)
          } finally {
            setLoading(false)
          }
        }}
      />
    </>
  )
}
