"use client"

import { useMemo, useState, useDeferredValue } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useProducts, type Product } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useCollections } from "@/hooks/api/useCollections"
import { useLabels } from "@/hooks/api/useLabels"
import { ProductCard } from "@/components/shop/product-card"
import { ShopPageHeader } from "@/components/shop/page-header"
import { EmptyState, ErrorState } from "@/components/shared/app-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name"

function parseList(value: string | null) {
  return value ? value.split(",").filter(Boolean) : []
}

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function getVariationOptions(products: Product[], nameMatch: RegExp) {
  const set = new Set<string>()
  for (const product of products) {
    const variation = product.variations?.find((v) => nameMatch.test(v.name))
    variation?.options.forEach((opt) => set.add(opt.name))
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function productHasOption(product: Product, nameMatch: RegExp, value: string) {
  const variation = product.variations?.find((v) => nameMatch.test(v.name))
  return variation?.options.some((opt) => opt.name === value) ?? false
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
      <Separator />
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  count,
  onChange,
}: {
  label: string
  checked: boolean
  count?: number
  onChange: () => void
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={() => onChange()}
        />
        <Label htmlFor={id} className="cursor-pointer font-normal capitalize">
          {label}
        </Label>
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </div>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <Badge
      variant="secondary"
      className="h-7 cursor-pointer gap-1 rounded-md px-2.5 capitalize"
      onClick={onRemove}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRemove()
      }}
    >
      {label}
      <span aria-hidden>×</span>
    </Badge>
  )
}

