"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardKpis } from "@/lib/dashboard-stats"

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

type StatCardProps = {
  label: string
  value: string | number
  hint?: string
  loading?: boolean
}

function StatCard({ label, value, hint, loading }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function DashboardStatCards({
  kpis,
  loading,
}: {
  kpis: DashboardKpis
  loading: boolean
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Revenue"
        value={formatMoney(kpis.revenue)}
        hint={`Avg order ${formatMoney(kpis.avgOrderValue)}`}
        loading={loading}
      />
      <StatCard
        label="Orders"
        value={kpis.orderCount}
        hint={`${kpis.pendingOrders} pending`}
        loading={loading}
      />
      <StatCard
        label="Products"
        value={kpis.productCount}
        hint={`${kpis.activeProducts} active · ${kpis.lowStockCount} low stock`}
        loading={loading}
      />
      <StatCard
        label="Users"
        value={kpis.userCount}
        hint={`${kpis.adminCount} admins · ${kpis.deliveryCount} deliveries`}
        loading={loading}
      />
    </div>
  )
}
