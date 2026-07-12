"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Orders usually leave within 1–2 business days. Local deliveries arrive in 2–5 days; international shipments typically take 5–10 business days depending on customs.",
  },
  {
    q: "What is your return policy?",
    a: "Unworn items with tags can be returned within 14 days of delivery. Start a return from your order confirmation email or contact support and we will send a prepaid label where available.",
  },
  {
    q: "How do I find my size?",
    a: "Each product page includes a size guide. If you are between sizes, we usually recommend sizing up for structured pieces and staying true-to-size for knits and tees.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "We can adjust orders within two hours of checkout while they are still pending. After that, items may already be packed — reach out as soon as possible and we will help.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. International DHL Express is available at checkout. Duties and taxes may apply on arrival depending on your country.",
  },
]

export function LandingFaq() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
          Help
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-sm text-neutral-600">
          Quick answers on shipping, sizing, and returns.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="mx-auto mt-10 max-w-3xl rounded-2xl border-neutral-200 bg-white"
      >
        {FAQS.map((faq, index) => (
          <AccordionItem key={faq.q} value={`item-${index}`}>
            <AccordionTrigger className="px-5 text-base font-medium text-black hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="px-5 text-neutral-600">
              <p>{faq.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Still need help?{" "}
        <Link href="/contact" className="font-medium text-black underline-offset-4 hover:underline">
          Contact us
        </Link>
      </p>
    </section>
  )
}
