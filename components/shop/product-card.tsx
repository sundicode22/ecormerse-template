"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/hooks/useCart"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, Add01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export interface ProductCardProps {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  variations?: {
    name: string
    options: { name: string; priceAdjustment: number; stock: number }[]
  }[]
  className?: string
  badge?: string | null
  isFeatured?: boolean | null
  isOnPromotion?: boolean | null
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  images,
  variations = [],
  className,
  badge,
  isFeatured,
  isOnPromotion,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(() => {
    const colorVar = variations.find(
      (v) => v.name.toLowerCase() === "color" || v.name.toLowerCase() === "colour"
    )
    return colorVar?.options[0]?.name
  })

  const primaryImage = images[0] || "/placeholder.jpg"
  const hoverImage = images[1] || primaryImage
  const hasSale =
    typeof compareAtPrice === "number" &&
    !Number.isNaN(compareAtPrice) &&
    compareAtPrice > price
  const displayBadge =
    badge ||
    (isOnPromotion || hasSale ? "Sale" : null) ||
    (isFeatured ? "Featured" : null)

  const colorVar = variations.find(
    (v) => v.name.toLowerCase() === "color" || v.name.toLowerCase() === "colour"
  )

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const sizeVar = variations.find((v) => v.name.toLowerCase() === "size")
    const selectedSize = sizeVar?.options[0]?.name

    addToCart({
      id,
      name,
      slug,
      price,
      image: primaryImage,
      selectedColor,
      selectedSize,
    })
  }

  return (
    <div className={cn("group relative flex flex-col gap-3 font-sans", className)}>
      <Link
        href={`/products/${slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={name}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-0"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hoverImage}
          alt={`${name} hover view`}
          className="absolute inset-0 size-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />

        {displayBadge && (
          <span className="absolute top-3 left-3 bg-white px-2 py-0.5 text-[10px] font-medium tracking-wider text-black uppercase">
            {displayBadge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md bg-white/90 text-neutral-700 transition-colors hover:text-black"
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            strokeWidth={2}
            className={cn("size-4", isFavorite && "fill-black text-black")}
          />
        </button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href={`/products/${slug}`}
            className="text-sm font-medium text-black hover:underline"
          >
            {name}
          </Link>

          {colorVar && colorVar.options.length > 0 && (
            <div className="flex gap-1.5 pt-0.5">
              {colorVar.options.map((opt) => {
                const displayColor = opt.name.toLowerCase()
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedColor(opt.name)}
                    style={{ backgroundColor: displayColor }}
                    className={cn(
                      "size-2.5 rounded-full border border-neutral-300 transition-transform",
                      selectedColor === opt.name
                        ? "scale-125 border-black ring-1 ring-black"
                        : "hover:scale-110"
                    )}
                    title={opt.name}
                  />
                )
              })}
            </div>
          )}

          {hasSale ? (
            <p className="flex items-center gap-2 pt-0.5 text-sm">
              <span className="font-medium text-black">${price.toFixed(2)}</span>
              <span className="text-neutral-400 line-through">
                ${compareAtPrice!.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="pt-0.5 text-sm text-neutral-600">${price.toFixed(2)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex size-8 items-center justify-center rounded-md border border-neutral-300 transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
