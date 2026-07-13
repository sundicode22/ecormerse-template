import type { PaymentMethod } from "@/lib/shop-config"
import { getShopPaymentConfig, paymentMethodLabel } from "@/lib/shop-config"

export type WhatsAppOrderLine = {
  name: string
  slug?: string | null
  quantity: number
  price: number
  variations?: Record<string, string> | null
}

export type WhatsAppOrderPayload = {
  orderId: string
  totalAmount: number
  deliveryType: string
  paymentMethod: PaymentMethod
  paymentPhone?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  shippingSummary?: string | null
  items: WhatsAppOrderLine[]
}

function deliveryLabel(type: string) {
  if (type === "pickup") return "Shop pickup"
  if (type === "local") return "Local delivery"
  if (type === "international") return "International (quote by weight)"
  return type
}

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`
}

function productUrl(siteUrl: string, slug?: string | null) {
  if (!slug) return null
  return `${siteUrl}/products/${slug}`
}

/** Build a WhatsApp message the shop owner can review (items + product links). */
export function buildWhatsAppOrderMessage(payload: WhatsAppOrderPayload) {
  const { siteUrl } = getShopPaymentConfig()
  const shortId = payload.orderId.slice(0, 8)
  const lines: string[] = [
    `New Sundi Buy order #${shortId}`,
    "",
    `Payment: ${paymentMethodLabel(payload.paymentMethod)}`,
  ]

  if (payload.paymentMethod === "mtn" || payload.paymentMethod === "orange") {
    lines.push(
      `Customer MoMo: ${payload.paymentPhone || "—"}`,
      "Status: awaiting Mobile Money payment"
    )
  } else {
    lines.push("Status: WhatsApp order — please confirm with customer")
  }

  lines.push(
    "",
    `Delivery: ${deliveryLabel(payload.deliveryType)}`,
  )

  if (payload.deliveryType === "international") {
    lines.push(
      "Shipping: TO BE QUOTED (varies by weight / destination)",
      `Items total: ${formatMoney(payload.totalAmount)}`,
      "Please reply with the shipping quote before payment."
    )
  } else {
    lines.push(`Total: ${formatMoney(payload.totalAmount)}`)
  }

  lines.push("")

  if (payload.customerName || payload.customerPhone || payload.customerEmail) {
    lines.push("Customer:")
    if (payload.customerName) lines.push(`• ${payload.customerName}`)
    if (payload.customerPhone) lines.push(`• ${payload.customerPhone}`)
    if (payload.customerEmail) lines.push(`• ${payload.customerEmail}`)
    lines.push("")
  }

  if (payload.shippingSummary) {
    lines.push("Address:", payload.shippingSummary, "")
  }

  lines.push("Items:")
  for (const item of payload.items) {
    const opts = item.variations
      ? Object.entries(item.variations)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : ""
    const lineTotal = item.price * item.quantity
    lines.push(
      `• ${item.name} × ${item.quantity} — ${formatMoney(lineTotal)}${opts ? ` (${opts})` : ""}`
    )
    const url = productUrl(siteUrl, item.slug)
    if (url) lines.push(`  ${url}`)
  }

  lines.push("", `Order page: ${siteUrl}/profile`)

  return lines.join("\n")
}

/** Opens chat with the shop owner, message prefilled. */
export function buildWhatsAppOrderUrl(payload: WhatsAppOrderPayload) {
  const { whatsappNumber } = getShopPaymentConfig()
  if (!whatsappNumber) return null

  const text = buildWhatsAppOrderMessage(payload)
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
}
