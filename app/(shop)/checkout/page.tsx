"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCart } from "@/hooks/useCart"
import { useCreateOrder } from "@/hooks/api/useOrders"
import {
  useAddresses,
  useCreateAddress,
  type SavedAddress,
} from "@/hooks/api/useAddresses"
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/validations/checkout"
import { EmptyState } from "@/components/shared/app-state"
import { FormAlert, mutationErrorMessage } from "@/components/shared/form-alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  DeliveryBox01Icon,
  Location01Icon,
  Store01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const DELIVERY_OPTIONS = [
  {
    type: "pickup" as const,
    label: "Shop pickup",
    description: "Collect from our flagship store",
    cost: "Free",
    icon: Store01Icon,
  },
  {
    type: "local" as const,
    label: "Local DHL",
    description: "2–5 business days",
    cost: "$10.00",
    icon: DeliveryBox01Icon,
  },
  {
    type: "international" as const,
    label: "International DHL",
    description: "5–10 business days",
    cost: "$35.00",
    icon: DeliveryBox01Icon,
  },
]

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "France",
  "Germany",
  "Ireland",
  "Netherlands",
  "Nigeria",
  "South Africa",
  "United Arab Emirates",
]


function applySavedAddress(
  form: ReturnType<typeof useForm<CheckoutInput>>,
  address: SavedAddress
) {
  form.setValue("shippingAddress", {
    name: address.name,
    line1: address.line1,
    line2: address.line2 || "",
    city: address.city,
    state: address.state || "",
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone || "",
  }, { shouldValidate: true, shouldDirty: true })
  form.clearErrors("shippingAddress")
}

