"use client"

import { useMemo } from "react"
import { useProducts } from "@/hooks/api/useProducts"
import { useOrders } from "@/hooks/api/useOrders"
import { useUsers } from "@/hooks/api/useUsers"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardStatCards } from "@/components/dashboard/overview/dashboard-stat-cards"
import {
  DeliveryChart,
  OrdersStatusChart,
  RevenueChart,
} from "@/components/dashboard/overview/dashboard-charts"
import { RecentOrdersList } from "@/components/dashboard/overview/recent-orders-list"
import {
  buildDeliveryBreakdown,
  buildOrdersByStatus,
  buildRevenueSeries,
  computeDashboardKpis,
  recentOrders,
} from "@/lib/dashboard-stats"

export default function DashboardPage() {
  const { data: productsResponse, isLoading: productsLoading } = useProducts()
  const { data: ordersResponse, isLoading: ordersLoading } = useOrders()
  const { data: usersResponse, isLoading: usersLoading } = useUsers()

  const products = productsResponse?.data || []
  const orders = ordersResponse?.data || []
  const users = usersResponse?.data || []
  const loading = productsLoading || ordersLoading || usersLoading

  const kpis = useMemo(
    () => computeDashboardKpis(products, orders, users),
    [products, orders, users]
  )
  const revenueSeries = useMemo(() => buildRevenueSeries(orders, 14), [orders])
  const statusSeries = useMemo(() => buildOrdersByStatus(orders), [orders])
  const deliverySeries = useMemo(() => buildDeliveryBreakdown(orders), [orders])
  const latestOrders = useMemo(() => recentOrders(orders, 6), [orders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store performance overview from live catalog and order data.
        </p>
      </div>

      <DashboardStatCards kpis={kpis} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-card p-5 xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Revenue (14 days)</h2>
            <p className="text-xs text-muted-foreground">
              Daily totals excluding cancelled orders
            </p>
          </div>
          {ordersLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <RevenueChart data={revenueSeries} />
          )}
        </div>

        <div className="rounded-xl bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Delivery mix</h2>
            <p className="text-xs text-muted-foreground">
              Pickup vs local vs international
            </p>
          </div>
          {ordersLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <DeliveryChart data={deliverySeries} />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Orders by status</h2>
            <p className="text-xs text-muted-foreground">
              Current pipeline across all orders
            </p>
          </div>
          {ordersLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <OrdersStatusChart data={statusSeries} />
          )}
        </div>

        <RecentOrdersList orders={latestOrders} loading={ordersLoading} />
      </div>
    </div>
  )
}
