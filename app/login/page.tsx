import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
