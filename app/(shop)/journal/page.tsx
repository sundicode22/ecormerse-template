import { ShopPageHeader } from "@/components/shop/page-header"
import { EmptyState } from "@/components/shared/app-state"

export default function JournalPage() {
  return (
    <div>
      <ShopPageHeader
        title="Journal"
        description="Stories on fit, fabric, and the quieter side of modern dress."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="No journal posts yet"
          description="Editorial posts will appear here once they are published from the backend."
          actionLabel="Browse shop"
          actionHref="/shop"
        />
      </div>
    </div>
  )
}
