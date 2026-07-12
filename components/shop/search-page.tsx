"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProducts } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { ProductCard } from "@/components/shop/product-card"
import { EmptyState, ErrorState } from "@/components/shared/app-state"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

export function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const { data, isLoading, isError, refetch } = useProducts()
  const { data: categoriesResponse } = useCategories()
  const products = (data?.data || []).filter((p) => p.isActive !== false)
  const categories = categoriesResponse?.data || []

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      const qs = params.toString()
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false })
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, router])

  const results = useMemo(() => {
    if (!deferredQuery) return []
    return products.filter((p) => {
      const haystack = `${p.name} ${p.description || ""} ${p.sku || ""}`.toLowerCase()
      return haystack.includes(deferredQuery)
    })
  }, [products, deferredQuery])

  const suggestedCategories = categories.slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black capitalize sm:text-4xl">
          Search
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          Find products by name, description, or SKU.
        </p>
      </div>

      <div className="relative mx-auto mt-8 max-w-2xl">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={1.8}
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the store…"
          autoFocus
          className="h-14 w-full rounded-md border border-neutral-200 bg-neutral-50 py-3 pr-12 pl-12 text-base outline-none focus:border-black focus:bg-white"
          style={{ borderRadius: 12 }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 hover:text-black"
            aria-label="Clear search"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} className="size-5" />
          </button>
        )}
      </div>

      {!deferredQuery && (
        <div className="mx-auto mt-12 max-w-2xl">
          <p className="text-sm font-semibold capitalize text-black">Browse categories</p>
          {suggestedCategories.length === 0 ? (
            <EmptyState
              className="mt-4 py-10"
              title="Start typing to search"
              description="Product results will appear here as you type."
              actionLabel="Visit store"
              actionHref="/shop"
            />
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="rounded-md bg-neutral-100 px-4 py-2 text-sm capitalize text-neutral-700 transition hover:bg-neutral-200"
                  style={{ borderRadius: 12 }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {deferredQuery && (
        <div className="mt-10">
          <p className="mb-6 text-sm text-neutral-500">
            {isLoading
              ? "Searching…"
              : `${results.length} result${results.length === 1 ? "" : "s"} for “${query.trim()}”`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-4 w-1/3 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              description="Could not load products for search."
              onAction={() => refetch()}
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="No results found"
              description={`Nothing matched “${query.trim()}”. Try another term or browse the store.`}
              actionLabel="Browse store"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {results.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.basePrice)}
                  images={p.images || []}
                  variations={p.variations}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
