"use client"

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCreateReview, useReviews } from "@/hooks/api/useReviews"
import {
  reviewFormSchema,
  type ReviewFormInput,
} from "@/lib/validations/review"
import { EmptyState, ErrorState } from "@/components/shared/app-state"
import { FormAlert, mutationErrorMessage } from "@/components/shared/form-alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function Stars({
  rating,
  interactive,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (value: number) => void
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1
        const active = value <= rating
        if (!interactive) {
          return (
            <span key={value} className={active ? "text-black" : "text-neutral-300"}>
              ★
            </span>
          )
        }
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className={cn(
              "text-lg transition",
              active ? "text-black" : "text-neutral-300 hover:text-neutral-500"
            )}
            aria-label={`${value} stars`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export function ProductReviews({ productId }: { productId: number }) {
  const { data: session } = useSession()
  const { data: reviews = [], isLoading, isError, refetch } = useReviews({
    productId,
    limit: 20,
  })
  const createReview = useCreateReview()
  const [open, setOpen] = useState(false)

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const form = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewFormSchema) as Resolver<ReviewFormInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      authorName: session?.user?.name || "",
      rating: 5,
      title: "",
      body: "",
    },
  })

  useEffect(() => {
    if (session?.user?.name) {
      form.setValue("authorName", session.user.name)
    }
  }, [session?.user?.name, form])

  const serverError = createReview.error
    ? mutationErrorMessage(
        createReview.error,
        "Could not submit your review. Please try again."
      )
    : null

  async function onSubmit(values: ReviewFormInput) {
    if (!session?.user) return
    await createReview.mutateAsync({
      productId,
      authorName: values.authorName || session.user.name || "Customer",
      rating: values.rating,
      title: values.title || undefined,
      body: values.body,
    })
    form.reset({
      authorName: session.user.name || values.authorName,
      rating: 5,
      title: "",
      body: "",
    })
    setOpen(false)
  }

  return (
    <section className="pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-black uppercase">
            Reviews
          </h2>
          {reviews.length > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <Stars rating={Math.round(avg)} />
              <span>
                {avg.toFixed(1)} · {reviews.length} review
                {reviews.length === 1 ? "" : "s"}
              </span>
            </p>
          )}
        </div>

        {session?.user ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-md bg-white"
            onClick={() => setOpen(true)}
          >
            Write a review
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-md bg-white">
            <Link href="/login">Sign in to review</Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState description="Could not load reviews." onAction={() => refetch()} />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Share your experience with this piece."
          className="py-10"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-neutral-100 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <p className="text-xs text-neutral-500">{review.authorName}</p>
              </div>
              {review.title && (
                <h3 className="mt-2 text-sm font-semibold">{review.title}</h3>
              )}
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {review.body}
              </p>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>
              Tell others how this piece fits and feels.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <FormAlert errors={form.formState.errors} serverError={serverError} />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Stars
                        rating={field.value}
                        interactive
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createReview.isPending}>
                  {createReview.isPending ? "Submitting…" : "Submit review"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
