"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMyOrders } from "@/hooks/api/useOrders"
import {
  getShopPaymentConfig,
  paymentMethodLabel,
  type PaymentMethod,
} from "@/lib/shop-config"
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp-order"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function shippingSummary(
  address: {
    name: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  } | null,
  deliveryType: string
) {
  if (!address) return null
  if (deliveryType === "pickup") {
    return `Pickup — ${address.name}${address.phone ? ` · ${address.phone}` : ""}`
  }
  return [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .join("\n")
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { data: session } = useSession()
  const { data, isLoading, isError } = useMyOrders()
  const [autoOpened, setAutoOpened] = useState(false)
  const paymentConfig = getShopPaymentConfig()

  const order = useMemo(
    () => (data?.data || []).find((item) => item.id === orderId),
    [data?.data, orderId]
  )

  const whatsappUrl = useMemo(() => {
    if (!order) return null
    const method = (order.paymentMethod || "whatsapp") as PaymentMethod
    return buildWhatsAppOrderUrl({
      orderId: order.id,
      totalAmount: Number(order.totalAmount),
      deliveryType: order.deliveryType,
      paymentMethod: method,
      paymentPhone: order.paymentPhone,
      customerName: order.shippingAddress?.name || session?.user?.name,
      customerPhone: order.shippingAddress?.phone,
      customerEmail: session?.user?.email,
      shippingSummary: shippingSummary(
        order.shippingAddress,
        order.deliveryType
      ),
      items: (order.items || []).map((item) => ({
        name: item.productName || `Product #${item.productId}`,
        slug: item.productSlug,
        quantity: item.quantity,
        price: Number(item.price),
        variations: item.selectedVariations,
      })),
    })
  }, [order, session?.user?.email, session?.user?.name])

  useEffect(() => {
    if (!order || autoOpened) return
    if (order.paymentMethod !== "whatsapp" || !whatsappUrl) return
    setAutoOpened(true)
    window.location.href = whatsappUrl
  }, [order, whatsappUrl, autoOpened])

  if (!orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-black">Order confirmed</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Your order was placed. View it in your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/profile">Go to profile</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-black">Order placed</h1>
        <p className="mt-3 text-sm text-neutral-600">
          We could not load order details here. Check your profile for the order.
        </p>
        <Button asChild className="mt-6">
          <Link href="/profile">Go to profile</Link>
        </Button>
      </div>
    )
  }

  const method = order.paymentMethod as PaymentMethod
  const isMomo = method === "mtn" || method === "orange"
  const isInternationalQuote = order.deliveryType === "international"
  const payTo =
    method === "mtn"
      ? paymentConfig.mtnMomoNumber
      : method === "orange"
        ? paymentConfig.orangeMoneyNumber
        : ""

  return (
    <div className="bg-neutral-50/80">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
          {isInternationalQuote ? "Quote requested" : "Order placed"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Order #{order.id.slice(0, 8)} · {paymentMethodLabel(method)}
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-white p-5 sm:p-6">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">
              {isInternationalQuote ? "Items total" : "Total"}
            </span>
            <span className="font-semibold text-black">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
          {isInternationalQuote ? (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Shipping</span>
              <span className="font-medium text-black">Quoted on WhatsApp</span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Status</span>
            <span className="font-medium capitalize text-black">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          {isInternationalQuote ? (
            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-medium text-black">International shipping quote</p>
              <p className="mt-2">
                Shipping cost depends on package weight and destination. Open
                WhatsApp so we can review your order and send you the shipping
                quote before payment.
              </p>
            </div>
          ) : isMomo ? (
            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-medium text-black">Pay with Mobile Money</p>
              <p className="mt-2">
                Send{" "}
                <span className="font-semibold text-black">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>{" "}
                via {paymentMethodLabel(method)} to:
              </p>
              <p className="mt-2 text-lg font-semibold tracking-wide text-black">
                {payTo || "Configure shop MoMo number in .env"}
              </p>
              {order.paymentPhone ? (
                <p className="mt-2 text-xs text-neutral-500">
                  Paying from: {order.paymentPhone}
                </p>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed">
                After paying, notify the shop on WhatsApp so they can confirm
                your order. The message includes product links for the owner.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-medium text-black">WhatsApp order</p>
              <p className="mt-2">
                Your order details and product links are ready to send to the
                shop owner on WhatsApp.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {whatsappUrl ? (
              <Button asChild className="h-11 w-full">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {isInternationalQuote
                    ? "Open WhatsApp for shipping quote"
                    : isMomo
                      ? "Notify shop on WhatsApp"
                      : "Open WhatsApp with order"}
                </a>
              </Button>
            ) : (
              <p className="text-sm text-red-600">
                WhatsApp number is not configured
                (NEXT_PUBLIC_WHATSAPP_NUMBER).
              </p>
            )}
            <Button asChild variant="outline" className="h-11 w-full">
              <Link href="/profile">View my orders</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 w-full">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg space-y-4 px-4 py-16">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
