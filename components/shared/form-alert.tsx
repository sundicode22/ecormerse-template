"use client"

import type { FieldErrors, FieldValues } from "react-hook-form"
import { cn } from "@/lib/utils"

function collectMessages(errors: FieldErrors<FieldValues>, prefix = ""): string[] {
  const messages: string[] = []
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "object" && "message" in value && value.message) {
      messages.push(String(value.message))
      continue
    }
    if (typeof value === "object") {
      messages.push(...collectMessages(value as FieldErrors<FieldValues>, path))
    }
  }
  return messages
}

export function FormAlert({
  errors,
  serverError,
  className,
}: {
  errors?: FieldErrors<FieldValues>
  serverError?: string | null
  className?: string
}) {
  const fieldMessages = errors ? collectMessages(errors) : []
  const unique = [...new Set(fieldMessages)]
  if (!serverError && unique.length === 0) return null

  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className
      )}
    >
      {serverError && <p>{serverError}</p>}
      {!serverError && unique.length === 1 && <p>{unique[0]}</p>}
      {!serverError && unique.length > 1 && (
        <ul className="list-disc space-y-1 pl-4">
          {unique.slice(0, 6).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function mutationErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
