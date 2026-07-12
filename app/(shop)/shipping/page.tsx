import { ShopPageHeader, TextLink } from "@/components/shop/page-header"

export default function ShippingPage() {
  return (
    <div>
      <ShopPageHeader
        title="Shipping"
        description="Straightforward delivery options for local and international orders."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-neutral-600">
          <section>
            <h2 className="text-2xl text-black">
              Standard delivery
            </h2>
            <p className="mt-3">
              Orders typically ship within 1–3 business days. Free standard shipping applies on
              orders over $100.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">
              Express & international
            </h2>
            <p className="mt-3">
              Express options are available at checkout. International delivery times vary by
              destination and customs processing.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">
              Tracking
            </h2>
            <p className="mt-3">
              Once your order ships, you will receive a confirmation email with tracking details.
            </p>
          </section>
        </div>
        <div className="mt-12">
          <TextLink href="/shop">Continue shopping</TextLink>
        </div>
      </div>
    </div>
  )
}
