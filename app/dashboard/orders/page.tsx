"use client"

import { Suspense } from "react"
import { useOrders, useUpdateOrderStatus } from "@/hooks/api/useOrders"
import { DataTable } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ColumnDef } from "@tanstack/react-table"
import type { Order } from "@/hooks/api/useOrders"
import { formatTableDate } from "@/lib/format-date"
import { paymentMethodLabel } from "@/lib/shop-config"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  awaiting_payment: "bg-orange-100 text-orange-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const ORDER_STATUSES = [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

function OrdersContent() {
  const { data: ordersResponse, isLoading } = useOrders()
  const orders = ordersResponse?.data || []
  const updateStatus = useUpdateOrderStatus()

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
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
          <span className="text-sm">
            {address?.name || "—"}
          </span>
        )
      },
    },
    {
      id: "items",
      header: "Items",
      enableSorting: false,
      cell: ({ row }) => {
        const items = row.original.items || []
        const count = items.reduce((sum, item) => sum + item.quantity, 0)
        return <span className="text-sm">{count || 0}</span>
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) =>
        `$${Number(row.getValue("totalAmount")).toFixed(2)}`,
    },
    {
      accessorKey: "deliveryType",
      header: "Delivery",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue("deliveryType") as string}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => {
        const method = row.original.paymentMethod || "—"
        const phone = row.original.paymentPhone
        return (
          <div className="text-sm">
            <span>{paymentMethodLabel(method)}</span>
            {phone ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {phone}
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "products",
      header: "Products",
      enableSorting: false,
      cell: ({ row }) => {
        const items = row.original.items || []
        if (items.length === 0) return <span className="text-sm">—</span>
        return (
          <ul className="max-w-[220px] space-y-1 text-xs">
            {items.slice(0, 3).map((item) => (
              <li key={item.id} className="truncate">
                {item.productSlug ? (
                  <a
                    href={`/products/${item.productSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-black"
                  >
                    {item.productName || `#${item.productId}`}
                  </a>
                ) : (
                  item.productName || `#${item.productId}`
                )}{" "}
                ×{item.quantity}
              </li>
            ))}
            {items.length > 3 ? (
              <li className="text-muted-foreground">+{items.length - 3} more</li>
            ) : null}
          </ul>
        )
      },
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
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      </div>

      {updateStatus.isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to update order status. Please try again.
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
          data={orders}
          searchKey="id"
          searchPlaceholder="Search orders..."
          filters={[
            { id: "status", label: "Status" },
            { id: "deliveryType", label: "Delivery" },
            { id: "paymentMethod", label: "Payment" },
          ]}
        />
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <OrdersContent />
    </Suspense>
  )
}
