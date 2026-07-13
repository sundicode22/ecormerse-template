import { ShopPageHeader, TextLink } from "@/components/shop/page-header"

export default function ShippingPage() {
  return (
    <div>
      <ShopPageHeader
        title="Shipping"
        description="Local delivery at a fixed rate. International shipping is quoted by weight."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-neutral-600">
          <section>
            <h2 className="text-2xl text-black">Shop pickup</h2>
            <p className="mt-3">
              Collect your order from our store at no extra cost. Bring a valid
              ID matching the name on the order.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">Local delivery</h2>
            <p className="mt-3">
              Local orders use a fixed delivery fee shown at checkout (currently
              $10). Most local deliveries arrive within 2–5 business days.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">International shipping</h2>
            <p className="mt-3">
              International rates vary by package weight and destination, so we
              do not charge a fixed shipping fee online. Submit your order as a
              quote request and we will confirm shipping cost with you on
              WhatsApp before you pay.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-black">Tracking</h2>
            <p className="mt-3">
              Once your order ships, we share tracking details by message or
              email.
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
