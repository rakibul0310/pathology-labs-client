"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Edit } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: string
  elements?: any[]
  metadata?: any
}

export function TemplatePreview({
  template,
  isOpen,
  onClose,
}: {
  template: Template
  isOpen: boolean
  onClose: () => void
}) {
  const handleEditTemplate = () => {
    localStorage.setItem("editingTemplate", JSON.stringify(template))
    window.open("/report-builder?mode=edit&templateId=" + template.id, "_blank")
  }

  const renderElement = (element: any) => {
    switch (element.type) {
      case "header":
        return (
          <div
            style={{
              ...element.style,
              textAlign: element.style.textAlign,
              color: element.style.color,
              backgroundColor: element.style.backgroundColor,
            }}
          >
            <div style={{ fontSize: element.style.fontSize, fontWeight: element.style.fontWeight }}>
              {element.content.title}
            </div>
            {element.content.subtitle && (
              <div style={{ fontSize: "14px", marginTop: "5px" }}>{element.content.subtitle}</div>
            )}
          </div>
        )

      case "logo":
        return (
          <div style={element.style}>
            <img
              src={element.content.src || "/placeholder.svg?height=60&width=150"}
              alt={element.content.alt}
              className="max-w-full h-auto"
            />
          </div>
        )

      case "patient-info":
        return (
          <div style={element.style}>
            <h3 className="font-semibold mb-3 text-sm">Patient Information</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {element.content.fields?.map((field: string, index: number) => (
                <div key={index} className="flex">
                  <span className="font-medium w-20 text-xs">{field}:</span>
                  <span className="border-b border-dotted border-gray-400 flex-1 ml-2">[{field}]</span>
                </div>
              ))}
            </div>
          </div>
        )

      case "test-results":
        return (
          <div style={element.style}>
            <h3 className="font-semibold mb-3 text-sm">{element.content.title}</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {element.content.columns?.map((col: string, index: number) => (
                    <th key={index} className="border border-gray-300 p-1 text-left font-medium text-xs">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-1 text-xs">Sample Test</td>
                  <td className="border border-gray-300 p-1 text-xs">Normal</td>
                  <td className="border border-gray-300 p-1 text-xs">0-100</td>
                  <td className="border border-gray-300 p-1 text-xs">mg/dL</td>
                  <td className="border border-gray-300 p-1 text-xs">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        )

      case "text":
        return (
          <div style={element.style} className="text-sm">
            {element.content.text}
          </div>
        )

      case "signature":
        return (
          <div style={element.style} className="space-y-2">
            <div className="font-medium text-sm">{element.content.title}</div>
            <div className="border-b border-black w-32 h-8"></div>
            <div className="text-xs">
              <div className="font-medium">{element.content.name}</div>
              <div>{element.content.designation}</div>
              {element.content.license && <div>{element.content.license}</div>}
            </div>
          </div>
        )

      default:
        return <div>Unknown element type</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Template Preview: {template.name}</span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleEditTemplate}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </Button>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>Preview of the template layout and content structure</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <Badge variant="secondary">{template.category}</Badge>
          </div>

          {/* Template Preview */}
          <div className="border-2 border-dashed border-gray-200 bg-white">
            <div className="relative w-full bg-white shadow-lg" style={{ aspectRatio: "8.5/11", minHeight: "600px" }}>
              <div className="absolute inset-4 bg-white">
                {template.elements && template.elements.length > 0 ? (
                  template.elements.map((element, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${element.position.x}%`,
                        top: `${element.position.y}%`,
                        width: `${element.position.width}%`,
                        height: `${element.position.height}%`,
                      }}
                    >
                      {renderElement(element)}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg font-medium">No elements in this template</p>
                      <p className="text-sm">Click "Edit Template" to add content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Template Metadata */}
          {template.metadata && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Import Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Original File:</span> {template.metadata.originalFile}
                </div>
                <div>
                  <span className="font-medium">Elements Detected:</span> {template.metadata.detectedElements}
                </div>
                <div>
                  <span className="font-medium">AI Confidence:</span> {Math.round(template.metadata.confidence * 100)}%
                </div>
                <div>
                  <span className="font-medium">Import Date:</span>{" "}
                  {new Date(template.metadata.importDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
