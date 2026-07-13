"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { isAdmin } from "@/lib/auth/roles"
import { loginSchema, type LoginInput } from "@/lib/validations/login"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"

const fieldClass =
  "h-11 rounded-md border-neutral-200 bg-neutral-50 px-4 focus-visible:border-black focus-visible:ring-black/10"
const buttonClass = "h-11 w-full rounded-md text-sm font-medium capitalize"

export function LoginForm({
  className,
  callbackUrl,
  ...props
}: React.ComponentProps<"div"> & { callbackUrl?: string }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  function resolveDestination(role?: string | null) {
    if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
      return callbackUrl
    }
    return isAdmin(role) ? "/dashboard" : "/profile"
  }

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const toastId = notify.loading("Signing in…")
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        notify.dismiss(toastId)
        setServerError("Invalid email or password")
        notify.error("Invalid email or password")
        return
      }
      const session = await getSession()
      notify.dismiss(toastId)
      notify.success("Signed in")
      router.push(resolveDestination(session?.user?.role))
      router.refresh()
    } catch {
      notify.dismiss(toastId)
      setServerError("Something went wrong. Please try again.")
      notify.error("Something went wrong. Please try again.")
    }
  }

  async function handleGoogle() {
    setServerError(null)
    setIsGoogleLoading(true)
    notify.info("Redirecting to Google…")
    try {
      await signIn("google", {
        callbackUrl: resolveDestination(),
      })
    } catch {
      setServerError("Google sign-in failed. Please try again.")
      notify.error("Google sign-in failed. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-tight text-black"
        >
          Sundi Buy
        </Link>
      </div>

      <div
        className="overflow-hidden bg-white shadow-md"
        style={{ borderRadius: 16 }}
      >
        <div className="px-8 py-8 sm:px-10 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Sign in to continue shopping
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {serverError && (
                <p
                  className="bg-red-50 px-4 py-3 text-center text-sm text-red-600"
                  style={{ borderRadius: 12 }}
                >
                  {serverError}
                </p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize text-neutral-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={fieldClass}
                        style={{ borderRadius: 12 }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize text-neutral-700">
                      Password
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className={cn(fieldClass, "pr-11")}
                          style={{ borderRadius: 12 }}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-neutral-400 transition-colors hover:text-black"
                        style={{ borderRadius: 8 }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <HugeiconsIcon
                          icon={showPassword ? ViewOffIcon : ViewIcon}
                          strokeWidth={1.8}
                          className="size-5"
                        />
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={cn(buttonClass, "bg-black text-white hover:bg-neutral-800")}
                style={{ borderRadius: 12 }}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-100" />
            <span className="text-xs capitalize text-neutral-400">Or</span>
            <div className="h-px flex-1 bg-neutral-100" />
          </div>

          <Button
            variant="outline"
            type="button"
            className={cn(buttonClass, "border-neutral-200 bg-white hover:bg-neutral-50")}
            style={{ borderRadius: 12 }}
            onClick={handleGoogle}
            disabled={isGoogleLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
