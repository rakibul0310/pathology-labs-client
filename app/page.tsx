import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">PathLab Pro</h1>
            <span className="text-sm text-muted-foreground">Laboratory Management System</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Dashboard />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
