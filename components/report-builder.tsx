"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Type,
  ImageIcon,
  Table,
  FileText,
  Eye,
  Save,
  Download,
  Trash2,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
} from "lucide-react"

interface ReportElement {
  id: string
  type: "header" | "logo" | "patient-info" | "test-results" | "text" | "signature" | "footer"
  content: any
  style: {
    fontSize?: string
    fontWeight?: string
    textAlign?: string
    color?: string
    backgroundColor?: string
    padding?: string
    margin?: string
    border?: string
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

const defaultElements: ReportElement[] = [
  {
    id: "1",
    type: "header",
    content: {
      title: "PATHOLOGY LABORATORY REPORT",
      subtitle: "Comprehensive Medical Testing Services",
    },
    style: {
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center",
      color: "#1f2937",
      padding: "20px",
    },
    position: { x: 0, y: 0, width: 100, height: 15 },
  },
  {
    id: "2",
    type: "logo",
    content: {
      src: "/placeholder.svg?height=80&width=200",
      alt: "Lab Logo",
    },
    style: {
      textAlign: "right",
      padding: "10px",
    },
    position: { x: 70, y: 2, width: 25, height: 10 },
  },
  {
    id: "3",
    type: "patient-info",
    content: {
      fields: ["Patient Name", "Age", "Gender", "Sample ID", "Collection Date", "Report Date"],
    },
    style: {
      fontSize: "14px",
      padding: "15px",
      border: "1px solid #e5e7eb",
    },
    position: { x: 0, y: 20, width: 100, height: 25 },
  },
  {
    id: "4",
    type: "test-results",
    content: {
      title: "TEST RESULTS",
      columns: ["Test Parameter", "Result", "Reference Range", "Units", "Flag"],
    },
    style: {
      fontSize: "14px",
      padding: "15px",
    },
    position: { x: 0, y: 50, width: 100, height: 35 },
  },
  {
    id: "5",
    type: "signature",
    content: {
      title: "Verified By:",
      name: "Dr. [Name]",
      designation: "Pathologist",
      license: "License No: [Number]",
    },
    style: {
      fontSize: "12px",
      textAlign: "right",
      padding: "20px",
    },
    position: { x: 60, y: 90, width: 40, height: 10 },
  },
]

export function ReportBuilder({ initialTemplate }: { initialTemplate?: any }) {
  const [elements, setElements] = useState<ReportElement[]>(initialTemplate?.elements || defaultElements)
  const [templateName, setTemplateName] = useState(initialTemplate?.name || "Default Lab Report")
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>("")
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)

  const addElement = (type: ReportElement["type"]) => {
    const newElement: ReportElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      position: { x: 10, y: 10, width: 50, height: 10 },
    }
    setElements([...elements, newElement])
  }

  const updateElement = (id: string, updates: Partial<ReportElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    setSelectedElement(null)
  }

  const getDefaultContent = (type: ReportElement["type"]) => {
    switch (type) {
      case "header":
        return { title: "Report Title", subtitle: "Subtitle" }
      case "logo":
        return { src: "/placeholder.svg?height=60&width=150", alt: "Logo" }
      case "patient-info":
        return { fields: ["Patient Name", "Age", "Gender"] }
      case "test-results":
        return { title: "Test Results", columns: ["Parameter", "Result", "Range"] }
      case "text":
        return { text: "Enter your text here" }
      case "signature":
        return { title: "Signature", name: "Dr. Name", designation: "Title" }
      case "footer":
        return { text: "Footer information" }
      default:
        return {}
    }
  }

  const getDefaultStyle = (type: ReportElement["type"]) => {
    switch (type) {
      case "header":
        return { fontSize: "20px", fontWeight: "bold", textAlign: "center", padding: "15px" }
      case "text":
        return { fontSize: "14px", padding: "10px" }
      default:
        return { fontSize: "14px", padding: "10px" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Report Builder</h2>
          <p className="text-muted-foreground">Design custom report layouts with your branding</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Elements & Properties */}
        {!previewMode && (
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("header")}>
                  <Type className="mr-2 h-4 w-4" />
                  Header
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("logo")}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Logo
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("patient-info")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Patient Info
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("test-results")}>
                  <Table className="mr-2 h-4 w-4" />
                  Test Results
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("text")}>
                  <Type className="mr-2 h-4 w-4" />
                  Text Block
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement("signature")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Signature
                </Button>
              </CardContent>
            </Card>

