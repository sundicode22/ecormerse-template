"use client"

import { Suspense } from "react"
import { useDeliveryOrders, useUpdateOrderStatus } from "@/hooks/api/useOrders"
import { DataTable } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ColumnDef } from "@tanstack/react-table"
import type { Order } from "@/hooks/api/useOrders"
import { formatTableDate } from "@/lib/format-date"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const DELIVERY_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

function formatAddress(order: Order) {
  const address = order.shippingAddress
  if (!address) return "—"
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean)
  return parts.join(", ")
}

function DeliveriesContent() {
  const { data: deliveriesResponse, isLoading } = useDeliveryOrders()
  const deliveries = deliveriesResponse?.data || []
  const updateStatus = useUpdateOrderStatus()

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Request",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {(row.getValue("id") as string).slice(0, 8)}…
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      enableSorting: false,
      cell: ({ row }) => {
        const address = row.original.shippingAddress
        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{address?.name || "—"}</p>
            {address?.phone && (
              <p className="text-xs text-muted-foreground">{address.phone}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "deliveryType",
      header: "Carrier",
      cell: ({ row }) => {
        const type = row.getValue("deliveryType") as string
        return (
          <Badge variant="outline" className="capitalize">
            DHL {type === "international" ? "Express" : "Local"}
          </Badge>
        )
      },
    },
    {
      id: "destination",
      header: "Ship to",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[280px] text-sm text-muted-foreground">
          {formatAddress(row.original)}
        </span>
      ),
    },
    {
      id: "items",
      header: "Items",
      enableSorting: false,
      cell: ({ row }) => {
        const items = row.original.items || []
        const count = items.reduce((sum, item) => sum + item.quantity, 0)
        return <span className="text-sm">{count}</span>
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) =>
        `$${Number(row.getValue("totalAmount")).toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const order = row.original
        const isUpdating =
          updateStatus.isPending && updateStatus.variables?.id === order.id
        return (
          <select
            className={`rounded-md border px-2 py-1 text-xs font-medium capitalize disabled:opacity-60 ${statusColors[order.status] || ""}`}
            value={order.status}
            disabled={isUpdating}
            onChange={(e) =>
              updateStatus.mutate({
                id: order.id,
                status: e.target.value,
              })
            }
          >
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatTableDate(row.getValue("createdAt")),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => formatTableDate(row.getValue("updatedAt")),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Local and international DHL shipments from checkout.
        </p>
      </div>

      {updateStatus.isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to update delivery status. Please try again.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={deliveries}
          searchKey="id"
          searchPlaceholder="Search delivery requests..."
          filters={[
            { id: "status", label: "Status" },
            { id: "deliveryType", label: "Delivery" },
          ]}
        />
      )}
    </div>
  )
}

export default function DeliveriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <DeliveriesContent />
    </Suspense>
  )
}
