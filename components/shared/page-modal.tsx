"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PageModalProps {
  /** The modal identifier to match against ?modal=<value> */
  modalKey: string
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Hook to control PageModal state via URL search params.
 */
export function usePageModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const openModal = useCallback(
    (key: string, params?: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set("modal", key)
      if (params) {
        Object.entries(params).forEach(([k, v]) => newParams.set(k, v))
      }
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [router, searchParams, pathname]
  )

  const closeModal = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete("modal")
    newParams.delete("id")
    const qs = newParams.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, searchParams, pathname])

  const currentModal = searchParams.get("modal")

  const isOpen = useCallback(
    (key: string) => currentModal === key,
    [currentModal]
  )

  const getParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  )

  return { openModal, closeModal, isOpen, getParam, currentModal }
}

/**
 * Dashboard modal: full-screen on mobile, 90% viewport on desktop.
 * Square shell; body scrolls so form actions stay reachable.
 */
export function PageModal({
  modalKey,
  title,
  description,
  children,
}: PageModalProps) {
  const { isOpen, closeModal } = usePageModal()
  const open = isOpen(modalKey)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-none border border-border bg-background p-0 shadow-none ring-0",
          // Mobile: full screen
          "top-0 left-0 h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0",
          // Desktop: 90% viewport, centered
          "sm:top-1/2 sm:left-1/2 sm:h-[90vh] sm:max-h-[90vh] sm:w-[90vw] sm:max-w-[90vw] sm:-translate-x-1/2 sm:-translate-y-1/2"
        )}
      >
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div className="mx-auto w-full max-w-2xl pb-8">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
