"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getSession, signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { isAdmin } from "@/lib/auth/roles"
import {
  type AuthMode,
  type RecoverInput,
  type ResetPasswordInput,
  type SetPasswordInput,
  type SignInInput,
  recoverSchema,
  resetPasswordSchema,
  setPasswordSchema,
  signInSchema,
} from "@/lib/validations/auth"
import {
  apiErrorMessage,
  useAccountStatus,
  useAuthMe,
  useForgotPassword,
  useRegister,
  useResetPassword,
  useSetPassword,
} from "@/hooks/api/useAuth"
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
const buttonClass = "h-11 w-full rounded-md text-sm font-medium"

const MODE_COPY: Record<
  AuthMode,
  { title: string; subtitle: string }
> = {
  signin: {
    title: "Continue",
    subtitle: "Enter your email to sign in — new emails get an account automatically",
  },
  register: {
    title: "Continue",
    subtitle: "Enter your email to sign in — new emails get an account automatically",
  },
  recover: {
    title: "Reset your password",
    subtitle: "We will prepare a secure reset link for your account",
  },
  reset: {
    title: "Choose a new password",
    subtitle: "Enter a new password for your account",
  },
  link: {
    title: "Link email login",
    subtitle: "Add or update a password so you can sign in without Google",
  },
}

type AuthFormProps = React.ComponentProps<"div"> & {
  callbackUrl?: string
  initialMode?: AuthMode
  resetEmail?: string
  resetToken?: string
}

