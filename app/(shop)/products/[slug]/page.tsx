"use client"

import { useEffect, useMemo, useState, use } from "react"
import { useProductBySlug, useProducts } from "@/hooks/api/useProducts"
import { useCart } from "@/hooks/useCart"
import { ProductCard } from "@/components/shop/product-card"
import { ProductReviews } from "@/components/shop/product-reviews"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { NotFoundState, ErrorState } from "@/components/shared/app-state"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

function isColorVariation(name: string) {
  const lower = name.toLowerCase()
  return lower === "color" || lower === "colour"
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params)
  const { data: productResponse, isLoading, isError, refetch } =
    useProductBySlug(slug)
  const product = productResponse?.data
  const { data: allProductsResponse } = useProducts()
  const allProducts = allProductsResponse?.data || []
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({})
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const activeProduct = product || null
  const variations = activeProduct?.variations || []
  const modifiers = activeProduct?.modifiers || []

  useEffect(() => {
    if (!activeProduct) return
    const defaults: Record<string, string> = {}
    for (const variation of activeProduct.variations || []) {
      if (variation.options[0]) {
        defaults[variation.name] = variation.options[0].name
      }
    }
    setSelectedVariations(defaults)
    setSelectedModifiers([])
    setActiveImage(0)
    setQuantity(1)
    setAddError(null)
  }, [activeProduct?.id])

  const unitPrice = useMemo(() => {
    if (!activeProduct) return 0
    let total = Number(activeProduct.basePrice)

    for (const variation of variations) {
      const selected = selectedVariations[variation.name]
      const option = variation.options.find((opt) => opt.name === selected)
      if (option) total += Number(option.priceAdjustment || 0)
    }

    for (const modifier of modifiers) {
      if (selectedModifiers.includes(modifier.name)) {
        total += Number(modifier.priceAdjustment || 0)
      }
    }

    return total
  }, [activeProduct, variations, modifiers, selectedVariations, selectedModifiers])

  const compareAt = activeProduct?.compareAtPrice
    ? Number(activeProduct.compareAtPrice)
    : null
  const onSale =
    typeof compareAt === "number" &&
    !Number.isNaN(compareAt) &&
    compareAt > unitPrice

  const selectedOptionStock = useMemo(() => {
    if (!activeProduct) return 0
    let stock = activeProduct.stock
    for (const variation of variations) {
      const selected = selectedVariations[variation.name]
      const option = variation.options.find((opt) => opt.name === selected)
      if (option && typeof option.stock === "number") {
        stock = Math.min(stock, option.stock)
      }
    }
    return stock
  }, [activeProduct, variations, selectedVariations])

  const missingRequired = useMemo(() => {
    return variations
      .filter((variation) => !selectedVariations[variation.name])
      .map((variation) => variation.name)
  }, [variations, selectedVariations])

  const missingRequiredModifiers = useMemo(() => {
    return modifiers
      .filter((modifier) => modifier.required)
      .filter((modifier) => !selectedModifiers.includes(modifier.name))
      .map((modifier) => modifier.name)
  }, [modifiers, selectedModifiers])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-6 w-1/4 rounded-md" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          <Skeleton className="aspect-3/4 w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-1/4 rounded-md" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-16">
        <ErrorState
          description="Could not load this product."
          onAction={() => refetch()}
        />
      </div>
    )
  }

  if (!activeProduct) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-16">
        <NotFoundState
          title="Product not found"
          description="This product does not exist or is no longer available."
          actionLabel="Back to shop"
          actionHref="/shop"
        />
      </div>
    )
  }

  const images = activeProduct.images?.length
    ? activeProduct.images
    : ["/placeholder.jpg"]
  const relatedProducts = allProducts
    .filter((p) => p.id !== activeProduct.id && p.isActive !== false)
    .slice(0, 4)

  function toggleModifier(name: string) {
    setSelectedModifiers((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    )
  }

  function handleAddToCart() {
    if (!activeProduct) return
    setAddError(null)

    if (missingRequired.length > 0) {
      setAddError(`Select ${missingRequired.join(", ")}`)
      return
    }
    if (missingRequiredModifiers.length > 0) {
      setAddError(`Choose required option: ${missingRequiredModifiers.join(", ")}`)
      return
    }
    if (selectedOptionStock <= 0) {
      setAddError("This combination is out of stock")
      return
    }

    addToCart(
      {
        id: activeProduct.id,
        name: activeProduct.name,
        price: unitPrice,
        image: images[0],
        selectedVariations,
        selectedModifiers,
        selectedSize:
          selectedVariations.Size ||
          selectedVariations.size ||
          Object.entries(selectedVariations).find(([key]) =>
            key.toLowerCase() === "size"
          )?.[1],
        selectedColor:
          selectedVariations.Color ||
          selectedVariations.Colour ||
          selectedVariations.color ||
          Object.entries(selectedVariations).find(([key]) =>
            isColorVariation(key)
          )?.[1],
      },
      quantity
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 font-sans sm:px-6 lg:px-8">
      <Breadcrumb className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{activeProduct.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 items-start gap-x-10 gap-y-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage] || images[0]}
              alt={activeProduct.name}
              className="size-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-offset-2 transition",
                    activeImage === idx
                      ? "ring-2 ring-black"
                      : "hover:opacity-80"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${activeProduct.name} ${idx + 1}`}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {activeProduct.isFeatured ? (
                <Badge variant="secondary">Featured</Badge>
              ) : null}
              {activeProduct.isOnPromotion || onSale ? (
                <Badge>Sale</Badge>
              ) : null}
              {selectedOptionStock <= 0 ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : selectedOptionStock < 5 ? (
                <Badge variant="outline">Low stock</Badge>
              ) : null}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                {activeProduct.name}
              </h1>
              <span className="pt-1 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                {activeProduct.sku || "—"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-black">
                ${unitPrice.toFixed(2)}
              </p>
              {onSale ? (
                <p className="text-sm text-neutral-400 line-through">
                  ${compareAt!.toFixed(2)}
                </p>
              ) : null}
            </div>

            {activeProduct.description ? (
              <p className="text-sm leading-relaxed text-neutral-600">
                {activeProduct.description}
              </p>
            ) : null}
          </div>

          {variations.map((variation) => {
            const selected = selectedVariations[variation.name]
            const colorLike = isColorVariation(variation.name)

            return (
              <div key={variation.id || variation.name} className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                  <span>
                    {variation.name}
                    {selected ? (
                      <span className="ml-2 font-medium normal-case tracking-normal text-neutral-800">
                        {selected}
                      </span>
                    ) : null}
                  </span>
                </div>

                {colorLike ? (
                  <div className="flex flex-wrap gap-2">
                    {variation.options.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        title={opt.name}
                        onClick={() =>
                          setSelectedVariations((current) => ({
                            ...current,
                            [variation.name]: opt.name,
                          }))
                        }
                        className={cn(
                          "size-8 rounded-full border border-neutral-300 ring-offset-2 transition",
                          selected === opt.name
                            ? "ring-2 ring-black"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: opt.name.toLowerCase() }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {variation.options.map((opt) => {
                      const disabled = opt.stock <= 0
                      const hasAdj = Number(opt.priceAdjustment || 0) !== 0
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            setSelectedVariations((current) => ({
                              ...current,
                              [variation.name]: opt.name,
                            }))
                          }
                          className={cn(
                            "min-w-11 rounded-md border px-3 py-2 text-xs font-semibold transition",
                            selected === opt.name
                              ? "border-black bg-black text-white"
                              : "border-neutral-200 text-neutral-800 hover:border-black",
                            disabled && "cursor-not-allowed opacity-40"
                          )}
                        >
                          {opt.name}
                          {hasAdj
                            ? ` (${Number(opt.priceAdjustment) > 0 ? "+" : ""}$${Number(opt.priceAdjustment).toFixed(2)})`
                            : ""}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {modifiers.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-neutral-200 p-4">
              <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                Add-ons
              </p>
              <div className="space-y-3">
                {modifiers.map((modifier) => {
                  const checked = selectedModifiers.includes(modifier.name)
                  const adj = Number(modifier.priceAdjustment || 0)
                  return (
                    <div
                      key={modifier.id || modifier.name}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`mod-${modifier.name}`}
                          checked={checked}
                          onCheckedChange={() => toggleModifier(modifier.name)}
                        />
                        <div>
                          <Label
                            htmlFor={`mod-${modifier.name}`}
                            className="cursor-pointer font-medium"
                          >
                            {modifier.name}
                            {modifier.required ? (
                              <span className="ml-1 text-xs text-neutral-500">
                                (required)
                              </span>
                            ) : null}
                          </Label>
                        </div>
                      </div>
                      <span className="text-sm text-neutral-600">
                        {adj === 0
                          ? "Included"
                          : `${adj > 0 ? "+" : ""}$${adj.toFixed(2)}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-11 items-center rounded-md border border-neutral-200">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1 text-sm font-semibold text-neutral-600 hover:text-black"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(selectedOptionStock || 1, quantity + 1))
                }
                className="px-3.5 py-1 text-sm font-semibold text-neutral-600 hover:text-black"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={selectedOptionStock <= 0}
              className="h-11 flex-1 rounded-md bg-black text-xs font-bold tracking-widest text-white uppercase hover:bg-neutral-800"
            >
              {selectedOptionStock <= 0
                ? "Out of stock"
                : `Add to bag · $${(unitPrice * quantity).toFixed(2)}`}
            </Button>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex size-11 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:text-black"
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                strokeWidth={2}
                className={cn(
                  "size-5",
                  isFavorite && "fill-black text-black"
                )}
              />
            </button>
          </div>

          {addError ? (
            <p className="text-sm text-red-600">{addError}</p>
          ) : (
            <p className="text-xs text-neutral-500">
              {selectedOptionStock > 0
                ? `${selectedOptionStock} in stock for this selection`
                : "Unavailable for this selection"}
            </p>
          )}

          <Accordion
            type="single"
            collapsible
            defaultValue="details"
            className="w-full rounded-2xl border border-neutral-200"
          >
            <AccordionItem value="details">
              <AccordionTrigger className="px-4 text-xs font-bold tracking-widest uppercase">
                Product details
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm leading-relaxed text-neutral-600">
                <div className="space-y-2">
                  <p>{activeProduct.description || "No extra details yet."}</p>
                  <p>
                    <span className="font-medium text-black">SKU:</span>{" "}
                    {activeProduct.sku || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-black">Stock:</span>{" "}
                    {activeProduct.stock}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="px-4 text-xs font-bold tracking-widest uppercase">
                Shipping & returns
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm leading-relaxed text-neutral-600">
                Ships in 1–2 business days. Free local returns within 14 days on
                unworn items with tags.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="px-4 text-xs font-bold tracking-widest uppercase">
                Care
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm leading-relaxed text-neutral-600">
                Follow the care label. Cold wash where possible and avoid high-heat drying for knits.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <ProductReviews productId={activeProduct.id} />

      {relatedProducts.length > 0 && (
        <section>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              You may also like
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={Number(p.basePrice)}
                compareAtPrice={
                  p.compareAtPrice != null ? Number(p.compareAtPrice) : null
                }
                images={p.images || []}
                variations={p.variations}
                isFeatured={p.isFeatured}
                isOnPromotion={p.isOnPromotion}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
