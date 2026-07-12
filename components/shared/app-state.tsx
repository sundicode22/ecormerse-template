import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type StateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

function StateShell({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  children,
}: StateProps & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl bg-neutral-50 px-6 py-16 text-center",
        className
      )}
    >
      {children}
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-black">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
      {(actionLabel && actionHref) || (actionLabel && onAction) ? (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild className="rounded-md">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button type="button" className="rounded-md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There is no content to show right now.",
  actionLabel,
  actionHref,
  onAction,
  className,
}: StateProps) {
  return (
    <StateShell
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      onAction={onAction}
      className={className}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white">
        <span className="text-2xl text-neutral-400">∅</span>
      </div>
    </StateShell>
  )
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  actionLabel = "Try again",
  actionHref,
  onAction,
  className,
}: StateProps) {
  return (
    <StateShell
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      onAction={onAction}
      className={className}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-black text-white">
        <span className="text-lg font-semibold">!</span>
      </div>
    </StateShell>
  )
}

export function NotFoundState({
  title = "Page not found",
  description = "The page you are looking for does not exist or has been moved.",
  actionLabel = "Back to home",
  actionHref = "/",
  onAction,
  className,
}: StateProps) {
  return (
    <StateShell
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      onAction={onAction}
      className={className}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-200 text-black">
        <span className="text-sm font-semibold tracking-wider">404</span>
      </div>
    </StateShell>
  )
}
