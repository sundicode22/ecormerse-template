"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Logout01Icon,
  Menu01Icon,
  Search01Icon,
  ShoppingBag02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { isAdmin } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"

const CENTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shop", label: "Store" },
]

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const { cartCount } = useCart()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isSignedIn = status === "authenticated" && Boolean(session?.user)
  const user = session?.user
  const showDashboard = isAdmin(user?.role)

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="flex items-center justify-start gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="p-1 text-black transition-opacity hover:opacity-60 md:hidden"
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.8} className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full gap-0 p-0 sm:max-w-sm"
            >
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="font-display text-left text-xl font-medium tracking-tight">
                  Sundi Buy
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3 py-4">
                {CENTER_LINKS.map((link) => {
                  const active = isLinkActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-md px-3 py-3 text-base font-medium capitalize transition-colors",
                        active
                          ? "bg-neutral-100 text-black"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="font-display text-lg font-medium tracking-tight text-black transition-opacity hover:opacity-60"
          >
            Sundi Buy
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-7 text-sm font-medium capitalize text-black md:flex">
          {CENTER_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-opacity hover:opacity-60",
                  active && "underline underline-offset-4"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <Link
            href="/search"
            className={cn(
              "p-1 text-black transition-opacity hover:opacity-60",
              pathname.startsWith("/search") && "opacity-100"
            )}
            aria-label="Search"
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className="size-5" />
          </Link>

          {status === "loading" ? (
            <Skeleton className="size-8 rounded-full" />
          ) : isSignedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 data-[state=open]:opacity-70"
                  aria-label="Account menu"
                >
                  <Avatar>
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name ?? "Account"} />
                    ) : null}
                    <AvatarFallback className="bg-neutral-100 text-xs font-medium text-black">
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {user.name || "Account"}
                    </span>
                    {user.email ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <HugeiconsIcon icon={UserIcon} strokeWidth={1.8} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {showDashboard ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <HugeiconsIcon
                          icon={DashboardSquare01Icon}
                          strokeWidth={1.8}
                        />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.8} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Link
            href="/cart"
            className={cn(
              "relative p-1 text-black transition-opacity hover:opacity-60",
              pathname.startsWith("/cart") && "opacity-100"
            )}
            aria-label="Bag"
          >
            <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={1.8} className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-black text-[9px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
