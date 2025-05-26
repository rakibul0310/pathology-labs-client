"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Filter, Download, Eye } from "lucide-react"

export function SampleManagement() {
  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sample Management</h2>
          <p className="text-muted-foreground">Register, track, and manage laboratory samples</p>
        </div>
        <Dialog open={isNewSampleOpen} onOpenChange={setIsNewSampleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sample
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Sample</DialogTitle>
              <DialogDescription>Enter patient and sample information to create a new lab entry</DialogDescription>
            </DialogHeader>
            <NewSampleForm onClose={() => setIsNewSampleOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Samples</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-process">In Process</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search samples..." className="pl-8 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <SampleList />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <SampleList status="pending" />
        </TabsContent>
        <TabsContent value="in-process" className="space-y-4">
          <SampleList status="in-process" />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <SampleList status="completed" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NewSampleForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-name">Patient Name</Label>
          <Input id="patient-name" placeholder="Enter patient name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-age">Age</Label>
          <Input id="patient-age" type="number" placeholder="Age" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number</Label>
          <Input id="contact" placeholder="Phone number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tests">Tests Ordered</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select tests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cbc">Complete Blood Count (CBC)</SelectItem>
            <SelectItem value="lipid">Lipid Profile</SelectItem>
            <SelectItem value="liver">Liver Function Test</SelectItem>
            <SelectItem value="thyroid">Thyroid Function Test</SelectItem>
            <SelectItem value="diabetes">Diabetes Panel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sample-type">Sample Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select sample type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blood">Blood</SelectItem>
              <SelectItem value="urine">Urine</SelectItem>
              <SelectItem value="stool">Stool</SelectItem>
              <SelectItem value="saliva">Saliva</SelectItem>
              <SelectItem value="tissue">Tissue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="technician">Assigned Technician</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Dr. Sarah Wilson</SelectItem>
              <SelectItem value="mike">Dr. Mike Chen</SelectItem>
              <SelectItem value="anna">Dr. Anna Rodriguez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea id="notes" placeholder="Any special instructions or notes..." />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Register Sample</Button>
      </div>
    </form>
  )
}

function SampleList({ status }: { status?: string }) {
  const samples = [
    {
      id: "LAB001",
      patient: "John Smith",
      age: 45,
      test: "Complete Blood Count",
      sampleType: "Blood",
      status: "Completed",
      date: "2024-01-15",
      technician: "Dr. Sarah Wilson",
    },
    {
      id: "LAB002",
      patient: "Mary Johnson",
      age: 32,
      test: "Lipid Profile",
      sampleType: "Blood",
      status: "In-Process",
      date: "2024-01-15",
      technician: "Dr. Mike Chen",
    },
    {
      id: "LAB003",
      patient: "Robert Brown",
      age: 58,
      test: "Liver Function Test",
      sampleType: "Blood",
      status: "Pending",
      date: "2024-01-15",
      technician: "Dr. Sarah Wilson",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "In-Process":
        return <Badge className="bg-blue-100 text-blue-800">In-Process</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {samples.map((sample) => (
        <Card key={sample.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-4">
                  <h3 className="font-semibold">{sample.id}</h3>
                  {getStatusBadge(sample.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {sample.patient} • Age {sample.age} • {sample.test}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sample: {sample.sampleType} • Technician: {sample.technician}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
