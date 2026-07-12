"use client"

import Link from "next/link"
import { useReviews } from "@/hooks/api/useReviews"
import { EmptyState, ErrorState } from "@/components/shared/app-state"
import { Skeleton } from "@/components/ui/skeleton"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-black" : "text-neutral-300"}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function LandingReviews() {
  const { data: reviews = [], isLoading, isError, refetch } = useReviews({ limit: 6 })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Customer reviews
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-neutral-500">
        Real feedback from people wearing the collection.
      </p>

      {isLoading ? (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          className="mt-10"
          description="Could not load reviews."
          onAction={() => refetch()}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No reviews yet"
          description="Be the first to review a product after signing in."
          actionLabel="Browse shop"
          actionHref="/shop"
        />
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col rounded-2xl bg-neutral-50 p-6"
            >
              <Stars rating={review.rating} />
              {review.title && (
                <h3 className="mt-3 text-sm font-semibold text-black">{review.title}</h3>
              )}
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                “{review.body}”
              </p>
              <div className="mt-5 flex items-center gap-3 pt-4">
                {review.product?.images?.[0] ? (
                  <Link
                    href={`/products/${review.product.slug}`}
                    className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.product.images[0]}
                      alt={review.product.name}
                      className="size-full object-cover"
                    />
                  </Link>
                ) : (
                  <div className="size-10 shrink-0 rounded-xl bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-black">
                    {review.authorName}
                  </p>
                  {review.product && (
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="truncate text-xs text-neutral-500 hover:text-black"
                    >
                      {review.product.name}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
