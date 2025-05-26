"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, ImageIcon, Code, Share } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  elements?: any[]
}

export function TemplateExport({
  template,
  isOpen,
  onClose,
}: {
  template: Template
  isOpen: boolean
  onClose: () => void
}) {
  const [exportFormat, setExportFormat] = useState("pdf")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [fileName, setFileName] = useState(template.name.replace(/\s+/g, "_").toLowerCase())

  const handleExport = (format: string) => {
    // Simulate export process
    const exportData = {
      template,
      format,
      includeMetadata,
      fileName,
      exportDate: new Date().toISOString(),
    }

    switch (format) {
      case "pdf":
        exportAsPDF(exportData)
        break
      case "json":
        exportAsJSON(exportData)
        break
      case "image":
        exportAsImage(exportData)
        break
      case "html":
        exportAsHTML(exportData)
        break
    }
  }

  const exportAsPDF = (data: any) => {
    // Create a blob with PDF content (mock)
    const pdfContent = `PDF Export of ${data.template.name}`
    const blob = new Blob([pdfContent], { type: "application/pdf" })
    downloadFile(blob, `${data.fileName}.pdf`)
  }

  const exportAsJSON = (data: any) => {
    const jsonContent = JSON.stringify(data.template, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    downloadFile(blob, `${data.fileName}.json`)
  }

  const exportAsImage = (data: any) => {
    // Create a canvas and render the template (mock)
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.font = "20px Arial"
      ctx.fillText(`Template: ${data.template.name}`, 50, 50)
    }

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, `${data.fileName}.png`)
      }
    })
  }

  const exportAsHTML = (data: any) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${data.template.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .template { width: 8.5in; min-height: 11in; border: 1px solid #ccc; padding: 20px; }
    </style>
</head>
<body>
    <div class="template">
        <h1>${data.template.name}</h1>
        <p>${data.template.description}</p>
        <!-- Template elements would be rendered here -->
    </div>
</body>
</html>`
    const blob = new Blob([htmlContent], { type: "text/html" })
    downloadFile(blob, `${data.fileName}.html`)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Show success message
    alert(`Template exported as ${filename}`)
    onClose()
  }

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/templates/shared/${template.id}`
    navigator.clipboard.writeText(shareLink)
    alert("Share link copied to clipboard!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Template: {template.name}</DialogTitle>
          <DialogDescription>Choose your export format and options</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="filename">File Name</Label>
                <Input
                  id="filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter filename"
                />
              </div>

              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={exportFormat === "pdf" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => setExportFormat("pdf")}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    PDF Document
                  </Button>
                  <Button
                    variant={exportFormat === "image" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => setExportFormat("image")}
                  >
                    <ImageIcon className="h-6 w-6 mb-2" />
                    PNG Image
                  </Button>
                  <Button
                    variant={exportFormat === "json" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => setExportFormat("json")}
                  >
                    <Code className="h-6 w-6 mb-2" />
                    JSON Data
                  </Button>
                  <Button
                    variant={exportFormat === "html" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => setExportFormat("html")}
                  >
                    <Code className="h-6 w-6 mb-2" />
                    HTML Page
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="metadata">Include template metadata</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleExport(exportFormat)} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export as {exportFormat.toUpperCase()}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Share Template</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate a shareable link for this template that others can view and import.
                </p>
                <div className="flex space-x-2">
                  <Input
                    value={`${window.location.origin}/templates/shared/${template.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyShareLink}>
                    <Share className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">QR Code</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Scan this QR code to quickly access the template on mobile devices.
                </p>
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
