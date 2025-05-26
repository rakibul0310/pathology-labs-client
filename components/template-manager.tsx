"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Eye, Copy, Trash2, Download, Wand2, Edit } from "lucide-react"
import { TemplateImport } from "./template-import"
import { TemplatePreview } from "./template-preview"
import { TemplateExport } from "./template-export"

interface Template {
  id: string
  name: string
  description: string
  category: string
  lastModified: string
  isDefault: boolean
  source: "manual" | "imported"
  elements?: any[]
  metadata?: {
    originalFile: string
    detectedElements: number
    confidence: number
    importDate: string
  }
}

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "Standard Blood Test Report",
    description: "Default template for blood test results",
    category: "Blood Tests",
    lastModified: "2024-01-15",
    isDefault: true,
    source: "manual",
    elements: [
      {
        id: "1",
        type: "header",
        content: { title: "BLOOD TEST REPORT", subtitle: "Laboratory Analysis" },
        style: { fontSize: "24px", fontWeight: "bold", textAlign: "center", padding: "20px" },
        position: { x: 0, y: 0, width: 100, height: 15 },
      },
      {
        id: "2",
        type: "patient-info",
        content: { fields: ["Patient Name", "Age", "Gender", "Sample ID", "Collection Date"] },
        style: { fontSize: "14px", padding: "15px", border: "1px solid #e5e7eb" },
        position: { x: 0, y: 20, width: 100, height: 25 },
      },
    ],
  },
  {
    id: "2",
    name: "Comprehensive Health Panel",
    description: "Multi-test report with detailed sections",
    category: "Comprehensive",
    lastModified: "2024-01-14",
    isDefault: false,
    source: "manual",
    elements: [],
  },
  {
    id: "3",
    name: "Microbiology Report",
    description: "Template for culture and sensitivity tests",
    category: "Microbiology",
    lastModified: "2024-01-13",
    isDefault: false,
    source: "manual",
    elements: [],
  },
  {
    id: "4",
    name: "Histopathology Report",
    description: "Biopsy and tissue examination template",
    category: "Histopathology",
    lastModified: "2024-01-12",
    isDefault: false,
    source: "manual",
    elements: [],
  },
]

export function TemplateManager() {
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [templateList, setTemplateList] = useState<Template[]>(initialTemplates)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [exportTemplate, setExportTemplate] = useState<Template | null>(null)

  const handleImportComplete = (importedTemplate: any) => {
    const newTemplate: Template = {
      id: importedTemplate.id,
      name: importedTemplate.name,
      description: importedTemplate.description,
      category: "Imported",
      lastModified: new Date().toISOString().split("T")[0],
      isDefault: false,
      source: "imported",
      elements: importedTemplate.elements,
      metadata: importedTemplate.metadata,
    }

    setTemplateList((prev) => [...prev, newTemplate])
    alert(`Template "${importedTemplate.name}" imported successfully!`)
  }

  const handleEditTemplate = (template: Template) => {
    // Store template data in localStorage for the report builder
    localStorage.setItem("editingTemplate", JSON.stringify(template))

    // Open report builder in new tab/window or navigate
    window.open("/report-builder?mode=edit&templateId=" + template.id, "_blank")
  }

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template)
  }

  const handleExportTemplate = (template: Template) => {
    setExportTemplate(template)
  }

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      lastModified: new Date().toISOString().split("T")[0],
      isDefault: false,
    }

    setTemplateList((prev) => [...prev, duplicatedTemplate])
    alert(`Template "${template.name}" duplicated successfully!`)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplateList((prev) => prev.filter((t) => t.id !== templateId))
      alert("Template deleted successfully!")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Report Templates</h2>
          <p className="text-muted-foreground">Manage and customize your report templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Import Template
          </Button>
          <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>Start with a blank template or copy from existing</DialogDescription>
              </DialogHeader>
              <NewTemplateForm onClose={() => setIsNewTemplateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templateList.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.source === "imported" && (
                      <Badge variant="secondary" className="text-xs">
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI Imported
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Modified:</span>
                  <span>{template.lastModified}</span>
                </div>
                {template.isDefault && <Badge className="bg-green-100 text-green-800">Default Template</Badge>}

                {/* Show import metadata for imported templates */}
                {template.source === "imported" && template.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <div>Original: {template.metadata.originalFile}</div>
                    <div>Elements: {template.metadata.detectedElements}</div>
                    <div>Confidence: {Math.round(template.metadata.confidence * 100)}%</div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handleEditTemplate(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Template
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePreviewTemplate(template)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Template Dialog */}
      <TemplateImport
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Preview Template Dialog */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Export Template Dialog */}
      {exportTemplate && (
        <TemplateExport template={exportTemplate} isOpen={!!exportTemplate} onClose={() => setExportTemplate(null)} />
      )}
    </div>
  )
}

function NewTemplateForm({ onClose }: { onClose: () => void }) {
  const handleCreateBlankTemplate = () => {
    // Create a new blank template and open in report builder
    const newTemplate = {
      id: Date.now().toString(),
      name: "New Template",
      description: "Blank template",
      elements: [],
    }

    localStorage.setItem("editingTemplate", JSON.stringify(newTemplate))
    window.open("/report-builder?mode=create", "_blank")
    onClose()
  }

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input id="template-name" placeholder="Enter template name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Description</Label>
        <Input id="template-description" placeholder="Brief description of the template" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-category">Category</Label>
        <Input id="template-category" placeholder="e.g., Blood Tests, Microbiology" />
      </div>

      <div className="space-y-2">
        <Label>Starting Point</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-20 flex-col" onClick={handleCreateBlankTemplate}>
            <Plus className="h-6 w-6 mb-2" />
            Blank Template
          </Button>
          <Button type="button" variant="outline" className="h-20 flex-col">
            <Copy className="h-6 w-6 mb-2" />
            Copy Existing
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Create Template</Button>
      </div>
    </form>
  )
}
