"use client"

import { cn } from "@/lib/utils"

type TableImageProps = {
  src?: string | null
  alt: string
  className?: string
}

export function TableImage({ src, alt, className }: TableImageProps) {
  return (
    <div
      className={cn(
        "relative size-10 shrink-0 overflow-hidden rounded-md bg-muted",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
          —
        </div>
      )}
    </div>
  )
}
