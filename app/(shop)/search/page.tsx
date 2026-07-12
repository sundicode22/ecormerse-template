import { Suspense } from "react"
import { SearchPageContent } from "@/components/shop/search-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-20">
          <Skeleton className="mx-auto h-10 w-40 rounded-md" />
          <Skeleton className="mt-8 h-14 w-full rounded-md" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
