"use client"

import { useCallback, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useUploadFile } from "@/hooks/api/useUpload"

interface FileUploadProps {
  /** Current uploaded URLs */
  value: string[]
  /** Called when URLs change (add/remove) */
  onChange: (urls: string[]) => void
  /** Allow multiple files */
  multiple?: boolean
  /** Accept filter */
  accept?: string
  /** Max files allowed */
  maxFiles?: number
  className?: string
}

/**
 * Reusable file upload component with drag-drop and Cloudinary integration.
 * Displays thumbnail previews of uploaded images.
 */
export function FileUpload({
  value = [],
  onChange,
  multiple = true,
  accept = "image/*",
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadFile()

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const remaining = maxFiles - value.length
      const filesToUpload = Array.from(files).slice(0, multiple ? remaining : 1)
      let next = multiple ? [...value] : []

      for (const file of filesToUpload) {
        try {
          const url = await uploadMutation.mutateAsync(file)
          next = multiple ? [...next, url] : [url]
          onChange(next)
        } catch {
          // Error surfaced via uploadMutation.error below
        }
      }

      if (inputRef.current) inputRef.current.value = ""
    },
    [value, onChange, multiple, maxFiles, uploadMutation]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeImage = useCallback(
    (index: number) => {
      const next = value.filter((_, i) => i !== index)
      onChange(next)
    },
    [value, onChange]
  )

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          value.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-muted-foreground"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-primary">Click to upload</span> or
          drag and drop
        </div>
        <p className="text-xs text-muted-foreground">
          {multiple
            ? `Up to ${maxFiles} files`
            : "Single file"}
        </p>
        {uploadMutation.isPending && (
          <p className="text-xs text-primary animate-pulse">Uploading…</p>
        )}
        {uploadMutation.isError && (
          <p className="text-xs text-destructive">
            {uploadMutation.error instanceof Error
              ? uploadMutation.error.message
              : "Upload failed"}
          </p>
        )}
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square rounded-lg overflow-hidden border">
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(i)
                }}
                className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground size-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
