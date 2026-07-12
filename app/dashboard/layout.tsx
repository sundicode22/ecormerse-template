import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/auth"
import { isAdmin } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  if (!isAdmin(session.user.role)) {
    redirect("/")
  }

  return (
    <SidebarProvider defaultOpen={false} className="dashboard-shell bg-dashboard-canvas">
      <AppSidebar />
      <SidebarInset className="bg-dashboard-canvas">
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:p-6 md:pt-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
