import { ShopPageHeader, TextLink } from "@/components/shop/page-header"

export default function ReturnsPage() {
  return (
    <div>
      <ShopPageHeader
        title="Returns"
        description="A simple returns process for unused items in original condition."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-neutral-600">
          <section>
            <h2 className="text-2xl text-black">
              30-day window
            </h2>
            <p className="mt-3">
              Return eligible items within 30 days of delivery. Items must be unworn, unwashed, and
              include original tags.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">
              How to start
            </h2>
            <p className="mt-3">
              Contact customer care with your order number. We will send a return label and
              instructions for drop-off or pickup.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">
              Refunds
            </h2>
            <p className="mt-3">
              Refunds are issued to the original payment method once the return is received and
              inspected.
            </p>
          </section>
        </div>
        <div className="mt-12">
          <TextLink href="/contact">Contact support</TextLink>
        </div>
      </div>
    </div>
  )
}
