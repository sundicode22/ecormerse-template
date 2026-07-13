"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShopPageHeader, TextLink } from "@/components/shop/page-header"
import { FormAlert } from "@/components/shared/form-alert"
import { contactSchema, type ContactInput } from "@/lib/validations/contact"
import { notify } from "@/lib/toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", message: "" },
  })

  const onSubmit = async (_data: ContactInput) => {
    const toastId = notify.loading("Sending message…")
    await new Promise((r) => setTimeout(r, 300))
    notify.dismiss(toastId)
    setSubmitted(true)
    form.reset()
    notify.success("Message sent", "We'll get back to you soon.")
  }

  return (
    <div>
      <ShopPageHeader
        title="Contact"
        description="Questions about orders, fit, or the collection — we are here to help."
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl">Get in touch</h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            Email us at{" "}
            <a href="mailto:hello@sundibuy.com" className="underline underline-offset-4">
              hello@sundibuy.com
            </a>{" "}
            or send a note below. We typically reply within 1–2 business days.
          </p>
          <div className="mt-8 space-y-3 text-sm text-neutral-600">
            <p>
              <span className="font-medium text-black">Customer care:</span> Mon–Fri, 9am–6pm
            </p>
            <p>
              <span className="font-medium text-black">Press:</span> press@sundibuy.com
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            className="space-y-4 rounded-2xl bg-neutral-50 p-6 sm:p-8"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormAlert errors={form.formState.errors} />
            {submitted && (
              <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
                Thanks — your message was sent.
              </p>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium tracking-wider uppercase">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11 rounded-none border-neutral-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium tracking-wider uppercase">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-11 rounded-none border-neutral-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium tracking-wider uppercase">
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      className="rounded-none border-neutral-300 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full rounded-none bg-black text-xs font-medium tracking-[0.14em] text-white uppercase transition hover:bg-neutral-800"
            >
              {form.formState.isSubmitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="pb-16 text-center">
        <TextLink href="/faq">Visit FAQ</TextLink>
      </div>
    </div>
  )
}
