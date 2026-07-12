import type { Order } from "@/hooks/api/useOrders"
import type { Product } from "@/hooks/api/useProducts"
import type { AdminUser } from "@/hooks/api/useUsers"

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toDayKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export type DashboardKpis = {
  productCount: number
  activeProducts: number
  lowStockCount: number
  orderCount: number
  pendingOrders: number
  revenue: number
  avgOrderValue: number
  userCount: number
  adminCount: number
  deliveryCount: number
}

export function computeDashboardKpis(
  products: Product[],
  orders: Order[],
  users: AdminUser[]
): DashboardKpis {
  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  )
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const deliveryCount = orders.filter(
    (o) => o.deliveryType === "local" || o.deliveryType === "international"
  ).length

  return {
    productCount: products.length,
    activeProducts: products.filter((p) => p.isActive).length,
    lowStockCount: products.filter((p) => p.stock > 0 && p.stock < 5).length,
    orderCount: orders.length,
    pendingOrders,
    revenue,
    avgOrderValue: orders.length ? revenue / orders.length : 0,
    userCount: users.length,
    adminCount: users.filter((u) => u.role === "admin").length,
    deliveryCount,
  }
}

export type RevenueDayPoint = {
  date: string
  label: string
  revenue: number
  orders: number
}

export function buildRevenueSeries(
  orders: Order[],
  days = 14
): RevenueDayPoint[] {
  const today = startOfDay(new Date())
  const map = new Map<string, { revenue: number; orders: number }>()

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today.getTime() - i * DAY_MS)
    map.set(toDayKey(day), { revenue: 0, orders: 0 })
  }

  for (const order of orders) {
    if (!order.createdAt) continue
    if (order.status === "cancelled") continue
    const key = toDayKey(new Date(order.createdAt))
    const bucket = map.get(key)
    if (!bucket) continue
    bucket.revenue += Number(order.totalAmount || 0)
    bucket.orders += 1
  }

  return [...map.entries()].map(([date, values]) => ({
    date,
    label: new Date(date + "T12:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    revenue: Number(values.revenue.toFixed(2)),
    orders: values.orders,
  }))
}

export type StatusPoint = {
  status: string
  label: string
  count: number
  fill: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--chart-4)",
  paid: "var(--chart-3)",
  processing: "var(--chart-2)",
  shipped: "var(--chart-2)",
  delivered: "var(--chart-1)",
  cancelled: "var(--chart-5)",
}

export function buildOrdersByStatus(orders: Order[]): StatusPoint[] {
  const counts = new Map<string, number>()
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) || 0) + 1)
  }

  return [...counts.entries()]
    .map(([status, count]) => ({
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: STATUS_COLORS[status] || "var(--chart-3)",
    }))
    .sort((a, b) => b.count - a.count)
}

export type DeliveryPoint = {
  type: string
  label: string
  count: number
  fill: string
}

const DELIVERY_COLORS: Record<string, string> = {
  pickup: "var(--chart-1)",
  local: "var(--chart-2)",
  international: "var(--chart-3)",
}

export function buildDeliveryBreakdown(orders: Order[]): DeliveryPoint[] {
  const counts = new Map<string, number>()
  for (const order of orders) {
    const type = order.deliveryType || "pickup"
    counts.set(type, (counts.get(type) || 0) + 1)
  }

  const labels: Record<string, string> = {
    pickup: "Pickup",
    local: "Local DHL",
    international: "International",
  }

  return [...counts.entries()]
    .map(([type, count]) => ({
      type,
      label: labels[type] || type,
      count,
      fill: DELIVERY_COLORS[type] || "var(--chart-4)",
    }))
    .sort((a, b) => b.count - a.count)
}

export function recentOrders(orders: Order[], limit = 6): Order[] {
  return [...orders]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, limit)
}