            {selectedElement && (
              <ElementProperties
                element={elements.find((el) => el.id === selectedElement)!}
                onUpdate={(updates) => updateElement(selectedElement, updates)}
                onDelete={() => deleteElement(selectedElement)}
              />
            )}
          </div>
        )}

        {/* Canvas */}
        <div className={previewMode ? "col-span-12" : "col-span-9"}>
          <Card className="min-h-[800px]">
            <CardContent className="p-0">
              <ReportCanvas
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateElement={updateElement}
                previewMode={previewMode}
                editingElement={editingElement}
                setEditingElement={setEditingElement}
                editingField={editingField}
                setEditingField={setEditingField}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ElementProperties({
  element,
  onUpdate,
  onDelete,
}: {
  element: ReportElement
  onUpdate: (updates: Partial<ReportElement>) => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Properties</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-3">
            <ContentEditor element={element} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="style" className="space-y-3">
            <StyleEditor element={element} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ContentEditor({
  element,
  onUpdate,
}: {
  element: ReportElement
  onUpdate: (updates: Partial<ReportElement>) => void
}) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...element.content, [key]: value },
    })
  }

  switch (element.type) {
    case "header":
      return (
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={element.content.title || ""} onChange={(e) => updateContent("title", e.target.value)} />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={element.content.subtitle || ""} onChange={(e) => updateContent("subtitle", e.target.value)} />
          </div>
        </div>
      )

    case "text":
      return (
        <div>
          <Label>Text Content</Label>
          <Textarea
            value={element.content.text || ""}
            onChange={(e) => updateContent("text", e.target.value)}
            rows={4}
          />
        </div>
      )

    case "logo":
      return (
        <div className="space-y-3">
          <div>
            <Label>Logo URL</Label>
            <Input value={element.content.src || ""} onChange={(e) => updateContent("src", e.target.value)} />
          </div>
          <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Logo
          </Button>
        </div>
      )

    case "signature":
      return (
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={element.content.name || ""} onChange={(e) => updateContent("name", e.target.value)} />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              value={element.content.designation || ""}
              onChange={(e) => updateContent("designation", e.target.value)}
            />
          </div>
          <div>
            <Label>License Number</Label>
            <Input value={element.content.license || ""} onChange={(e) => updateContent("license", e.target.value)} />
          </div>
        </div>
      )

    default:
      return <div>No content options for this element type</div>
  }
}

