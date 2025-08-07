"use client"

import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from "sonner"

interface BulkCourseUploadProps {
  isOpen: boolean
  onClose: () => void
}

interface CourseRow {
  shortname: string
  title: string
  category: string
  description?: string
  level?: "beginner" | "intermediate" | "advanced"
  duration?: string
  price?: number
  templateCourse?: string
  startDate?: string
  endDate?: string
}

interface UploadResult {
  success: boolean
  courseId?: string
  shortname: string
  error?: string
}

export function BulkCourseUpload({ isOpen, onClose }: BulkCourseUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [csvData, setCsvData] = useState<CourseRow[]>([])
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const bulkCreateCourses = useMutation(api.courses.bulkCreateCourses)

  const csvTemplate = `shortname,title,category,description,level,duration,price,templateCourse,startDate,endDate
math101,Introduction to Mathematics,mathematics,Basic math concepts for beginners,beginner,4 weeks,0,,2024-01-15,2024-02-15
sci201,Advanced Science,science,Deep dive into scientific principles,advanced,6 weeks,49.99,sci-template,2024-02-01,2024-03-15
eng101,English Literature,english,Explore classic literature,intermediate,5 weeks,29.99,,2024-01-20,2024-02-25`

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'course-upload-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success("Template downloaded successfully")
  }

  const parseCsv = (csvText: string): CourseRow[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        switch (header) {
          case 'price':
            row[header] = value ? parseFloat(value) : 0
            break
          case 'level':
            row[header] = ['beginner', 'intermediate', 'advanced'].includes(value) ? value : 'beginner'
            break
          default:
            row[header] = value
        }
      })
      
      return row as CourseRow
    })
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedData = parseCsv(csvText)
        setCsvData(parsedData)
        setUploadResults([])
        toast.success(`Parsed ${parsedData.length} courses from CSV`)
      } catch (error) {
        toast.error("Failed to parse CSV file")
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast.error("No courses to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const results = await bulkCreateCourses({ courses: csvData })
      setUploadResults(results)
      
      const successCount = results.filter(r => r.success).length
      const failureCount = results.length - successCount
      
      if (failureCount === 0) {
        toast.success(`Successfully created ${successCount} courses`)
      } else {
        toast.warning(`Created ${successCount} courses, ${failureCount} failed`)
      }
    } catch (error) {
      toast.error("Failed to upload courses")
      console.error(error)
    } finally {
      setIsUploading(false)
      setUploadProgress(100)
    }
  }

  const clearData = () => {
    setCsvData([])
    setUploadResults([])
    setUploadProgress(0)
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Course Upload</DialogTitle>
          <DialogDescription>
            Upload multiple courses at once using a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>
                Download the CSV template to see the required format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Drag and drop your CSV file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here, or{" "}
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Data */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Preview ({csvData.length} courses)
                    </CardTitle>
                    <CardDescription>
                      Review the courses before uploading
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {csvData.slice(0, 10).map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{course.category}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {course.level || 'beginner'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {course.shortname}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${course.price || 0}
                          </p>
                          <p className="text-sm text-gray-500">
                            {course.duration || '4 weeks'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {csvData.length > 10 && (
                      <p className="text-center text-sm text-gray-500 py-2">
                        ... and {csvData.length - 10} more courses
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardHeader>
                <CardTitle>Uploading Courses...</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  Please wait while we create your courses
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Upload Results
                </CardTitle>
                <CardDescription>
                  {uploadResults.filter(r => r.success).length} successful, {' '}
                  {uploadResults.filter(r => !r.success).length} failed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {uploadResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 border rounded ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{result.shortname}</p>
                          {result.error && (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          
          <div className="flex gap-2">
            {csvData.length > 0 && uploadResults.length === 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : `Upload ${csvData.length} Courses`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
