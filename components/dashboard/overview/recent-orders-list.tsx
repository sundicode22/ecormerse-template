"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTableDate } from "@/lib/format-date"
import type { Order } from "@/hooks/api/useOrders"

export function RecentOrdersList({
  orders,
  loading,
}: {
  orders: Order[]
  loading: boolean
}) {
  return (
    <div className="rounded-xl bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <p className="text-xs text-muted-foreground">Latest store activity</p>
        </div>
        <Link
          href="/dashboard/orders"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="divide-y">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-mono font-medium">
                  {order.id.slice(0, 8)}…
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {order.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTableDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <p className="shrink-0 font-medium">
                ${Number(order.totalAmount).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