export function ShopCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data, isLoading, isError, refetch } = useProducts()
  const { data: categoriesResponse } = useCategories()
  const { data: collectionsResponse } = useCollections()
  const { data: labelsResponse } = useLabels()

  const products = data?.data || []
  const categories = categoriesResponse?.data || []
  const collections = collectionsResponse?.data || []
  const labels = labelsResponse?.data || []

  const selectedCategories = parseList(searchParams.get("category"))
  const selectedCollections = parseList(searchParams.get("collection"))
  const selectedLabels = parseList(searchParams.get("label"))
  const selectedColors = parseList(searchParams.get("color"))
  const selectedSizes = parseList(searchParams.get("size"))
  const inStockOnly = searchParams.get("inStock") === "1"
  const promoOnly = searchParams.get("promo") === "1"
  const sort = (searchParams.get("sort") as SortKey) || "featured"
  const minPriceParam = searchParams.get("min")
  const maxPriceParam = searchParams.get("max")
  const qParam = searchParams.get("q") || ""

  const [searchInput, setSearchInput] = useState(qParam)
  const deferredSearch = useDeferredValue(searchInput)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  )

  const priceBounds = useMemo(() => {
    if (activeProducts.length === 0) return { min: 0, max: 0 }
    const prices = activeProducts.map((p) => Number(p.basePrice))
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }
  }, [activeProducts])

  const minPrice = minPriceParam ? Number(minPriceParam) : priceBounds.min
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : priceBounds.max

  const colorOptions = useMemo(
    () => getVariationOptions(activeProducts, /colou?r/i),
    [activeProducts]
  )
  const sizeOptions = useMemo(
    () => getVariationOptions(activeProducts, /^size$/i),
    [activeProducts]
  )

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutator(params)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function setListParam(key: string, values: string[]) {
    updateParams((params) => {
      if (values.length === 0) params.delete(key)
      else params.set(key, values.join(","))
    })
  }

  function clearFilters() {
    setSearchInput("")
    router.replace(pathname, { scroll: false })
  }

  // Faceted counts: count within products matching all filters EXCEPT the facet being counted
  const baseWithout = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return activeProducts.filter((p) => {
      const price = Number(p.basePrice)
      if (q && !`${p.name} ${p.description || ""}`.toLowerCase().includes(q)) return false
      if (inStockOnly && p.stock <= 0) return false
      if (price < minPrice || price > maxPrice) return false
      if (
        selectedCollections.length > 0 &&
        !selectedCollections.some((slug) => {
          const col = collections.find((c) => c.slug === slug)
          return col && p.productCollections?.some((pc) => pc.collectionId === col.id)
        })
      ) {
        return false
      }
      if (
        selectedLabels.length > 0 &&
        !selectedLabels.some((slug) => {
          const label = labels.find((l) => l.name.toLowerCase() === slug.toLowerCase())
          return label && p.productLabels?.some((pl) => pl.labelId === label.id)
        })
      ) {
        return false
      }
      if (
        selectedColors.length > 0 &&
        !selectedColors.some((c) => productHasOption(p, /colou?r/i, c))
      ) {
        return false
      }
      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((s) => productHasOption(p, /^size$/i, s))
      ) {
        return false
      }
      return true
    })
  }, [
    activeProducts,
    deferredSearch,
    inStockOnly,
    minPrice,
    maxPrice,
    selectedCollections,
    selectedLabels,
    selectedColors,
    selectedSizes,
    collections,
    labels,
  ])

  const categoryCounts = useMemo(() => {
    const map = new Map<number, number>()
    for (const cat of categories) {
      const count = baseWithout.filter((p) =>
        p.productCategories?.some((pc) => pc.categoryId === cat.id)
      ).length
      map.set(cat.id, count)
    }
    return map
  }, [baseWithout, categories])

  const filtered = useMemo(() => {
    let list = activeProducts.filter((p) => {
      const price = Number(p.basePrice)
      const q = deferredSearch.trim().toLowerCase()

      if (q && !`${p.name} ${p.description || ""}`.toLowerCase().includes(q)) return false
      if (inStockOnly && p.stock <= 0) return false
      if (promoOnly && !p.isOnPromotion) return false
      if (price < minPrice || price > maxPrice) return false

      if (selectedCategories.length > 0) {
        const ok = selectedCategories.some((slug) => {
          const cat = categories.find((c) => c.slug === slug)
          return cat && p.productCategories?.some((pc) => pc.categoryId === cat.id)
        })
        if (!ok) return false
      }

      if (selectedCollections.length > 0) {
        const ok = selectedCollections.some((slug) => {
          const col = collections.find((c) => c.slug === slug)
          return col && p.productCollections?.some((pc) => pc.collectionId === col.id)
        })
        if (!ok) return false
      }

      if (selectedLabels.length > 0) {
        const ok = selectedLabels.some((name) => {
          const label = labels.find((l) => l.name.toLowerCase() === name.toLowerCase())
          return label && p.productLabels?.some((pl) => pl.labelId === label.id)
        })
        if (!ok) return false
      }

      if (
        selectedColors.length > 0 &&
        !selectedColors.some((c) => productHasOption(p, /colou?r/i, c))
      ) {
        return false
      }

      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((s) => productHasOption(p, /^size$/i, s))
      ) {
        return false
      }

      return true
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return Number(a.basePrice) - Number(b.basePrice)
        case "price-desc":
          return Number(b.basePrice) - Number(a.basePrice)
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
          return (b.createdAt || "").localeCompare(a.createdAt || "")
        case "featured":
        default: {
          const featuredDelta = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
          if (featuredDelta !== 0) return featuredDelta
          return (b.createdAt || "").localeCompare(a.createdAt || "")
        }
      }
    })

    return list
  }, [
    activeProducts,
    deferredSearch,
    inStockOnly,
    promoOnly,
    minPrice,
    maxPrice,
    selectedCategories,
    selectedCollections,
    selectedLabels,
    selectedColors,
    selectedSizes,
    categories,
    collections,
    labels,
    sort,
  ])

  const activeChipCount =
    selectedCategories.length +
    selectedCollections.length +
    selectedLabels.length +
    selectedColors.length +
    selectedSizes.length +
    (inStockOnly ? 1 : 0) +
    (promoOnly ? 1 : 0) +
    (deferredSearch ? 1 : 0) +
    (minPriceParam || maxPriceParam ? 1 : 0)

  function commitSearch(value: string) {
    setSearchInput(value)
    updateParams((params) => {
      if (!value.trim()) params.delete("q")
      else params.set("q", value.trim())
    })
  }

  const filterPanel = (
    <div className="space-y-5">
      <FilterSection title="Search">
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => commitSearch(e.target.value)}
          placeholder="Search products…"
        />
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <CheckboxRow
                key={cat.id}
                label={cat.name}
                checked={selectedCategories.includes(cat.slug)}
                count={categoryCounts.get(cat.id) || 0}
                onChange={() =>
                  setListParam("category", toggleInList(selectedCategories, cat.slug))
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {collections.length > 0 && (
        <FilterSection title="Collection">
          <div className="space-y-2.5">
            {collections.map((col) => (
              <CheckboxRow
                key={col.id}
                label={col.name}
                checked={selectedCollections.includes(col.slug)}
                onChange={() =>
                  setListParam(
                    "collection",
                    toggleInList(selectedCollections, col.slug)
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {labels.length > 0 && (
        <FilterSection title="Label">
          <div className="space-y-2.5">
            {labels.map((label) => (
              <CheckboxRow
                key={label.id}
                label={label.name}
                checked={selectedLabels.includes(label.name)}
                onChange={() =>
                  setListParam("label", toggleInList(selectedLabels, label.name))
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {priceBounds.max > priceBounds.min && (
        <FilterSection title="Price">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="price-min" className="text-xs text-muted-foreground">
                Min
              </Label>
              <Input
                id="price-min"
                type="number"
                min={priceBounds.min}
                max={maxPrice}
                value={minPrice}
                onChange={(e) =>
                  updateParams((params) => {
                    params.set("min", e.target.value)
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-max" className="text-xs text-muted-foreground">
                Max
              </Label>
              <Input
                id="price-max"
                type="number"
                min={minPrice}
                max={priceBounds.max}
                value={maxPrice}
                onChange={(e) =>
                  updateParams((params) => {
                    params.set("max", e.target.value)
                  })
                }
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            ${priceBounds.min} – ${priceBounds.max}
          </p>
        </FilterSection>
      )}

      {sizeOptions.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const active = selectedSizes.includes(size)
              return (
                <Button
                  key={size}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() =>
                    setListParam("size", toggleInList(selectedSizes, size))
                  }
                  className="capitalize"
                >
                  {size}
                </Button>
              )
            })}
          </div>
        </FilterSection>
      )}

      {colorOptions.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => {
              const active = selectedColors.includes(color)
              return (
                <Button
                  key={color}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() =>
                    setListParam("color", toggleInList(selectedColors, color))
                  }
                  className="capitalize"
                >
                  <span
                    className="size-3 rounded-full border border-border"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  {color}
                </Button>
              )
            })}
          </div>
        </FilterSection>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Availability</h3>
        <div className="space-y-2.5">
          <CheckboxRow
            label="In stock only"
            checked={inStockOnly}
            onChange={() =>
              updateParams((params) => {
                if (inStockOnly) params.delete("inStock")
                else params.set("inStock", "1")
              })
            }
          />
          <CheckboxRow
            label="On promotion"
            checked={promoOnly}
            onChange={() =>
              updateParams((params) => {
                if (promoOnly) params.delete("promo")
                else params.set("promo", "1")
              })
            }
          />
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <ShopPageHeader
        title="Store"
        description="Filter the full edit by category, fit, price, and more."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
            {activeChipCount > 0 && (
              <span>
                {" "}
                · {activeChipCount} filter{activeChipCount === 1 ? "" : "s"}
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  Filters
                  {activeChipCount > 0 ? ` (${activeChipCount})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full gap-0 overflow-y-auto p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b px-6 py-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-6 py-5">{filterPanel}</div>
                {activeChipCount > 0 && (
                  <div className="border-t px-6 py-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        clearFilters()
                        setMobileFiltersOpen(false)
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(value) =>
                updateParams((params) => {
                  if (value === "featured") params.delete("sort")
                  else params.set("sort", value)
                })
              }
            >
              <SelectTrigger className="w-[180px] rounded-md bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-sm">
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {activeChipCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        {activeChipCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {deferredSearch ? (
              <FilterChip
                label={`Search: ${deferredSearch}`}
                onRemove={() => commitSearch("")}
              />
            ) : null}
            {selectedCategories.map((slug) => {
              const cat = categories.find((c) => c.slug === slug)
              return (
                <FilterChip
                  key={slug}
                  label={cat?.name || slug}
                  onRemove={() =>
                    setListParam(
                      "category",
                      toggleInList(selectedCategories, slug)
                    )
                  }
                />
              )
            })}
            {selectedCollections.map((slug) => {
              const col = collections.find((c) => c.slug === slug)
              return (
                <FilterChip
                  key={slug}
                  label={col?.name || slug}
                  onRemove={() =>
                    setListParam(
                      "collection",
                      toggleInList(selectedCollections, slug)
                    )
                  }
                />
              )
            })}
            {selectedLabels.map((name) => (
              <FilterChip
                key={name}
                label={name}
                onRemove={() =>
                  setListParam("label", toggleInList(selectedLabels, name))
                }
              />
            ))}
            {selectedSizes.map((size) => (
              <FilterChip
                key={size}
                label={`Size ${size}`}
                onRemove={() =>
                  setListParam("size", toggleInList(selectedSizes, size))
                }
              />
            ))}
            {selectedColors.map((color) => (
              <FilterChip
                key={color}
                label={color}
                onRemove={() =>
                  setListParam("color", toggleInList(selectedColors, color))
                }
              />
            ))}
            {inStockOnly ? (
              <FilterChip
                label="In stock"
                onRemove={() =>
                  updateParams((params) => {
                    params.delete("inStock")
                  })
                }
              />
            ) : null}
            {promoOnly ? (
              <FilterChip
                label="On promotion"
                onRemove={() =>
                  updateParams((params) => {
                    params.delete("promo")
                  })
                }
              />
            ) : null}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-md border bg-card p-5 lg:block">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Smart filters</h2>
              {activeChipCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Reset
                </Button>
              )}
            </div>
            {filterPanel}
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                description="Could not load products from the server."
                onAction={() => refetch()}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No products match"
                description="Try clearing some filters or broadening your search."
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
                {filtered.map((p) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
