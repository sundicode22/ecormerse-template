import Link from "next/link"

const FOOTER_COLS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/shop?category=new", label: "New Arrivals" },
      { href: "/shop?category=essentials", label: "Essentials" },
      { href: "/shop?category=bestsellers", label: "Best Sellers" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/faq", label: "FAQ" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="text-2xl font-semibold tracking-wide">SAAKINUN</p>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              Modern essentials designed with care — cultural craft meeting western ease.
            </p>
            <div className="flex gap-4 pt-2 text-neutral-400">
              {["Instagram", "TikTok", "Pinterest"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="text-xs tracking-wider uppercase transition-colors hover:text-white"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold tracking-[0.16em] uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-neutral-400">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 pt-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SAAKINUN. All rights reserved.</p>
          <div className="flex gap-3 tracking-wide uppercase">
            {["Visa", "Mastercard", "Amex", "PayPal"].map((m) => (
              <span key={m} className="bg-neutral-900 px-2 py-1 text-[10px]">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