function StyleEditor({
  element,
  onUpdate,
}: {
  element: ReportElement
  onUpdate: (updates: Partial<ReportElement>) => void
}) {
  const updateStyle = (key: string, value: string) => {
    onUpdate({
      style: { ...element.style, [key]: value },
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Font Size</Label>
        <Select value={element.style.fontSize} onValueChange={(value) => updateStyle("fontSize", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
            <SelectItem value="28px">28px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Text Alignment</Label>
        <div className="flex space-x-1">
          <Button
            variant={element.style.textAlign === "left" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStyle("textAlign", "left")}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={element.style.textAlign === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStyle("textAlign", "center")}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={element.style.textAlign === "right" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStyle("textAlign", "right")}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Font Weight</Label>
        <div className="flex space-x-1">
          <Button
            variant={element.style.fontWeight === "normal" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStyle("fontWeight", "normal")}
          >
            Normal
          </Button>
          <Button
            variant={element.style.fontWeight === "bold" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStyle("fontWeight", "bold")}
          >
            <Bold className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex space-x-2">
          <Input
            type="color"
            value={element.style.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={element.style.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <Label>Background Color</Label>
        <div className="flex space-x-2">
          <Input
            type="color"
            value={element.style.backgroundColor || "#ffffff"}
            onChange={(e) => updateStyle("backgroundColor", e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={element.style.backgroundColor || "#ffffff"}
            onChange={(e) => updateStyle("backgroundColor", e.target.value)}
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div>
        <Label>Padding</Label>
        <Input
          value={element.style.padding || "10px"}
          onChange={(e) => updateStyle("padding", e.target.value)}
          placeholder="10px"
        />
      </div>

      <div>
        <Label>Border</Label>
        <Input
          value={element.style.border || ""}
          onChange={(e) => updateStyle("border", e.target.value)}
          placeholder="1px solid #ccc"
        />
      </div>
    </div>
  )
}

function ReportCanvas({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  previewMode,
  editingElement,
  setEditingElement,
  editingField,
  setEditingField,
}: {
  elements: ReportElement[]
  selectedElement: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<ReportElement>) => void
  previewMode: boolean
  editingElement: string | null
  setEditingElement: (id: string | null) => void
  editingField: string | null
  setEditingField: (field: string | null) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>("")

  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: "drag" | "resize", handle?: string) => {
    if (previewMode) return

    e.preventDefault()
    e.stopPropagation()

    const canvas = canvasRef.current
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    if (action === "drag") {
      setDraggedElement(elementId)
      const elementX = (element.position.x / 100) * canvasRect.width
      const elementY = (element.position.y / 100) * canvasRect.height
      setDragOffset({
        x: e.clientX - canvasRect.left - elementX,
        y: e.clientY - canvasRect.top - elementY,
      })
    } else if (action === "resize" && handle) {
      setIsResizing(elementId)
      setResizeHandle(handle)
    }

    onSelectElement(elementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (previewMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()

    if (draggedElement) {
      const element = elements.find((el) => el.id === draggedElement)
      if (!element) return

      const newX = ((e.clientX - canvasRect.left - dragOffset.x) / canvasRect.width) * 100
      const newY = ((e.clientY - canvasRect.top - dragOffset.y) / canvasRect.height) * 100

      // Constrain to canvas bounds
      const constrainedX = Math.max(0, Math.min(100 - element.position.width, newX))
      const constrainedY = Math.max(0, Math.min(100 - element.position.height, newY))

      onUpdateElement(draggedElement, {
        position: {
          ...element.position,
          x: constrainedX,
          y: constrainedY,
        },
      })
    }

    if (isResizing) {
      const element = elements.find((el) => el.id === isResizing)
      if (!element) return

      const mouseX = ((e.clientX - canvasRect.left) / canvasRect.width) * 100
      const mouseY = ((e.clientY - canvasRect.top) / canvasRect.height) * 100

      let newWidth = element.position.width
      let newHeight = element.position.height
      let newX = element.position.x
      let newY = element.position.y

      switch (resizeHandle) {
        case "se": // Southeast
          newWidth = Math.max(10, mouseX - element.position.x)
          newHeight = Math.max(5, mouseY - element.position.y)
          break
        case "sw": // Southwest
          newWidth = Math.max(10, element.position.x + element.position.width - mouseX)
          newHeight = Math.max(5, mouseY - element.position.y)
          newX = Math.min(element.position.x, mouseX)
          break
        case "ne": // Northeast
          newWidth = Math.max(10, mouseX - element.position.x)
          newHeight = Math.max(5, element.position.y + element.position.height - mouseY)
          newY = Math.min(element.position.y, mouseY)
          break
        case "nw": // Northwest
          newWidth = Math.max(10, element.position.x + element.position.width - mouseX)
          newHeight = Math.max(5, element.position.y + element.position.height - mouseY)
          newX = Math.min(element.position.x, mouseX)
          newY = Math.min(element.position.y, mouseY)
          break
        case "e": // East
          newWidth = Math.max(10, mouseX - element.position.x)
          break
        case "w": // West
          newWidth = Math.max(10, element.position.x + element.position.width - mouseX)
          newX = Math.min(element.position.x, mouseX)
          break
        case "s": // South
          newHeight = Math.max(5, mouseY - element.position.y)
          break
        case "n": // North
          newHeight = Math.max(5, element.position.y + element.position.height - mouseY)
          newY = Math.min(element.position.y, mouseY)
          break
      }

      // Constrain to canvas bounds
      newWidth = Math.min(newWidth, 100 - newX)
      newHeight = Math.min(newHeight, 100 - newY)

      onUpdateElement(isResizing, {
        position: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      })
    }
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
    setIsResizing(null)
    setResizeHandle("")
    setDragOffset({ x: 0, y: 0 })
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null)
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full min-h-[800px] bg-white cursor-default"
      style={{ aspectRatio: "8.5/11" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* A4 Paper simulation */}
      <div className="absolute inset-4 border-2 border-dashed border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Grid overlay for better positioning */}
        {!previewMode && (
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {elements.map((element) => (
          <DraggableReportElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onMouseDown={handleMouseDown}
            previewMode={previewMode}
            editingElement={editingElement}
            setEditingElement={setEditingElement}
            editingField={editingField}
            setEditingField={setEditingField}
            onUpdateElement={onUpdateElement}
          />
        ))}
      </div>
    </div>
  )
}

function DraggableReportElement({
  element,
  isSelected,
  onMouseDown,
  previewMode,
  editingElement,
  setEditingElement,
  editingField,
  setEditingField,
  onUpdateElement,
}: {
  element: ReportElement
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent, elementId: string, action: "drag" | "resize", handle?: string) => void
  previewMode: boolean
  editingElement: string | null
  setEditingElement: (id: string | null) => void
  editingField: string | null
  setEditingField: (field: string | null) => void
  onUpdateElement: (id: string, updates: Partial<ReportElement>) => void
}) {
  const renderContent = () => {
    const isEditing = editingElement === element.id

    const handleDoubleClick = (field: string) => {
      if (!previewMode) {
        setEditingElement(element.id)
        setEditingField(field)
      }
    }

    const handleInputChange = (field: string, value: string) => {
      onUpdateElement(element.id, {
        content: { ...element.content, [field]: value },
      })
    }

    const handleInputBlur = () => {
      setEditingElement(null)
      setEditingField(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleInputBlur()
      }
      if (e.key === "Escape") {
        handleInputBlur()
      }
    }

    switch (element.type) {
      case "header":
        return (
          <div>
            {isEditing && editingField === "title" ? (
              <input
                type="text"
                value={element.content.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none"
                style={{ fontSize: element.style.fontSize, fontWeight: element.style.fontWeight }}
                autoFocus
              />
            ) : (
              <div
                style={{ fontSize: element.style.fontSize, fontWeight: element.style.fontWeight }}
                onDoubleClick={() => handleDoubleClick("title")}
                className={!previewMode ? "cursor-text hover:bg-blue-50" : ""}
              >
                {element.content.title}
              </div>
            )}

            {element.content.subtitle && (
              <>
                {isEditing && editingField === "subtitle" ? (
                  <input
                    type="text"
                    value={element.content.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-none outline-none mt-1"
                    style={{ fontSize: "14px" }}
                    autoFocus
                  />
                ) : (
                  <div
                    style={{ fontSize: "14px", marginTop: "5px" }}
                    onDoubleClick={() => handleDoubleClick("subtitle")}
                    className={!previewMode ? "cursor-text hover:bg-blue-50" : ""}
                  >
                    {element.content.subtitle}
                  </div>
                )}
              </>
            )}
          </div>
        )

      case "text":
        return (
          <>
            {isEditing && editingField === "text" ? (
              <textarea
                value={element.content.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                style={{ fontSize: element.style.fontSize }}
                autoFocus
              />
            ) : (
              <div
                className={`text-sm ${!previewMode ? "cursor-text hover:bg-blue-50" : ""}`}
                onDoubleClick={() => handleDoubleClick("text")}
              >
                {element.content.text}
              </div>
            )}
          </>
        )

      case "signature":
        return (
          <div className="space-y-2">
            {isEditing && editingField === "title" ? (
              <input
                type="text"
                value={element.content.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none font-medium text-sm"
                autoFocus
              />
            ) : (
              <div
                className={`font-medium text-sm ${!previewMode ? "cursor-text hover:bg-blue-50" : ""}`}
                onDoubleClick={() => handleDoubleClick("title")}
              >
                {element.content.title}
              </div>
            )}

            <div className="border-b border-black w-32 h-8"></div>

            <div className="text-xs">
              {isEditing && editingField === "name" ? (
                <input
                  type="text"
                  value={element.content.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none font-medium"
                  autoFocus
                />
              ) : (
                <div
                  className={`font-medium ${!previewMode ? "cursor-text hover:bg-blue-50" : ""}`}
                  onDoubleClick={() => handleDoubleClick("name")}
                >
                  {element.content.name}
                </div>
              )}

              {isEditing && editingField === "designation" ? (
                <input
                  type="text"
                  value={element.content.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none"
                  autoFocus
                />
              ) : (
                <div
                  className={!previewMode ? "cursor-text hover:bg-blue-50" : ""}
                  onDoubleClick={() => handleDoubleClick("designation")}
                >
                  {element.content.designation}
                </div>
              )}

              {element.content.license && (
                <>
                  {isEditing && editingField === "license" ? (
                    <input
                      type="text"
                      value={element.content.license}
                      onChange={(e) => handleInputChange("license", e.target.value)}
                      onBlur={handleInputBlur}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none outline-none"
                      autoFocus
                    />
                  ) : (
                    <div
                      className={!previewMode ? "cursor-text hover:bg-blue-50" : ""}
                      onDoubleClick={() => handleDoubleClick("license")}
                    >
                      {element.content.license}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )

      // Keep the existing cases for logo, patient-info, and test-results as they are
      case "logo":
        return (
          <img
            src={element.content.src || "/placeholder.svg"}
            alt={element.content.alt}
            className="max-w-full h-auto object-contain"
            draggable={false}
          />
        )

      case "patient-info":
        return (
          <div>
            <h3 className="font-semibold mb-3 text-sm">Patient Information</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {element.content.fields?.map((field: string, index: number) => (
                <div key={index} className="flex">
                  <span className="font-medium w-20 text-xs">{field}:</span>
                  <span className="border-b border-dotted border-gray-400 flex-1 ml-2">
                    {previewMode ? `[${field}]` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )

      case "test-results":
        return (
          <div>
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
                {previewMode && (
                  <>
                    <tr>
                      <td className="border border-gray-300 p-1 text-xs">Hemoglobin</td>
                      <td className="border border-gray-300 p-1 text-xs">14.2</td>
                      <td className="border border-gray-300 p-1 text-xs">12.0-15.5</td>
                      <td className="border border-gray-300 p-1 text-xs">g/dL</td>
                      <td className="border border-gray-300 p-1 text-xs">Normal</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-1 text-xs">WBC Count</td>
                      <td className="border border-gray-300 p-1 text-xs">7,200</td>
                      <td className="border border-gray-300 p-1 text-xs">4,000-11,000</td>
                      <td className="border border-gray-300 p-1 text-xs">/μL</td>
                      <td className="border border-gray-300 p-1 text-xs">Normal</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )

      default:
        return <div>Unknown element type</div>
    }
  }

  return (
    <div
      className={`absolute select-none ${
        isSelected && !previewMode ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      } ${!previewMode ? "hover:ring-1 hover:ring-blue-300" : ""}`}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        width: `${element.position.width}%`,
        height: `${element.position.height}%`,
        ...element.style,
        textAlign: element.style.textAlign as any,
        color: element.style.color,
        backgroundColor: element.style.backgroundColor,
        cursor: !previewMode ? "move" : "default",
        overflow: "hidden",
      }}
      onMouseDown={(e) => {
        if (editingElement === element.id) {
          e.stopPropagation()
          return
        }
        onMouseDown(e, element.id, "drag")
      }}
    >
      <div className="w-full h-full overflow-hidden">{renderContent()}</div>

      {/* Resize handles */}
      {isSelected && !previewMode && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "nw")}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "ne")}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "sw")}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "se")}
          />

          {/* Edge handles */}
          <div
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-n-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "n")}
          />
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-s-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "s")}
          />
          <div
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-w-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "w")}
          />
          <div
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-e-resize"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "e")}
          />
        </>
      )}
    </div>
  )
}
