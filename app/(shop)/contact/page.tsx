"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TextLink } from "@/components/shop/page-header"
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

const fieldClass =
  "rounded-md border-neutral-200 bg-neutral-50 px-4 focus-visible:border-black focus-visible:ring-black/10"

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
    <div className="bg-neutral-50/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
            Support
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-black sm:text-4xl">
            Contact
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Questions about orders, fit, or the collection — we are here to help.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="space-y-5 lg:col-span-5">
            <section className="rounded-2xl bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight text-black">
                Get in touch
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Email us at{" "}
                <a
                  href="mailto:hello@sundibuy.com"
                  className="underline underline-offset-4 hover:text-black"
                >
                  hello@sundibuy.com
                </a>{" "}
                or send a note with the form. We typically reply within 1–2
                business days.
              </p>
              <div className="mt-6 space-y-3 text-sm text-neutral-600">
                <p>
                  <span className="font-medium text-black">Customer care:</span>{" "}
                  Mon–Fri, 9am–6pm
                </p>
                <p>
                  <span className="font-medium text-black">Press:</span>{" "}
                  press@sundibuy.com
                </p>
              </div>
            </section>
          </aside>

          <div className="lg:col-span-7">
            <Form {...form}>
              <form
                className="space-y-5 rounded-2xl bg-white p-5 sm:p-6"
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-black">
                    Send a message
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Tell us how we can help and we will get back to you.
                  </p>
                </div>

                <FormAlert errors={form.formState.errors} />
                {submitted ? (
                  <p className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    Thanks — your message was sent.
                  </p>
                ) : null}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          className={`h-11 ${fieldClass}`}
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
                      <FormLabel className="text-neutral-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          className={`h-11 ${fieldClass}`}
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
                      <FormLabel className="text-neutral-700">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="How can we help?"
                          className={`min-h-[140px] py-3 ${fieldClass}`}
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
                  className="h-11 w-full rounded-md bg-black text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {form.formState.isSubmitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-10 flex justify-center pb-4">
          <TextLink href="/faq">Visit FAQ</TextLink>
        </div>
      </div>
    </div>
  )
}
