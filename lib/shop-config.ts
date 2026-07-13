/**
 * Public shop payment / contact config (safe for client).
 * Set these in .env — used for Mobile Money instructions and WhatsApp handoff.
 */
export function getShopPaymentConfig() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")

  return {
    siteUrl,
    whatsappNumber: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""),
    mtnMomoNumber: process.env.NEXT_PUBLIC_MTN_MOMO_NUMBER || "",
    orangeMoneyNumber: process.env.NEXT_PUBLIC_ORANGE_MONEY_NUMBER || "",
  }
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

export type PaymentMethod = "mtn" | "orange" | "whatsapp"

export function paymentMethodLabel(method: string) {
  if (method === "mtn") return "MTN Mobile Money"
  if (method === "orange") return "Orange Money"
  if (method === "whatsapp") return "WhatsApp order"
  return method
}