function StepHeading({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description?: string
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
        {step}
      </span>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-black">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { cart, cartTotal, clearCart } = useCart()
  const createOrderMutation = useCreateOrder()
  const createAddress = useCreateAddress()
  const { data: addressesResponse, isLoading: addressesLoading } = useAddresses(
    Boolean(session?.user)
  )
  const savedAddresses = addressesResponse?.data || []

  const [addressMode, setAddressMode] = useState<"saved" | "new">("new")
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [saveAddress, setSaveAddress] = useState(true)

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      deliveryType: "pickup",
      shippingAddress: {
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United Kingdom",
        phone: "",
      },
    },
  })

  const deliveryType = form.watch("deliveryType")

  useEffect(() => {
    if (!session?.user) return
    form.setValue("shippingAddress.name", session.user.name || "")
  }, [session?.user, form])

  useEffect(() => {
    if (deliveryType === "pickup") return
    if (savedAddresses.length === 0) {
      setAddressMode("new")
      setSelectedAddressId(null)
      return
    }
    const preferred =
      savedAddresses.find((a) => a.isDefault) || savedAddresses[0]
    setAddressMode("saved")
    setSelectedAddressId(preferred.id)
    applySavedAddress(form, preferred)
  }, [savedAddresses, deliveryType, form])

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-16">
        <EmptyState
          title="Your bag is empty"
          description="Add items to your bag before checking out."
          actionLabel="Continue shopping"
          actionHref="/shop"
        />
      </div>
    )
  }

  const deliveryCost = {
    pickup: 0,
    local: 10,
    international: 35,
  }[deliveryType]

  const totalAmount = cartTotal + deliveryCost
  const serverError = createOrderMutation.error
    ? mutationErrorMessage(
        createOrderMutation.error,
        "There was an error placing your order. Please try again."
      )
    : null

  const onSubmit = async (data: CheckoutInput) => {
    const orderItems = cart.map((item) => {
      const selectedVariations: Record<string, string> = {}
      if (item.selectedSize) selectedVariations.size = item.selectedSize
      if (item.selectedColor) selectedVariations.color = item.selectedColor
      return {
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        selectedVariations:
          Object.keys(selectedVariations).length > 0
            ? selectedVariations
            : undefined,
      }
    })

    const shippingAddress =
      data.deliveryType === "pickup"
        ? {
            name: data.shippingAddress.name,
            line1: "",
            city: "",
            postalCode: "",
            country: "",
            phone: data.shippingAddress.phone,
          }
        : data.shippingAddress

    if (
      data.deliveryType !== "pickup" &&
      addressMode === "new" &&
      saveAddress &&
      session?.user
    ) {
      try {
        await createAddress.mutateAsync({
          label: "Home",
          name: data.shippingAddress.name,
          line1: data.shippingAddress.line1,
          line2: data.shippingAddress.line2 || undefined,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state || undefined,
          postalCode: data.shippingAddress.postalCode,
          country: data.shippingAddress.country,
          phone: data.shippingAddress.phone || undefined,
          isDefault: savedAddresses.length === 0,
        })
      } catch {
        // Address save is optional — still place the order
      }
    }

    createOrderMutation.mutate(
      {
        deliveryType: data.deliveryType,
        totalAmount,
        shippingAddress,
        items: orderItems,
      },
      {
        onSuccess: () => {
          clearCart()
          router.push("/profile")
        },
      }
    )
  }

  return (
    <div className="bg-neutral-50/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Secure checkout
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Checkout
            </h1>
          </div>
          <Link
            href="/cart"
            className="text-sm text-neutral-600 underline-offset-4 hover:text-black hover:underline"
          >
            Back to bag
          </Link>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
            noValidate
          >
            <div className="space-y-5 lg:col-span-7">
              <FormAlert
                errors={form.formState.errors}
                serverError={serverError}
              />

              {/* Step 1 — Delivery */}
              <section className="rounded-2xl bg-white p-5 sm:p-6">
                <StepHeading
                  step={1}
                  title="Delivery method"
                  description="Choose how you want to receive your order."
                />

                <FormField
                  control={form.control}
                  name="deliveryType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {DELIVERY_OPTIONS.map((option) => {
                          const selected = field.value === option.type
                          return (
                            <button
                              key={option.type}
                              type="button"
                              onClick={() => {
                                form.setValue("deliveryType", option.type, {
                                  shouldDirty: true,
                                })
                                form.clearErrors("shippingAddress")
                              }}
                              className={cn(
                                "relative flex flex-col gap-3 rounded-xl border p-4 text-left transition",
                                selected
                                  ? "border-black bg-neutral-50"
                                  : "border-neutral-200 bg-white hover:border-neutral-300"
                              )}
                            >
                              {selected ? (
                                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-black text-white">
                                  <HugeiconsIcon
                                    icon={Tick02Icon}
                                    strokeWidth={2.5}
                                    className="size-3"
                                  />
                                </span>
                              ) : null}
                              <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                                <HugeiconsIcon
                                  icon={option.icon}
                                  strokeWidth={1.8}
                                  className="size-5"
                                />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-black">
                                  {option.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-neutral-500">
                                  {option.description}
                                </span>
                              </span>
                              <span className="text-sm font-medium text-black">
                                {option.cost}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Step 2 — Address or pickup */}
              <section className="rounded-2xl bg-white p-5 sm:p-6">
                {deliveryType !== "pickup" ? (
                  <>
                    <StepHeading
                      step={2}
                      title="Shipping address"
                      description="Select a saved address or enter a new one."
                    />

                    {addressesLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedAddresses.length > 0 ? (
                          <div className="grid gap-3">
                            {savedAddresses.map((address) => {
                              const selected =
                                addressMode === "saved" &&
                                selectedAddressId === address.id
                              return (
                                <button
                                  key={address.id}
                                  type="button"
                                  onClick={() => {
                                    setAddressMode("saved")
                                    setSelectedAddressId(address.id)
                                    applySavedAddress(form, address)
                                  }}
                                  className={cn(
                                    "relative rounded-xl border p-4 text-left transition",
                                    selected
                                      ? "border-black bg-neutral-50"
                                      : "border-neutral-200 hover:border-neutral-300"
                                  )}
                                >
                                  {selected ? (
                                    <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-black text-white">
                                      <HugeiconsIcon
                                        icon={Tick02Icon}
                                        strokeWidth={2.5}
                                        className="size-3"
                                      />
                                    </span>
                                  ) : null}
                                  <p className="text-sm font-semibold text-black">
                                    {address.label || "Address"}
                                    {address.isDefault ? (
                                      <span className="ml-2 text-xs font-normal text-neutral-500">
                                        Default
                                      </span>
                                    ) : null}
                                  </p>
                                  <p className="mt-1 text-sm text-neutral-600">
                                    {address.name}
                                    <br />
                                    {address.line1}
                                    {address.line2 ? `, ${address.line2}` : ""}
                                    <br />
                                    {address.city}
                                    {address.state ? `, ${address.state}` : ""}{" "}
                                    {address.postalCode}
                                    <br />
                                    {address.country}
                                    {address.phone ? (
                                      <>
                                        <br />
                                        {address.phone}
                                      </>
                                    ) : null}
                                  </p>
                                </button>
                              )
                            })}

                            <button
                              type="button"
                              onClick={() => {
                                setAddressMode("new")
                                setSelectedAddressId(null)
                                form.setValue("shippingAddress", {
                                  name: session?.user?.name || "",
                                  line1: "",
                                  line2: "",
                                  city: "",
                                  state: "",
                                  postalCode: "",
                                  country: "United Kingdom",
                                  phone: "",
                                })
                                form.clearErrors("shippingAddress")
                              }}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm font-medium transition",
                                addressMode === "new"
                                  ? "border-black bg-neutral-50 text-black"
                                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                              )}
                            >
                              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                              Use a new address
                            </button>
                          </div>
                        ) : null}

                        {(addressMode === "new" || savedAddresses.length === 0) && (
                          <div className="space-y-5">
                            {savedAddresses.length > 0 ? (
                              <p className="text-sm font-medium text-black">
                                New address details
                              </p>
                            ) : null}

                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormField
                                control={form.control}
                                name="shippingAddress.name"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Full name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. John Doe"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.phone"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Phone number</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. +44 20 7946 0192"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormField
                                control={form.control}
                                name="shippingAddress.line1"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Address line 1</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Street address"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.line2"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Address line 2</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Apartment, suite, unit (optional)"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="City"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State / region</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Optional"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal code</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="ZIP / postcode"
                                        className="bg-white"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="shippingAddress.country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select
                                      value={field.value || "United Kingdom"}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full rounded-md bg-white">
                                          <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {COUNTRIES.map((country) => (
                                          <SelectItem key={country} value={country}>
                                            {country}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="save-address"
                                checked={saveAddress}
                                onCheckedChange={(checked) =>
                                  setSaveAddress(checked === true)
                                }
                              />
                              <Label
                                htmlFor="save-address"
                                className="cursor-pointer font-normal text-neutral-700"
                              >
                                Save this address for next time
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <StepHeading
                      step={2}
                      title="Pickup details"
                      description="Tell us who will collect the order."
                    />

                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="shippingAddress.name"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Name on the order"
                                  className="bg-white"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress.phone"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Phone number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. +44 20 7946 0192"
                                  className="bg-white"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-800 ring-1 ring-neutral-200">
                          <HugeiconsIcon
                            icon={Location01Icon}
                            strokeWidth={1.8}
                            className="size-5"
                          />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-black">
                            Main Street Flagship Store
                          </p>
                          <p className="text-sm leading-relaxed text-neutral-600">
                            123 Regent Street, London, W1B 5AH
                            <br />
                            Mon–Sat 10:00–20:00 · Sun 12:00–18:00
                          </p>
                          <p className="pt-1 text-xs text-neutral-500">
                            Bring your confirmation email and a valid photo ID.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Order summary */}
            <aside className="lg:col-span-5">
              <div className="sticky top-20 space-y-5 rounded-2xl bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold tracking-tight text-black">
                    Order summary
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {cart.length} item{cart.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="space-y-4">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-black">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Qty {item.quantity}
                          {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                          {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                        </p>
                        <p className="mt-1 text-sm font-medium text-black">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      {deliveryType === "pickup"
                        ? "Pickup"
                        : `Shipping (${deliveryType})`}
                    </span>
                    <span>
                      {deliveryCost > 0
                        ? `$${deliveryCost.toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold text-black">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="h-11 w-full rounded-md bg-black text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {createOrderMutation.isPending
                    ? "Processing…"
                    : "Place order"}
                </Button>

                <p className="text-center text-[11px] leading-relaxed text-neutral-500">
                  By placing your order you agree to our terms of sale and
                  privacy policy.
                </p>
              </div>
            </aside>
          </form>
        </Form>
      </div>
    </div>
  )
}
