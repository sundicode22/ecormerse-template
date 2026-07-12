"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutBottomIcon,
  ShoppingBag02Icon,
  DeliveryBox01Icon,
  Tag01Icon,
  Folder01Icon,
  Layers01Icon,
  PackageIcon,
  UserMultipleIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons"

const data = {
  user: {
    name: "Admin",
    email: "admin@shop.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
    {
      title: "Collections",
      url: "/dashboard/collections",
      icon: <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} />,
    },
    {
      title: "Labels",
      url: "/dashboard/labels",
      icon: <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} />,
    },
    {
      title: "Addresses",
      url: "/dashboard/addresses",
      icon: <HugeiconsIcon icon={Location01Icon} strokeWidth={2} />,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} />,
    },
    {
      title: "Deliveries",
      url: "/dashboard/deliveries",
      icon: <HugeiconsIcon icon={DeliveryBox01Icon} strokeWidth={2} />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-none" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-white/15 text-sidebar-foreground">
            <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} className="size-4" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Shop Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
