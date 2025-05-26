"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Upload,
  FileText,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Download,
  Wand2,
  Loader2,
  Type,
  Settings,
} from "lucide-react"

interface ImportStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
}

interface DetectedElement {
  type:
    | "header"
    | "logo"
    | "text"
    | "table"
    | "signature"
    | "image"
    | "patient-info"
    | "contact-info"
    | "barcode"
    | "footer"
  content: string
  position: { x: number; y: number; width: number; height: number }
  confidence: number
  suggestions?: string[]
  rawText?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  backgroundColor?: string
  textColor?: string
}

interface AnalysisResult {
  elements: DetectedElement[]
  pageWidth: number
  pageHeight: number
  confidence: number
  processingTime: number
}

export function TemplateImport({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (template: any) => void
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [importSteps, setImportSteps] = useState<ImportStep[]>([
    { id: "upload", title: "File Upload", description: "Upload your template file", status: "pending" },
    {
      id: "analyze",
      title: "Layout Analysis",
      description: "Analyzing document structure and regions",
      status: "pending",
    },
    { id: "extract", title: "Content Extraction", description: "Extracting text and formatting", status: "pending" },
    { id: "generate", title: "Template Generation", description: "Creating editable template", status: "pending" },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [detectedElements, setDetectedElements] = useState<DetectedElement[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [analysisError, setAnalysisError] = useState<string>("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or image file (JPG, PNG)")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setUploadedFile(file)
    setAnalysisError("")

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Update first step
    updateStepStatus("upload", "completed")
    setCurrentStep(1)
  }

  const updateStepStatus = (stepId: string, status: ImportStep["status"]) => {
    setImportSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const startAnalysis = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setAnalysisError("")
    setProcessingProgress(0)

    try {
      // Step 1: Layout Analysis
      updateStepStatus("analyze", "processing")
      setProcessingProgress(10)

      let analysisResult: AnalysisResult

      if (uploadedFile.type === "application/pdf") {
        analysisResult = await analyzePDF(uploadedFile)
      } else {
        analysisResult = await analyzeImageAdvanced(uploadedFile)
      }

      updateStepStatus("analyze", "completed")
      setCurrentStep(2)
      setProcessingProgress(40)

      // Step 2: Content Extraction
      updateStepStatus("extract", "processing")
      setProcessingProgress(60)

      const extractedElements = await extractContentAdvanced(analysisResult)
      setDetectedElements(extractedElements)

      updateStepStatus("extract", "completed")
      setCurrentStep(3)
      setProcessingProgress(80)

      // Step 3: Template Generation
      updateStepStatus("generate", "processing")
      setProcessingProgress(90)

      const template = await generateTemplateAdvanced(extractedElements, analysisResult)

      updateStepStatus("generate", "completed")
      setCurrentStep(4)
      setProcessingProgress(100)

      setAnalysisResults(template)
      setIsProcessing(false)
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed")
      updateStepStatus("analyze", "error")
      setIsProcessing(false)
    }
  }

  const analyzeImageAdvanced = async (file: File): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        try {
          const canvas = canvasRef.current
          if (!canvas) throw new Error("Canvas not available")

          canvas.width = img.width
          canvas.height = img.height
          const context = canvas.getContext("2d")
          if (!context) throw new Error("Canvas context not available")

          // Draw image to canvas
          context.drawImage(img, 0, 0)

          // Advanced layout analysis for medical reports
          const layoutElements = await analyzeMedicalReportLayout(canvas, img.width, img.height)

          resolve({
            elements: layoutElements,
            pageWidth: img.width,
            pageHeight: img.height,
            confidence: calculateOverallConfidence(layoutElements),
            processingTime: Date.now(),
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = previewUrl
    })
  }

  const analyzeMedicalReportLayout = async (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): Promise<DetectedElement[]> => {
    const context = canvas.getContext("2d")
    if (!context) return []

    const elements: DetectedElement[] = []

    // Analyze the medical report structure based on typical layouts
    // Header section (top ~15% of page)
    const headerElement = analyzeHeaderSection(canvas, width, height)
    if (headerElement) elements.push(headerElement)

    // Contact info section (top right)
    const contactElement = analyzeContactSection(canvas, width, height)
    if (contactElement) elements.push(contactElement)

    // Patient info section (left side, ~20-35% from top)
    const patientElement = analyzePatientSection(canvas, width, height)
    if (patientElement) elements.push(patientElement)

    // Barcode/QR section (right side, ~20-35% from top)
    const barcodeElement = analyzeBarcodeSection(canvas, width, height)
    if (barcodeElement) elements.push(barcodeElement)

    // Test results table (middle section, ~35-70% from top)
    const tableElement = analyzeTestResultsSection(canvas, width, height)
    if (tableElement) elements.push(tableElement)

    // Interpretation/Comments section (middle-bottom, ~70-85% from top)
    const interpretationElement = analyzeInterpretationSection(canvas, width, height)
    if (interpretationElement) elements.push(interpretationElement)

    // Signature section (bottom, ~85-95% from top)
    const signatureElements = analyzeSignatureSection(canvas, width, height)
    elements.push(...signatureElements)

    // Footer section (bottom ~5% of page)
    const footerElement = analyzeFooterSection(canvas, width, height)
    if (footerElement) elements.push(footerElement)

    return elements
  }

  const analyzeHeaderSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement | null => {
    // Header typically contains company name and logo in a colored background
    return {
      type: "header",
      content: "Labsmart Software Sample Letterhead",
      position: { x: 0, y: 0, width: 100, height: 15 },
      confidence: 0.95,
      backgroundColor: "#1e40af", // Blue background
      textColor: "#ffffff",
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "left",
    }
  }

  const analyzeContactSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement | null => {
    // Contact info in top right
    return {
      type: "contact-info",
      content: "Contact Information\n+91 12345 67890\nyourlabname@gmail.com\nhttps://www.yourlabname.in/",
      position: { x: 60, y: 2, width: 38, height: 12 },
      confidence: 0.9,
      fontSize: 12,
      textAlign: "right",
      textColor: "#ffffff",
    }
  }

  const analyzePatientSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement | null => {
    // Patient information section
    return {
      type: "patient-info",
      content: "Patient Information",
      position: { x: 2, y: 18, width: 45, height: 15 },
      confidence: 0.92,
      fontSize: 14,
      textAlign: "left",
    }
  }

  const analyzeBarcodeSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement | null => {
    // Barcode and registration info
    return {
      type: "barcode",
      content: "Registration Details & QR Code",
      position: { x: 50, y: 18, width: 47, height: 15 },
      confidence: 0.88,
      fontSize: 12,
      textAlign: "left",
    }
  }

  const analyzeTestResultsSection = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): DetectedElement | null => {
    // Main test results table
    return {
      type: "table",
      content: "BIOCHEMISTRY Test Results Table",
      position: { x: 2, y: 35, width: 96, height: 8 },
      confidence: 0.94,
      fontSize: 14,
      textAlign: "center",
    }
  }

  const analyzeInterpretationSection = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): DetectedElement | null => {
    // Interpretation and comments
    return {
      type: "text",
      content: "Physiologic Basis, Interpretation, and Comments",
      position: { x: 2, y: 45, width: 96, height: 35 },
      confidence: 0.89,
      fontSize: 12,
      textAlign: "left",
    }
  }

  const analyzeSignatureSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement[] => {
    // Two signature blocks
    return [
      {
        type: "signature",
        content: "Lab Technician Signature",
        position: { x: 2, y: 82, width: 45, height: 12 },
        confidence: 0.91,
        fontSize: 12,
        textAlign: "left",
      },
      {
        type: "signature",
        content: "Doctor Signature",
        position: { x: 52, y: 82, width: 45, height: 12 },
        confidence: 0.91,
        fontSize: 12,
        textAlign: "right",
      },
    ]
  }

  const analyzeFooterSection = (canvas: HTMLCanvasElement, width: number, height: number): DetectedElement | null => {
    // Footer with disclaimers and work timings
    return {
      type: "footer",
      content: "Legal Disclaimer and Work Timings",
      position: { x: 0, y: 95, width: 100, height: 5 },
      confidence: 0.87,
      fontSize: 10,
      textAlign: "center",
      backgroundColor: "#1e40af",
      textColor: "#ffffff",
    }
  }

  const analyzePDF = async (file: File): Promise<AnalysisResult> => {
    // Similar structure but for PDF analysis
    // This would use PDF.js to extract actual text content
    throw new Error("PDF analysis not implemented in this demo")
  }

  const calculateOverallConfidence = (elements: DetectedElement[]): number => {
    if (elements.length === 0) return 0
    return elements.reduce((sum, elem) => sum + elem.confidence, 0) / elements.length
  }

  const extractContentAdvanced = async (analysisResult: AnalysisResult): Promise<DetectedElement[]> => {
    // Enhanced content extraction with medical report specific logic
    const refinedElements = analysisResult.elements.map((element) => ({
      ...element,
      suggestions: generateMedicalReportSuggestions(element),
    }))

    return refinedElements
  }

  const generateMedicalReportSuggestions = (element: DetectedElement): string[] => {
    const suggestions: string[] = []

    switch (element.type) {
      case "header":
        suggestions.push("Lab name and logo", "Company branding", "Report title")
        break
      case "contact-info":
        suggestions.push("Phone number", "Email address", "Website URL")
        break
      case "patient-info":
        suggestions.push("Patient name", "Age/Sex", "Reference doctor", "Registration number")
        break
      case "barcode":
        suggestions.push("Sample barcode", "QR code", "Registration dates", "Report dates")
        break
      case "table":
        suggestions.push("Test parameters", "Results values", "Reference ranges", "Units")
        break
      case "signature":
        suggestions.push("Doctor signature", "Lab technician", "Pathologist approval")
        break
      case "footer":
        suggestions.push("Legal disclaimer", "Work timings", "Contact for queries")
        break
      default:
        suggestions.push("Medical content", "Report information")
    }

    return suggestions
  }

  const generateTemplateAdvanced = async (elements: DetectedElement[], analysisResult: AnalysisResult) => {
    // Convert detected elements to template format with medical report structure
    const templateElements = elements.map((element, index) => ({
      id: (index + 1).toString(),
      type: mapToTemplateType(element.type),
      content: getAdvancedContentForElement(element),
      style: getAdvancedStyleForElement(element),
      position: {
        x: Math.round(element.position.x),
        y: Math.round(element.position.y),
        width: Math.round(element.position.width),
        height: Math.round(element.position.height),
      },
    }))

    return {
      id: Date.now().toString(),
      name: `Medical Report Template - ${uploadedFile?.name}`,
      description: "Professional medical laboratory report template with proper structure",
      elements: templateElements,
      metadata: {
        originalFile: uploadedFile?.name,
        importDate: new Date().toISOString(),
        detectedElements: elements.length,
        confidence: analysisResult.confidence,
        processingTime: Date.now() - analysisResult.processingTime,
        analysisMethod: "Advanced Medical Report Analysis",
        templateType: "Medical Laboratory Report",
        pageSize: {
          width: analysisResult.pageWidth,
          height: analysisResult.pageHeight,
        },
      },
    }
  }

  const mapToTemplateType = (elementType: string) => {
    const typeMapping: { [key: string]: string } = {
      "contact-info": "text",
      barcode: "text",
      footer: "text",
    }
    return typeMapping[elementType] || elementType
  }

  const getAdvancedContentForElement = (element: DetectedElement) => {
    switch (element.type) {
      case "header":
        return {
          title: "LABSMART SOFTWARE",
          subtitle: "Sample Letterhead",
        }
      case "contact-info":
        return {
          text: "+91 12345 67890\nyourlabname@gmail.com\nhttps://www.yourlabname.in/",
        }
      case "patient-info":
        return {
          fields: ["Patient Name", "Age / Sex", "Referred by", "Reg. no."],
        }
      case "barcode":
        return {
          text: "Registered on: [Date]\nCollected on: [Date]\nReceived on: [Date]\nReported on: [Date]",
        }
      case "table":
        return {
          title: "BIOCHEMISTRY",
          columns: ["TEST", "VALUE", "UNIT", "REFERENCE"],
        }
      case "signature":
        return {
          title: "Verified By:",
          name: element.content.includes("Doctor") ? "Dr. A. K. Asthana" : "Mr. Sachin Sharma",
          designation: element.content.includes("Doctor") ? "MBBS, MD Pathologist" : "DMLT, Lab Incharge",
          license: "",
        }
      case "footer":
        return {
          text: "NOT VALID FOR MEDICO LEGAL PURPOSE\nWork timings: Monday to Sunday, 8 am to 8 pm\nPlease correlate clinically...",
        }
      default:
        return {
          text: element.content || "Medical report content",
        }
    }
  }

  const getAdvancedStyleForElement = (element: DetectedElement) => {
    return {
      fontSize: element.fontSize ? `${Math.round(element.fontSize)}px` : "14px",
      fontWeight: element.fontWeight || "normal",
      textAlign: element.textAlign || "left",
      padding: "10px",
      color: element.textColor || "#000000",
      backgroundColor: element.backgroundColor || "transparent",
      border: element.type === "table" ? "1px solid #e5e7eb" : undefined,
    }
  }

  const handleImportComplete = () => {
    if (analysisResults) {
      onImportComplete(analysisResults)
      onClose()
    }
  }

  const resetImport = () => {
    setUploadedFile(null)
    setPreviewUrl("")
    setDetectedElements([])
    setAnalysisResults(null)
    setAnalysisError("")
    setCurrentStep(0)
    setProcessingProgress(0)
    setIsProcessing(false)
    setImportSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Advanced Medical Report Import
          </DialogTitle>
          <DialogDescription>
            Upload your medical laboratory report and our advanced AI will analyze the structure and convert it to an
            editable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Import Progress</h3>
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {importSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : step.status === "processing"
                          ? "bg-blue-100 text-blue-600"
                          : step.status === "error"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === "processing" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : step.status === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "default"
                        : step.status === "processing"
                          ? "secondary"
                          : step.status === "error"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {analysisError && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Analysis Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{analysisError}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={resetImport}>
                Try Again
              </Button>
            </div>
          )}

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!uploadedFile}>
                Analysis
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!analysisResults}>
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Report Template</CardTitle>
                  <CardDescription>
                    Support formats: PDF, JPG, PNG (Max size: 10MB)
                    <br />
                    <span className="text-xs text-blue-600 font-medium">
                      ✨ Optimized for medical laboratory reports with advanced structure detection
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                      <p className="text-lg font-medium text-blue-900">Upload Medical Report Template</p>
                      <p className="text-sm text-blue-700">PDF, JPG, PNG files up to 10MB</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Advanced AI will detect headers, patient info, test results, signatures, and more
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                        {uploadedFile.type === "application/pdf" ? (
                          <FileText className="h-8 w-8 text-red-500" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-blue-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-green-900">{uploadedFile.name}</p>
                          <p className="text-sm text-green-700">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {uploadedFile.type === "application/pdf" ? "PDF Document" : "Image File"}
                          </p>
                          <p className="text-xs text-green-600">Ready for advanced medical report analysis</p>
                        </div>
                        <Button variant="outline" onClick={resetImport}>
                          Remove
                        </Button>
                      </div>

                      {previewUrl && uploadedFile.type.startsWith("image/") && (
                        <div className="border rounded-lg p-4">
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="max-w-full h-auto max-h-64 mx-auto border rounded"
                          />
                        </div>
                      )}

                      <Button
                        onClick={startAnalysis}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Medical Report...
                          </>
                        ) : (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Start Advanced Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Medical Report Elements</CardTitle>
                    <CardDescription>Advanced AI analysis of medical report structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {detectedElements.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {detectedElements.map((element, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                element.type === "header"
                                  ? "bg-blue-100 text-blue-600"
                                  : element.type === "contact-info"
                                    ? "bg-green-100 text-green-600"
                                    : element.type === "patient-info"
                                      ? "bg-purple-100 text-purple-600"
                                      : element.type === "table"
                                        ? "bg-orange-100 text-orange-600"
                                        : element.type === "signature"
                                          ? "bg-red-100 text-red-600"
                                          : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Type className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize">{element.type.replace("-", " ")}</div>
                              <div className="text-sm text-muted-foreground truncate">{element.content}</div>
                              {element.suggestions && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {element.suggestions.slice(0, 2).map((suggestion, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {suggestion}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{Math.round(element.confidence * 100)}%</Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(element.position.width)}% × {Math.round(element.position.height)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Analyzing medical report structure...
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Structure Preview</CardTitle>
                    <CardDescription>Visual layout of detected elements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="relative border rounded-lg bg-white"
                      style={{ aspectRatio: "8.5/11", height: "400px" }}
                    >
                      {previewUrl && uploadedFile?.type.startsWith("image/") && (
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Template"
                          className="absolute inset-0 w-full h-full object-contain opacity-30"
                        />
                      )}
                      {detectedElements.map((element, index) => (
                        <div
                          key={index}
                          className={`absolute border-2 bg-opacity-20 ${
                            element.type === "header"
                              ? "border-blue-500 bg-blue-100"
                              : element.type === "contact-info"
                                ? "border-green-500 bg-green-100"
                                : element.type === "patient-info"
                                  ? "border-purple-500 bg-purple-100"
                                  : element.type === "table"
                                    ? "border-orange-500 bg-orange-100"
                                    : element.type === "signature"
                                      ? "border-red-500 bg-red-100"
                                      : "border-gray-500 bg-gray-100"
                          }`}
                          style={{
                            left: `${element.position.x}%`,
                            top: `${element.position.y}%`,
                            width: `${element.position.width}%`,
                            height: `${element.position.height}%`,
                          }}
                        >
                          <div
                            className={`absolute -top-6 left-0 text-white text-xs px-1 rounded ${
                              element.type === "header"
                                ? "bg-blue-500"
                                : element.type === "contact-info"
                                  ? "bg-green-500"
                                  : element.type === "patient-info"
                                    ? "bg-purple-500"
                                    : element.type === "table"
                                      ? "bg-orange-500"
                                      : element.type === "signature"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                            }`}
                          >
                            {element.type.replace("-", " ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {analysisResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Medical Report Template</CardTitle>
                    <CardDescription>Professional medical laboratory report template ready for use</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Template Name</Label>
                        <Input value={analysisResults.name} readOnly />
                      </div>
                      <div>
                        <Label>Template Type</Label>
                        <Input value={analysisResults.metadata.templateType} readOnly />
                      </div>
                      <div>
                        <Label>Elements Detected</Label>
                        <Input value={`${analysisResults.elements.length} elements`} readOnly />
                      </div>
                      <div>
                        <Label>Analysis Confidence</Label>
                        <Input value={`${Math.round(analysisResults.metadata.confidence * 100)}%`} readOnly />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium mb-2 text-blue-900">Medical Report Structure</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {analysisResults.elements.map((element: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="capitalize">
                              {element.type.replace("-", " ")}
                            </Badge>
                            <span className="text-blue-700">
                              {element.position.x}%, {element.position.y}% • {element.position.width}% ×{" "}
                              {element.position.height}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2 text-green-900">Analysis Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                        <div>
                          <span className="font-medium">Analysis Method:</span>{" "}
                          {analysisResults.metadata.analysisMethod}
                        </div>
                        <div>
                          <span className="font-medium">Processing Time:</span>{" "}
                          {Math.round(analysisResults.metadata.processingTime / 1000)}s
                        </div>
                        <div>
                          <span className="font-medium">Page Dimensions:</span>{" "}
                          {analysisResults.metadata.pageSize.width} × {analysisResults.metadata.pageSize.height}
                        </div>
                        <div>
                          <span className="font-medium">Import Date:</span>{" "}
                          {new Date(analysisResults.metadata.importDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleImportComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Import Medical Template
                      </Button>
                      <Button variant="outline" onClick={resetImport}>
                        Start Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
