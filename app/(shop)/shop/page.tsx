import { Suspense } from "react"
import { ShopCatalog } from "@/components/shop/shop-catalog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Skeleton className="mx-auto h-10 w-40" />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-none" />
            ))}
          </div>
        </div>
      }
    >
      <ShopCatalog />
    </Suspense>
  )
}
