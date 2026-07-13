"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useCollections } from "@/hooks/api/useCollections"
import { ProductCard } from "@/components/shop/product-card"
import { LandingReviews } from "@/components/shop/landing-reviews"
import { LandingFaq } from "@/components/shop/landing-faq"
import { EmptyState, ErrorState } from "@/components/shared/app-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Product } from "@/hooks/api/useProducts"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center text-2xl font-semibold tracking-tight text-black sm:text-3xl">
      {children}
    </h2>
  )
}

function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-md bg-black px-8 text-xs font-medium tracking-[0.12em] text-white uppercase transition hover:bg-neutral-800",
        className
      )}
    >
      {children}
    </Link>
  )
}

function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-md border border-black bg-white px-8 text-xs font-medium tracking-[0.12em] text-black uppercase transition hover:bg-neutral-100",
        className
      )}
    >
      {children}
    </Link>
  )
}

function ProductGrid({
  products,
  emptyTitle,
}: {
  products: Product[]
  emptyTitle: string
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description="Mark products as featured or on promotion in the dashboard."
        actionLabel="Go to shop"
        actionHref="/shop"
        className="mt-10"
      />
    )
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {products.map((p) => (
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
  )
}

export function LandingPage() {
  const {
    data: productsResponse,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts()
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories()
  const {
    data: collectionsResponse,
    isLoading: collectionsLoading,
    isError: collectionsError,
    refetch: refetchCollections,
  } = useCollections()
  const { addToCart } = useCart()

  const products = (productsResponse?.data || []).filter((p) => p.isActive !== false)
  const categories = categoriesResponse?.data || []
  const collections = collectionsResponse?.data || []

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8)
  const promotionProducts = products.filter((p) => p.isOnPromotion).slice(0, 8)
  const newArrivals = [...products]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 4)
  const spotlight = featuredProducts[0] || products[0]
  const lookProduct = featuredProducts[1] || products[1] || products[0]
  const featuredCollection = collections[0]
  const shopCategories = categories.slice(0, 4)

  const anyError = productsError || categoriesError || collectionsError

  return (
    <div className="bg-white text-black">
      {/* Hero with outer padding — imagery + pattern inside a rounded frame */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative isolate mx-auto min-h-[72vh] max-w-7xl overflow-hidden rounded-3xl bg-neutral-900 text-white sm:min-h-[78vh]">
          {productsLoading ? (
            <Skeleton className="absolute inset-0 rounded-none bg-neutral-800" />
          ) : spotlight?.images?.[0] ? (
            <Image
              src={spotlight.images[0]}
              alt={spotlight.name}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="pattern-mesh-dark absolute inset-0 opacity-70 mix-blend-soft-light" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="relative flex min-h-[72vh] flex-col justify-end px-8 pb-12 pt-24 sm:min-h-[78vh] sm:px-12 sm:pb-16 lg:px-14 lg:pb-20">
            <p className="animate-fade-up font-display text-5xl leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
              Sundi Buy
            </p>
            <h1 className="animate-fade-up-delay mt-5 max-w-xl text-xl font-medium leading-snug text-white/90 sm:text-2xl lg:text-3xl">
              Modern essentials, made to move
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              A focused wardrobe of daily pieces — soft structure, clean lines, and lasting fabric.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-xs font-medium tracking-[0.12em] text-black uppercase transition hover:bg-neutral-200"
              >
                Shop now
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 bg-white/10 px-8 text-xs font-medium tracking-[0.12em] text-white uppercase backdrop-blur-sm transition hover:bg-white/20"
              >
                Our story
              </Link>
            </div>
            {!productsLoading && products.length > 0 && (
              <p className="mt-8 text-xs tracking-wide text-white/55">
                {products.length} pieces available
                {spotlight ? ` · Featuring ${spotlight.name}` : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* New arrivals — compact product strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Just in
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              New arrivals
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 text-sm text-neutral-600 underline-offset-4 transition hover:text-black hover:underline"
          >
            View all
          </Link>
        </div>

        {productsLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : productsError ? (
          <ErrorState className="mt-8" onAction={() => refetchProducts()} />
        ) : products.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="No products yet"
            description="Add products in the dashboard to show new arrivals here."
            actionLabel="Open shop"
            actionHref="/shop"
          />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {newArrivals.map((p) => (
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
      </section>

      {/* Categories from DB */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading>Shop by category</SectionHeading>
        {categoriesLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : categoriesError ? (
          <ErrorState
            className="mt-10"
            description="Could not load categories."
            onAction={() => refetchCategories()}
          />
        ) : shopCategories.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No categories yet"
            description="Create categories in the dashboard to show them here."
            actionLabel="Browse shop"
            actionHref="/shop"
          />
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {shopCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group block text-center"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-neutral-400">
                      {cat.name}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs font-medium tracking-[0.12em] text-black uppercase">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-center text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase sm:text-left">
              Editor’s picks
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Featured
            </h2>
          </div>
          <Link
            href="/shop?sort=featured"
            className="shrink-0 text-sm text-neutral-600 underline-offset-4 transition hover:text-black hover:underline"
          >
            View all
          </Link>
        </div>
        {productsLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : productsError ? (
          <ErrorState className="mt-10" onAction={() => refetchProducts()} />
        ) : (
          <ProductGrid
            products={featuredProducts.slice(0, 4)}
            emptyTitle="No featured products yet"
          />
        )}
      </section>

      {/* On promotion */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Limited offers
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              On promotion
            </h2>
          </div>
          <Link
            href="/shop?promo=1"
            className="shrink-0 text-sm text-neutral-600 underline-offset-4 transition hover:text-black hover:underline"
          >
            Shop offers
          </Link>
        </div>
        {productsLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : productsError ? (
          <ErrorState className="mt-10" onAction={() => refetchProducts()} />
        ) : (
          <ProductGrid
            products={promotionProducts.slice(0, 4)}
            emptyTitle="No promotions yet"
          />
        )}
      </section>

      {/* Collection spotlight from DB */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {collectionsLoading ? (
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        ) : collectionsError ? (
          <ErrorState onAction={() => refetchCollections()} />
        ) : featuredCollection ? (
          <div className="grid overflow-hidden rounded-3xl bg-neutral-100 lg:grid-cols-2">
            <div className="relative min-h-[320px] lg:min-h-[480px]">
              {featuredCollection.image ? (
                <Image
                  src={featuredCollection.image}
                  alt={featuredCollection.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : spotlight?.images?.[0] ? (
                <Image
                  src={spotlight.images[0]}
                  alt={featuredCollection.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-neutral-200 text-neutral-500">
                  No collection image
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center px-8 py-12 sm:px-12">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                Featured collection
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
                {featuredCollection.name}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                {featuredCollection.description ||
                  "A curated set of pieces designed to work together across your week."}
              </p>
              <div className="mt-8">
                <PrimaryButton href={`/shop?collection=${featuredCollection.slug}`}>
                  Shop collection
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No collections yet"
            description="Create a collection in the dashboard to feature it here."
            actionLabel="Browse shop"
            actionHref="/shop"
          />
        )}
      </section>

      {/* Complete the look from DB */}
      {lookProduct && (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100">
            {lookProduct.images?.[0] ? (
              <Image
                src={lookProduct.images[0]}
                alt={lookProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-neutral-50 p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Complete the look
            </p>
            <div className="relative mt-5 aspect-[3/4] max-w-sm overflow-hidden rounded-2xl bg-neutral-100">
              {lookProduct.images?.[1] || lookProduct.images?.[0] ? (
                <Image
                  src={(lookProduct.images?.[1] || lookProduct.images?.[0]) as string}
                  alt={lookProduct.name}
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              ) : null}
            </div>
            <div className="mt-5 max-w-sm">
              <p className="text-sm font-medium">{lookProduct.name}</p>
              <p className="mt-1 text-sm text-neutral-600">
                ${Number(lookProduct.basePrice).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    id: lookProduct.id,
                    name: lookProduct.name,
                    slug: lookProduct.slug,
                    price: Number(lookProduct.basePrice),
                    image: lookProduct.images?.[0] || "",
                  })
                }
                className="mt-5 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md bg-black text-xs font-medium tracking-[0.12em] text-white uppercase transition hover:bg-neutral-800"
              >
                Add to cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* More products */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <SectionHeading>More to explore</SectionHeading>
        {productsLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : anyError ? (
          <ErrorState className="mt-10" onAction={() => refetchProducts()} />
        ) : (
          <ProductGrid
            products={products.filter((p) => !p.isFeatured).slice(0, 4)}
            emptyTitle="No products to explore yet"
          />
        )}
      </section>

      {/* Customer reviews from DB */}
      <LandingReviews />

      <LandingFaq />

      {/* Newsletter */}
      <NewsletterSignup lookImage={lookProduct?.images?.[0]} />
    </div>
  )
}

function NewsletterSignup({ lookImage }: { lookImage?: string }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)
    const trimmed = email.trim()
    if (!trimmed) {
      setError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address")
      return
    }
    setError(null)
    setSuccess(true)
    setEmail("")
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pattern-mesh relative overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-[radial-gradient(circle,rgba(139,43,226,0.18),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.06),transparent_70%)]" />

        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
              Members list
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Subscribe & get 10% off
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
              Early access to drops, restocks, and members-only offers — straight to your inbox.
            </p>
            <form
              className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex-1 text-left">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                    if (success) setSuccess(false)
                  }}
                  placeholder="Enter your email"
                  aria-invalid={Boolean(error)}
                  className={cn(
                    "h-11 w-full rounded-md border bg-white px-5 text-sm outline-none focus:border-black",
                    error ? "border-red-400" : "border-neutral-300"
                  )}
                />
                {error && <p className="mt-2 px-1 text-sm text-red-600">{error}</p>}
                {success && !error && (
                  <p className="mt-2 px-1 text-sm text-neutral-600">You are subscribed.</p>
                )}
              </div>
              <button
                type="submit"
                className="h-11 rounded-md bg-black px-8 text-xs font-medium tracking-[0.12em] text-white uppercase transition hover:bg-neutral-800"
              >
                Join
              </button>
            </form>
          </div>

          <div className="relative hidden min-h-[280px] lg:block">
            {lookImage ? (
              <Image
                src={lookImage}
                alt="Newsletter look"
                fill
                className="object-cover"
                sizes="40vw"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-200/70" />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#f3f1ef]" />
          </div>
        </div>
      </div>
    </section>
  )
}
