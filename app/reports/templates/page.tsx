import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TemplateManager } from "@/components/template-manager"

export default function ReportTemplatesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Report Templates</h1>
            <span className="text-sm text-muted-foreground">Manage report templates and layouts</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <TemplateManager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