export function LoginForm({
  className,
  callbackUrl,
  initialMode = "signin",
  resetEmail = "",
  resetToken = "",
  ...props
}: AuthFormProps) {
  const router = useRouter()
  const { status } = useSession()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const registerMutation = useRegister()
  const accountStatus = useAccountStatus()
  const forgotPassword = useForgotPassword()
  const resetPassword = useResetPassword()
  const setPassword = useSetPassword()
  const { data: me } = useAuthMe(status === "authenticated" && mode === "link")

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    if (mode === "link" && status === "unauthenticated") {
      setMode("signin")
      setInfoMessage("Sign in first, then you can set a password for email login.")
    }
  }, [mode, status])

  const copy = MODE_COPY[mode]
  const hasExistingPassword = me?.hasPassword ?? false

  function resolveDestination(role?: string | null) {
    if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
      return callbackUrl
    }
    return isAdmin(role) ? "/dashboard" : "/profile"
  }

  function switchMode(next: AuthMode) {
    setServerError(null)
    setResetLink(null)
    setShowPassword(false)
    setMode(next)
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
              {copy.title}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{copy.subtitle}</p>
          </div>

          {serverError ? (
            <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {serverError}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="mb-5 rounded-xl bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-700">
              {infoMessage}
            </p>
          ) : null}
          {resetLink ? (
            <div className="mb-5 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <p className="font-medium text-black">Reset link ready</p>
              <a
                href={resetLink}
                className="mt-2 block break-all underline underline-offset-2"
              >
                {resetLink}
              </a>
            </div>
          ) : null}

          {mode === "signin" || mode === "register" ? (
            <ContinueFields
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onForgot={() => switchMode("recover")}
              onError={setServerError}
              onInfo={setInfoMessage}
              resolveDestination={resolveDestination}
              accountStatus={accountStatus}
              registerMutation={registerMutation}
            />
          ) : null}

          {mode === "recover" ? (
            <RecoverFields
              onError={setServerError}
              onBack={() => switchMode("signin")}
              forgotPassword={forgotPassword}
              onResetLink={(url) => {
                setResetLink(url)
                setInfoMessage(
                  "If this email has a password, use the reset link below."
                )
              }}
            />
          ) : null}

          {mode === "reset" ? (
            <ResetFields
              email={resetEmail}
              token={resetToken}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onError={setServerError}
              resetPassword={resetPassword}
              onSuccess={() => {
                switchMode("signin")
                setInfoMessage("Password updated. Sign in with your new password.")
              }}
            />
          ) : null}

          {mode === "link" ? (
            <LinkPasswordFields
              hasExistingPassword={hasExistingPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              setPassword={setPassword}
              onError={setServerError}
              onSuccess={(message) => {
                setInfoMessage(message)
              }}
            />
          ) : null}

          {mode === "signin" || mode === "register" ? (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-100" />
                <span className="text-xs text-neutral-400">Or</span>
                <div className="h-px flex-1 bg-neutral-100" />
              </div>

              <Button
                variant="outline"
                type="button"
                className={cn(
                  buttonClass,
                  "border-neutral-200 bg-white hover:bg-neutral-50"
                )}
                onClick={handleGoogle}
                disabled={isGoogleLoading}
              >
                <GoogleIcon />
                {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
              </Button>

              <p className="mt-4 text-center text-xs text-neutral-500">
                Google sign-in links to an existing email account automatically.
                After Google, you can set a password to enable email login.
              </p>
            </>
          ) : null}

          {mode === "link" ? (
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="mt-5 w-full text-center text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
            >
              Back to profile
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  )
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-neutral-400 transition-colors hover:text-black"
      aria-label={show ? "Hide password" : "Show password"}
    >
      <HugeiconsIcon
        icon={show ? ViewOffIcon : ViewIcon}
        strokeWidth={1.8}
        className="size-5"
      />
    </button>
  )
}

function deriveName(email: string) {
  const local = email.split("@")[0] ?? ""
  const cleaned = local.replace(/[._-]+/g, " ").trim()
  if (cleaned.length >= 2) {
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return "Customer"
}

function ContinueFields({
  showPassword,
  setShowPassword,
  onForgot,
  onError,
  onInfo,
  resolveDestination,
  accountStatus,
  registerMutation,
}: {
  showPassword: boolean
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void
  onForgot: () => void
  onError: (v: string | null) => void
  onInfo: (v: string | null) => void
  resolveDestination: (role?: string | null) => string
  accountStatus: ReturnType<typeof useAccountStatus>
  registerMutation: ReturnType<typeof useRegister>
}) {
  const router = useRouter()
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  async function completeSignIn(
    email: string,
    password: string,
    toastId: string | number
  ) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      notify.dismiss(toastId)
      onError("Invalid email or password")
      notify.error("Invalid email or password")
      return
    }
    const session = await getSession()
    notify.dismiss(toastId)
    notify.success("Signed in")
    router.push(resolveDestination(session?.user?.role))
    router.refresh()
  }

  async function onSubmit(data: SignInInput) {
    onError(null)
    onInfo(null)
    const email = data.email.trim().toLowerCase()
    const password = data.password
    const toastId = notify.loading("Continuing…")

    try {
      const status = await accountStatus.mutateAsync(email)

      if (!status.exists) {
        if (password.length < 8) {
          notify.dismiss(toastId)
          const message =
            "New here — choose a password with at least 8 characters to create your account."
          onError(message)
          notify.error(message)
          return
        }
        notify.dismiss(toastId)
        const createToast = notify.loading("Creating your account…")
        try {
          await registerMutation.mutateAsync({
            name: deriveName(email),
            email,
            password,
          })
        } catch (error) {
          notify.dismiss(createToast)
          const message = apiErrorMessage(error, "Could not create account")
          onError(message)
          notify.error(message)
          return
        }
        await completeSignIn(email, password, createToast)
        return
      }

      if (!status.hasPassword && status.hasGoogle) {
        notify.dismiss(toastId)
        const message =
          "This account uses Google. Continue with Google, then set a password to enable email login."
        onError(message)
        notify.error(message)
        return
      }

      await completeSignIn(email, password, toastId)
    } catch {
      notify.dismiss(toastId)
      onError("Something went wrong. Please try again.")
      notify.error("Something went wrong. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  className={fieldClass}
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
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="text-neutral-700">Password</FormLabel>
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(fieldClass, "pr-11")}
                    {...field}
                  />
                </FormControl>
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn(buttonClass, "bg-black text-white hover:bg-neutral-800")}
          disabled={
            form.formState.isSubmitting ||
            accountStatus.isPending ||
            registerMutation.isPending
          }
        >
          {form.formState.isSubmitting ||
          accountStatus.isPending ||
          registerMutation.isPending
            ? "Continuing…"
            : "Continue"}
        </Button>
      </form>
    </Form>
  )
}

function RecoverFields({
  onError,
  onBack,
  forgotPassword,
  onResetLink,
}: {
  onError: (v: string | null) => void
  onBack: () => void
  forgotPassword: ReturnType<typeof useForgotPassword>
  onResetLink: (url: string | null) => void
}) {
  const form = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: RecoverInput) {
    onError(null)
    onResetLink(null)
    const toastId = notify.loading("Preparing reset link…")
    try {
      const result = await forgotPassword.mutateAsync(
        data.email.trim().toLowerCase()
      )
      notify.dismiss(toastId)
      notify.success("Check your reset options")
      onResetLink(result.resetUrl)
    } catch (error) {
      notify.dismiss(toastId)
      const message = apiErrorMessage(error, "Could not start password reset")
      onError(message)
      notify.error(message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn(buttonClass, "bg-black text-white hover:bg-neutral-800")}
          disabled={form.formState.isSubmitting || forgotPassword.isPending}
        >
          {forgotPassword.isPending ? "Sending…" : "Continue"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
        >
          Back to sign in
        </button>
      </form>
    </Form>
  )
}

function ResetFields({
  email,
  token,
  showPassword,
  setShowPassword,
  onError,
  resetPassword,
  onSuccess,
}: {
  email: string
  token: string
  showPassword: boolean
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void
  onError: (v: string | null) => void
  resetPassword: ReturnType<typeof useResetPassword>
  onSuccess: () => void
}) {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    form.setValue("email", email)
    form.setValue("token", token)
  }, [email, token, form])

  const missingLink = useMemo(() => !email || !token, [email, token])

  async function onSubmit(data: ResetPasswordInput) {
    onError(null)
    const toastId = notify.loading("Updating password…")
    try {
      await resetPassword.mutateAsync({
        email: data.email.trim().toLowerCase(),
        token: data.token,
        password: data.password,
      })
      notify.dismiss(toastId)
      notify.success("Password updated")
      onSuccess()
    } catch (error) {
      notify.dismiss(toastId)
      const message = apiErrorMessage(error, "Could not reset password")
      onError(message)
      notify.error(message)
    }
  }

  if (missingLink) {
    return (
      <p className="text-center text-sm text-neutral-600">
        This reset link is incomplete. Request a new one from “Forgot password?”.
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">Email</FormLabel>
              <FormControl>
                <Input type="email" className={fieldClass} readOnly {...field} />
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
              <FormLabel className="text-neutral-700">New password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={cn(fieldClass, "pr-11")}
                    {...field}
                  />
                </FormControl>
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">Confirm password</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn(buttonClass, "bg-black text-white hover:bg-neutral-800")}
          disabled={form.formState.isSubmitting || resetPassword.isPending}
        >
          {resetPassword.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  )
}

function LinkPasswordFields({
  hasExistingPassword,
  showPassword,
  setShowPassword,
  setPassword,
  onError,
  onSuccess,
}: {
  hasExistingPassword: boolean
  showPassword: boolean
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void
  setPassword: ReturnType<typeof useSetPassword>
  onError: (v: string | null) => void
  onSuccess: (message: string) => void
}) {
  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SetPasswordInput) {
    onError(null)
    try {
      const result = await setPassword.mutateAsync({
        currentPassword: hasExistingPassword
          ? data.currentPassword
          : undefined,
        password: data.password,
      })
      form.reset()
      onSuccess(result.message)
    } catch (error) {
      onError(apiErrorMessage(error, "Could not save password"))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {hasExistingPassword ? (
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">Current password</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            You signed in with Google. Set a password to also use email login on
            this account.
          </p>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">
                {hasExistingPassword ? "New password" : "Password"}
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={cn(fieldClass, "pr-11")}
                    {...field}
                  />
                </FormControl>
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">Confirm password</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn(buttonClass, "bg-black text-white hover:bg-neutral-800")}
          disabled={form.formState.isSubmitting || setPassword.isPending}
        >
          {setPassword.isPending
            ? "Saving…"
            : hasExistingPassword
              ? "Update password"
              : "Set password & link login"}
        </Button>
      </form>
    </Form>
  )
}
