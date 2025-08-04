import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { getCompanyInfo } from "@/services/settings-service"
import { AuthProvider } from "@/components/auth/auth-provider"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const companyInfo = await getCompanyInfo();

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
        <AppHeader companyInfo={companyInfo} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
            {children}
        </main>
        </div>
    </div>
    </SidebarProvider>
  )
}
