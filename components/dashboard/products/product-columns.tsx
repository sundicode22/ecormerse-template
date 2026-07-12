"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/hooks/api/useProducts"
import { useDeleteProduct } from "@/hooks/api/useProducts"
import { usePageModal } from "@/components/shared/page-modal"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { formatTableDate } from "@/lib/format-date"
import { TableImage } from "@/components/shared/table-image"

export function useProductColumns() {
  const { openModal } = usePageModal()
  const deleteProduct = useDeleteProduct()

  const columns: ColumnDef<Product>[] = [
    {
      id: "image",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => (
        <TableImage
          src={row.original.images?.[0]}
          alt={row.original.name}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("sku") || "—"}</span>
      ),
    },
    {
      accessorKey: "basePrice",
      header: "Price",
      cell: ({ row }) => `$${Number(row.getValue("basePrice")).toFixed(2)}`,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number
        return (
          <Badge variant={stock > 0 ? "secondary" : "destructive"}>
            {stock > 0 ? stock : "Out of stock"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant={product.isActive ? "default" : "outline"}>
              {product.isActive ? "Active" : "Draft"}
            </Badge>
            {product.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
            {product.isOnPromotion ? (
              <Badge variant="outline">Promo</Badge>
            ) : null}
          </div>
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              onEdit={() =>
                openModal("edit-product", { id: String(product.id) })
              }
              deleteTitle={`Delete “${product.name}”?`}
              deleteDescription="If this product appears on orders it will be deactivated instead of permanently removed."
              onDelete={() => deleteProduct.mutateAsync(product.id)}
            />
          </div>
        )
      },
    },
  ]

  return columns
}
