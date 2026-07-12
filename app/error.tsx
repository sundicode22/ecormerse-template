"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/app-state"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description={error.message || "We hit a problem loading this page."}
        actionLabel="Try again"
        onAction={reset}
      />
    </div>
  )
}
