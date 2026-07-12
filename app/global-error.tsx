"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/app-state"

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white p-6 font-sans text-black">
        <div className="w-full max-w-lg">
          <ErrorState
            title="Unexpected error"
            description={error.message || "An unexpected error occurred."}
            actionLabel="Try again"
            onAction={reset}
          />
        </div>
      </body>
    </html>
  )
}
