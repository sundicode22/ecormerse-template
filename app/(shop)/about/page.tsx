import Image from "next/image"
import { ShopPageHeader, TextLink } from "@/components/shop/page-header"

export default function AboutPage() {
  return (
    <div>
      <ShopPageHeader
        title="About"
        description="SAAKINUN builds modern essentials where cultural craft and western ease meet."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
            alt="About SAAKINUN"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Quiet luxury with intention
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            We design garments for people who dress with memory and ambition. Each piece balances
            soft structure, clean silhouettes, and materials chosen to last beyond a season.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            From everyday hoodies to tailored trousers, the edit stays focused — fewer things, made
            better, worn more.
          </p>
          <div className="mt-8">
            <TextLink href="/shop">Shop the collection</TextLink>
          </div>
        </div>
      </section>

      <section className="bg-neutral-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              title: "Craft",
              body: "Details that feel considered — seams, drape, and fabric hand.",
            },
            {
              title: "Clarity",
              body: "Western cuts kept simple so the wearer stays the focus.",
            },
            {
              title: "Continuity",
              body: "Seasonless colour and forms that return to your wardrobe.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-8">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
