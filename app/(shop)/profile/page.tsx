"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  ShoppingBag02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"
import { useCart } from "@/hooks/useCart"
import { useMyOrders, type Order } from "@/hooks/api/useOrders"
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  type SavedAddress,
} from "@/hooks/api/useAddresses"
import { shippingAddressSchema } from "@/lib/validations/checkout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PROFILE_TABS = [
  { id: "overview", name: "Overview" },
  { id: "orders", name: "My orders" },
  { id: "addresses", name: "My addresses" },
  { id: "personal", name: "Personal data" },
] as const

type TabId = (typeof PROFILE_TABS)[number]["id"]

const addressFormSchema = shippingAddressSchema.extend({
  label: z.string().min(1, "Label is required").max(40),
  isDefault: z.boolean().optional(),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

function formatMoney(amount: string | number) {
  const value = typeof amount === "string" ? Number(amount) : amount
  if (Number.isNaN(value)) return amount
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function deliveryLabel(type: string) {
  if (type === "pickup") return "Pickup"
  if (type === "international") return "International delivery"
  if (type === "local") return "Local delivery"
  return type
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ")
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { cartCount } = useCart()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  const userName = session?.user?.name || "there"
  const userEmail = session?.user?.email
  const activeLabel =
    PROFILE_TABS.find((tab) => tab.id === activeTab)?.name || "Profile"

  return (
    <div className="bg-neutral-50/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            My profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Manage your orders, saved addresses, and account details.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:col-span-3">
            {/* Mobile / tablet — full-width select, no horizontal scroll */}
            <div className="rounded-2xl bg-white p-3 lg:hidden">
              <Label htmlFor="profile-section" className="sr-only">
                Profile section
              </Label>
              <Select
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabId)}
              >
                <SelectTrigger
                  id="profile-section"
                  className="h-11 w-full rounded-md bg-neutral-50"
                >
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_TABS.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      {tab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 w-full rounded-md px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                Log out
              </button>
            </div>

            {/* Desktop — vertical sidebar */}
            <nav className="hidden flex-col gap-0.5 rounded-2xl bg-white p-3 lg:flex">
              {PROFILE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-neutral-100 font-medium text-black"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                  )}
                >
                  {tab.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                Log out
              </button>
            </nav>
          </aside>

          <main className="lg:col-span-9">
            {activeTab === "overview" ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-white p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div className="max-w-lg">
                      <h2 className="text-2xl font-semibold tracking-tight text-black">
                        Hello, {userName}
                      </h2>
                      {userEmail ? (
                        <p className="mt-1 text-sm text-neutral-500">{userEmail}</p>
                      ) : null}
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        Check recent orders, manage saved addresses, and jump
                        back into your bag.
                      </p>
                    </div>
                    <div className="shrink-0 space-y-1 text-sm text-neutral-600">
                      <p className="font-medium text-neutral-800">Need help?</p>
                      <Link
                        href="/contact"
                        className="block underline underline-offset-4 hover:text-black"
                      >
                        Contact support
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  <ProfileAction
                    label="Personal data"
                    onClick={() => setActiveTab("personal")}
                    icon={UserIcon}
                  />
                  <ProfileAction
                    label="My orders"
                    onClick={() => setActiveTab("orders")}
                    icon={ShoppingBag02Icon}
                  />
                  <ProfileAction
                    label="My addresses"
                    onClick={() => setActiveTab("addresses")}
                    icon={Location01Icon}
                  />
                  <Link
                    href="/cart"
                    className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-white p-5 text-center transition hover:bg-neutral-100/80"
                  >
                    <div className="relative rounded-lg bg-neutral-100 p-3 text-neutral-800">
                      <HugeiconsIcon
                        icon={ShoppingBag02Icon}
                        strokeWidth={1.8}
                        className="size-5"
                      />
                      {cartCount > 0 ? (
                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                          {cartCount}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-sm font-medium text-neutral-800">
                      My cart
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="min-h-[320px] rounded-2xl bg-white p-5 sm:p-6">
                <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase">
                  {activeLabel}
                </p>
                {activeTab === "orders" ? <OrdersPanel /> : null}
                {activeTab === "addresses" ? (
                  <AddressesPanel defaultName={session?.user?.name || ""} />
                ) : null}
                {activeTab === "personal" ? (
                  <PersonalPanel name={userName} email={userEmail} />
                ) : null}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfileAction({
  label,
  onClick,
  icon,
}: {
  label: string
  onClick: () => void
  icon: typeof UserIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-white p-5 text-center transition hover:bg-neutral-100/80"
    >
      <div className="rounded-lg bg-neutral-100 p-3 text-neutral-800">
        <HugeiconsIcon icon={icon} strokeWidth={1.8} className="size-5" />
      </div>
      <span className="text-sm font-medium text-neutral-800">{label}</span>
    </button>
  )
}

function OrdersPanel() {
  const { data, isLoading, isError } = useMyOrders()
  const orders = data?.data ?? []

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="mt-4 text-sm text-red-600">
        Could not load your orders. Please try again.
      </p>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-black sm:text-2xl">
          No orders yet
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
          When you place an order, it will show up here with status and delivery
          details.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-black px-6 text-xs font-medium tracking-[0.12em] text-white uppercase transition hover:bg-neutral-800"
        >
          Continue shopping
        </Link>
      </>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const itemCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <article className="rounded-xl bg-neutral-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-black">
            Order #{order.id.slice(0, 8)}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {formatDate(order.createdAt)} · {deliveryLabel(order.deliveryType)}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-black">
            {formatMoney(order.totalAmount)}
          </p>
          <p className="mt-1 text-xs font-medium tracking-wide text-neutral-500 uppercase">
            {statusLabel(order.status)}
          </p>
        </div>
      </div>
      {order.shippingAddress ? (
        <p className="mt-3 pt-3 text-sm text-neutral-600">
          {order.deliveryType === "pickup" ? (
            <>
              Pickup contact: {order.shippingAddress.name}
              {order.shippingAddress.phone
                ? ` · ${order.shippingAddress.phone}`
                : ""}
            </>
          ) : (
            <>
              Ship to {order.shippingAddress.name}, {order.shippingAddress.line1}
              {order.shippingAddress.city
                ? `, ${order.shippingAddress.city}`
                : ""}
              {order.shippingAddress.country
                ? `, ${order.shippingAddress.country}`
                : ""}
            </>
          )}
        </p>
      ) : null}
    </article>
  )
}

function AddressesPanel({ defaultName }: { defaultName: string }) {
  const { data, isLoading, isError } = useAddresses()
  const createAddress = useCreateAddress()
  const deleteAddress = useDeleteAddress()
  const [showForm, setShowForm] = useState(false)
  const addresses = data?.data ?? []

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: "Home",
      name: defaultName,
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United Kingdom",
      phone: "",
      isDefault: addresses.length === 0,
    },
  })

  async function onSubmit(values: AddressFormValues) {
    await createAddress.mutateAsync({
      label: values.label,
      name: values.name,
      line1: values.line1,
      line2: values.line2 || undefined,
      city: values.city,
      state: values.state || undefined,
      postalCode: values.postalCode,
      country: values.country,
      phone: values.phone,
      isDefault: values.isDefault,
    })
    form.reset({
      label: "Home",
      name: defaultName,
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United Kingdom",
      phone: "",
      isDefault: false,
    })
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="mt-4 text-sm text-red-600">
        Could not load your addresses. Please try again.
      </p>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {addresses.length === 0 && !showForm ? (
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
            No saved addresses
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
            Save a delivery address to speed up checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => deleteAddress.mutateAsync(address.id)}
              deleting={deleteAddress.isPending}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl bg-neutral-50 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-black">Add address</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" placeholder="Home" {...form.register("label")} />
              {form.formState.errors.label ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.label.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" {...form.register("line1")} />
              {form.formState.errors.line1 ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.line1.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" {...form.register("line2")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} />
              {form.formState.errors.city ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.city.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">County / state</Label>
              <Input id="state" {...form.register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" {...form.register("postalCode")} />
              {form.formState.errors.postalCode ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.postalCode.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...form.register("country")} />
              {form.formState.errors.country ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.country.message}
                </p>
              ) : null}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <Checkbox
              checked={form.watch("isDefault") ?? false}
              onCheckedChange={(checked) =>
                form.setValue("isDefault", checked === true)
              }
            />
            Set as default address
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={createAddress.isPending}>
              {createAddress.isPending ? "Saving…" : "Save address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          onClick={() => {
            form.reset({
              label: "Home",
              name: defaultName,
              line1: "",
              line2: "",
              city: "",
              state: "",
              postalCode: "",
              country: "United Kingdom",
              phone: "",
              isDefault: addresses.length === 0,
            })
            setShowForm(true)
          }}
        >
          Add address
        </Button>
      )}
    </div>
  )
}

function AddressCard({
  address,
  onDelete,
  deleting,
}: {
  address: SavedAddress
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl bg-neutral-50 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div>
        <p className="text-sm font-semibold text-black">
          {address.label || "Address"}
          {address.isDefault ? (
            <span className="ml-2 text-xs font-normal text-neutral-500">
              Default
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          {address.name}
          <br />
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
          <br />
          {address.city}
          {address.state ? `, ${address.state}` : ""} {address.postalCode}
          <br />
          {address.country}
          {address.phone ? (
            <>
              <br />
              {address.phone}
            </>
          ) : null}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={deleting}
        onClick={onDelete}
        className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Delete
      </Button>
    </article>
  )
}

function PersonalPanel({
  name,
  email,
}: {
  name: string
  email?: string | null
}) {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Personal details
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
          These details come from your sign-in account.
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-neutral-50 p-4">
          <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Name
          </dt>
          <dd className="mt-1 text-sm font-medium text-black">{name}</dd>
        </div>
        <div className="rounded-xl bg-neutral-50 p-4">
          <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Email
          </dt>
          <dd className="mt-1 text-sm font-medium text-black">
            {email || "—"}
          </dd>
        </div>
      </dl>
    </div>
  )
}
