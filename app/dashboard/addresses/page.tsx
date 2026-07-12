"use client"

import { Suspense } from "react"
import { useAdminAddresses } from "@/hooks/api/useAddresses"
import { useAddressColumns } from "@/components/dashboard/addresses/address-columns"
import { DataTable } from "@/components/shared/data-table"
import { Skeleton } from "@/components/ui/skeleton"

function AddressesContent() {
  const { data: addressesResponse, isLoading } = useAdminAddresses()
  const addresses = addressesResponse?.data || []
  const columns = useAddressColumns()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Addresses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All saved shipping addresses across customer accounts.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={addresses}
          searchKey="name"
          searchPlaceholder="Search by recipient…"
          filters={[
            { id: "country", label: "Country" },
            { id: "label", label: "Label" },
          ]}
        />
      )}
    </div>
  )
}

export default function AddressesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <AddressesContent />
    </Suspense>
  )
}
