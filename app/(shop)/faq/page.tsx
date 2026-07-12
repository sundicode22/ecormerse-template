import { ShopPageHeader, TextLink } from "@/components/shop/page-header"

const FAQS = [
  {
    q: "How do I find my size?",
    a: "Each product page includes a size guide. If you are between sizes, we generally recommend sizing up for a relaxed fit.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes — free standard shipping on orders over $100. Express options are available at checkout.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Contact us as soon as possible. If the order has not shipped, we can usually update or cancel it.",
  },
  {
    q: "How do returns work?",
    a: "Eligible items can be returned within 30 days. Visit the Returns page for the full process.",
  },
  {
    q: "Where are products made?",
    a: "We work with selected partners and focus on materials and finishes that last through daily wear.",
  },
]

export default function FaqPage() {
  return (
    <div>
      <ShopPageHeader
        title="FAQ"
        description="Quick answers about sizing, shipping, and orders."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="divide-y divide-neutral-100">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <h2 className="text-xl text-black">
                {item.q}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <TextLink href="/contact">Still need help?</TextLink>
        </div>
      </div>
    </div>
  )
}
