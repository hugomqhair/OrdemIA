"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked, LayoutDashboard, Users, Package, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budgets", label: "Orçamentos", icon: FileText },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Produtos", icon: Package },
];

const settingsItem = { href: "/settings", label: "Configurações", icon: Settings };


export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">BudgetBuddy</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-primary/10 text-primary"
                )}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname === settingsItem.href}
                className="w-full justify-start"
                tooltip={settingsItem.label}
              >
                <Link href={settingsItem.href}>
                  <settingsItem.icon className="h-5 w-5" />
                  <span>{settingsItem.label}</span>
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
