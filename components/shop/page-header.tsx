import Link from "next/link"

export function ShopPageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="bg-white px-4 py-14 text-center sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">{title}</h1>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
          {description}
        </p>
      )}
    </div>
  )
}

export function TextLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md bg-black px-8 text-xs font-medium tracking-[0.12em] text-white uppercase transition hover:bg-neutral-800"
    >
      {children}
    </Link>
  )
}
