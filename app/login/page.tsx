import { LoginForm } from "@/components/login-form"
import type { AuthMode } from "@/lib/validations/auth"

const AUTH_MODES = new Set<AuthMode>([
  "signin",
  "register",
  "recover",
  "reset",
  "link",
])

function parseMode(value?: string): AuthMode {
  if (value && AUTH_MODES.has(value as AuthMode)) {
    return value as AuthMode
  }
  return "signin"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string
    mode?: string
    email?: string
    token?: string
  }>
}) {
  const params = await searchParams
  const mode = parseMode(params.mode)

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm
          callbackUrl={params.callbackUrl}
          initialMode={mode}
          resetEmail={params.email || ""}
          resetToken={params.token || ""}
        />
      </div>
    </div>
  )
}
