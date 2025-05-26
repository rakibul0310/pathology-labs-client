"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ReportBuilder } from "@/components/report-builder"

export default function ReportBuilderPage() {
  const [initialTemplate, setInitialTemplate] = useState(null)

  useEffect(() => {
    // Check if we're editing an existing template
    const urlParams = new URLSearchParams(window.location.search)
    const mode = urlParams.get("mode")
    const templateId = urlParams.get("templateId")

    if (mode === "edit" || mode === "create") {
      const templateData = localStorage.getItem("editingTemplate")
      if (templateData) {
        try {
          const template = JSON.parse(templateData)
          setInitialTemplate(template)
          // Clear the localStorage after loading
          localStorage.removeItem("editingTemplate")
        } catch (error) {
          console.error("Error parsing template data:", error)
        }
      }
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Report Builder</h1>
            <span className="text-sm text-muted-foreground">Design Custom Report Layouts</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <ReportBuilder initialTemplate={initialTemplate} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
