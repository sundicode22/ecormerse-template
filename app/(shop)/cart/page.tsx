"use client"

import Link from "next/link"
import { useCart } from "@/hooks/useCart"
import { EmptyState } from "@/components/shared/app-state"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, ShoppingBag02Icon } from "@hugeicons/core-free-icons"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-4 py-16">
        <EmptyState
          title="Your bag is empty"
          description="Add pieces from the store and they will show up here."
          actionLabel="Continue shopping"
          actionHref="/shop"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10 border-b border-neutral-200 pb-8">
        <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
          Shopping bag
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Your bag
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {cartCount} {cartCount === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-6 lg:col-span-8">
          {cart.map((item, index) => (
            <div
              key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}-${index}`}
              className="flex gap-4 border-b border-neutral-200 pb-6 sm:gap-5"
            >
              <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-28">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-neutral-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-black sm:text-base">
                      {item.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                      {item.selectedVariations &&
                      Object.keys(item.selectedVariations).length > 0
                        ? Object.entries(item.selectedVariations).map(
                            ([key, value]) => (
                              <span key={key}>
                                {key}: {value}
                              </span>
                            )
                          )
                        : null}
                      {!item.selectedVariations?.Size && item.selectedSize ? (
                        <span>Size: {item.selectedSize}</span>
                      ) : null}
                      {!item.selectedVariations?.Color &&
                      !item.selectedVariations?.Colour &&
                      item.selectedColor ? (
                        <span className="inline-flex items-center gap-1.5">
                          Color
                          <span
                            className="size-2.5 rounded-full border border-neutral-300"
                            style={{
                              backgroundColor: item.selectedColor.toLowerCase(),
                            }}
                          />
                        </span>
                      ) : null}
                      {item.selectedModifiers?.length
                        ? item.selectedModifiers.map((mod) => (
                            <span key={mod}>+ {mod}</span>
                          ))
                        : null}
                    </div>
                    <p className="mt-2 text-sm text-neutral-700">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-md border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="px-3 py-1.5 text-sm text-neutral-600 transition hover:text-black"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="px-3 py-1.5 text-sm text-neutral-600 transition hover:text-black"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item)}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500 transition hover:text-red-600"
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:sticky sm:top-20">
            <div className="flex items-center gap-2 text-sm font-medium text-black">
              <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={1.8} className="size-4" />
              Order summary
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-medium text-black">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold tracking-tight">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <Button
              asChild
              className="mt-6 h-11 w-full rounded-md text-xs font-medium tracking-[0.12em] uppercase"
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-neutral-600 underline-offset-4 hover:text-black hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
