"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import { FileText, Download, Search, Calendar, BookOpen, Star, TrendingDown, Eye, Heart, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PastPapersPage() {
  const [filters, setFilters] = useState({
    subject: undefined as string | undefined,
    year: undefined as number | undefined,
    form: undefined as string | undefined,
    type: undefined as "past_paper" | "marking_scheme" | "specimen" | undefined,
    search: undefined as string | undefined,
    limit: 20,
    offset: 0,
  })

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    form: "",
    year: new Date().getFullYear(),
    type: "past_paper" as "past_paper" | "marking_scheme" | "specimen",
    tags: "",
    file: null as File | null,
  })

  const papers = useQuery(api.pastPapers.getPastPapers, filters)
  const subjects = useQuery(api.pastPapers.getPastPaperSubjects)
  const years = useQuery(api.pastPapers.getPastPaperYears)
  const stats = useQuery(api.pastPapers.getPastPaperStats)

  const downloadPaper = useMutation(api.pastPapers.downloadPaper)
  const uploadPaper = useMutation(api.pastPapers.uploadPaper)

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, offset: 0 }))
  }

  const handleSubjectFilter = (subject: string) => {
    setFilters((prev) => ({ ...prev, subject: subject === "all" ? undefined : subject, offset: 0 }))
  }

  const handleYearFilter = (year: string) => {
    setFilters((prev) => ({ ...prev, year: year === "all" ? undefined : Number.parseInt(year), offset: 0 }))
  }

  const handleTypeFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: type === "all" ? undefined : (type as "past_paper" | "marking_scheme" | "specimen"),
      offset: 0,
    }))
  }

  const loadMore = () => {
    setFilters((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
  }

  const handleDownload = async (paperId: string, title: string) => {
    try {
      const result = await downloadPaper({ paperId })
      if (result.success) {
        // Create a temporary download link
        const link = document.createElement("a")
        link.href = result.downloadUrl
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success(`Downloaded ${title} successfully! +5 XP`)
      }
    } catch (error) {
      toast.error("Failed to download paper")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB")
        return
      }
      setUploadForm((prev) => ({ ...prev, file }))
    }
  }

  const handleUploadSubmit = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.form) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // In a real app, you would upload the file to a storage service first
      const mockFileUrl = `/uploads/${uploadForm.file.name}`
      const fileSize = `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`
      const tags = uploadForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      await uploadPaper({
        title: uploadForm.title,
        subject: uploadForm.subject,
        form: uploadForm.form,
        year: uploadForm.year,
        type: uploadForm.type,
        fileUrl: mockFileUrl,
        fileSize,
        tags,
      })

      toast.success("Paper uploaded successfully! +50 XP (Pending verification)")
      setUploadDialogOpen(false)
      setUploadForm({
        title: "",
        subject: "",
        form: "",
        year: new Date().getFullYear(),
        type: "past_paper",
        tags: "",
        file: null,
      })
    } catch (error) {
      toast.error("Failed to upload paper")
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "past_paper":
        return "bg-blue-500"
      case "marking_scheme":
        return "bg-green-500"
      case "specimen":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      Mathematics: "📐",
      Physics: "⚛️",
      Chemistry: "🧪",
      Biology: "🧬",
      English: "📚",
      Kiswahili: "🗣️",
      History: "🏛️",
      Geography: "🌍",
    }
    return icons[subject] || "📄"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Past Papers Library
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Access thousands of past papers, marking schemes, and specimen papers
              </p>
              <div className="flex gap-4 justify-center">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Paper
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Upload Past Paper</DialogTitle>
                      <DialogDescription>
                        Share a past paper with the community. All uploads are reviewed before publication.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Mathematics Form 4 End Term 1 2024"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Select
                            value={uploadForm.subject}
                            onValueChange={(value) => setUploadForm((prev) => ({ ...prev, subject: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Kiswahili">Kiswahili</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Geography">Geography</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="form">Form *</Label>
                          <Select
                            value={uploadForm.form}
                            onValueChange={(value) => setUploadForm((prev) => ({ ...prev, form: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select form" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Form 1">Form 1</SelectItem>
                              <SelectItem value="Form 2">Form 2</SelectItem>
                              <SelectItem value="Form 3">Form 3</SelectItem>
                              <SelectItem value="Form 4">Form 4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            type="number"
                            min="2010"
                            max={new Date().getFullYear()}
                            value={uploadForm.year}
                            onChange={(e) =>
                              setUploadForm((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={uploadForm.type}
                            onValueChange={(value) => setUploadForm((prev) => ({ ...prev, type: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="past_paper">Past Paper</SelectItem>
                              <SelectItem value="marking_scheme">Marking Scheme</SelectItem>
                              <SelectItem value="specimen">Specimen Paper</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          placeholder="e.g., Algebra, Calculus, Geometry"
                          value={uploadForm.tags}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, tags: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="file">PDF File *</Label>
                        <Input id="file" type="file" accept=".pdf" onChange={handleFileUpload} />
                        {uploadForm.file && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {uploadForm.file.name} ({(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB)
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadSubmit}>Upload Paper</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          {stats && (
            <SlideIn direction="up" delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{stats.totalPapers}</div>
                      <div className="text-sm font-medium">Total Papers</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.kcsePapers}</div>
                      <div className="text-sm font-medium">KCSE Papers</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{stats.totalDownloads.toLocaleString()}</div>
                      <div className="text-sm font-medium">Downloads</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <BookOpen className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600">{stats.verifiedPapers}</div>
                      <div className="text-sm font-medium">Verified</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SlideIn>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search past papers..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <Select onValueChange={handleSubjectFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.name} value={subject.name}>
                      {subject.name} ({subject.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select onValueChange={handleYearFilter}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years?.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="past_paper">Past Papers</SelectItem>
                  <SelectItem value="marking_scheme">Marking Schemes</SelectItem>
                  <SelectItem value="specimen">Specimen Papers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(filters.subject || filters.year || filters.type || filters.search) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <button onClick={() => handleSearch("")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Subject: {filters.subject}
                    <button onClick={() => handleSubjectFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.year && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Year: {filters.year}
                    <button onClick={() => handleYearFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.type.replace("_", " ")}
                    <button onClick={() => handleTypeFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Papers Grid */}
      <div className="container mx-auto px-4 pb-8">
        {papers === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-2 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : papers.papers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No papers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or browse all papers</p>
              <Button
                onClick={() =>
                  setFilters({
                    subject: undefined,
                    year: undefined,
                    form: undefined,
                    type: undefined,
                    search: undefined,
                    limit: 20,
                    offset: 0,
                  })
                }
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {papers.papers.map((paper, index) => (
                <FadeIn key={paper._id} delay={index * 0.1}>
                  <Card className="hover:shadow-lg transition-all duration-300 group">
                    <div className={`h-2 bg-gradient-to-r ${getTypeColor(paper.type)} rounded-t-lg`} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{getSubjectIcon(paper.subject)}</div>
                          <Badge className={`${getTypeColor(paper.type)} text-white`}>
                            {paper.type.replace("_", " ")}
                          </Badge>
                        </div>
                        {paper.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {paper.title}
                      </h3>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center justify-between">
                          <span>{paper.subject}</span>
                          <span>{paper.form}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{paper.year}</span>
                          </div>
                          <span>{paper.fileSize}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            <span>{paper.downloadCount} downloads</span>
                          </div>
                          {paper.uploader && <span className="text-xs">by {paper.uploader.name}</span>}
                        </div>
                      </div>

                      {/* Tags */}
                      {paper.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {paper.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {paper.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{paper.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm" onClick={() => handleDownload(paper._id, paper.title)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>

            {/* Load More Button */}
            {papers.hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} variant="outline" size="lg">
                  Load More Papers
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popular Papers Section */}
      {stats && stats.topSubjects.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Popular Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.topSubjects.map((subject) => (
                  <div key={subject.subject} className="text-center">
                    <div className="text-2xl mb-2">{getSubjectIcon(subject.subject)}</div>
                    <div className="font-semibold text-sm">{subject.subject}</div>
                    <div className="text-xs text-muted-foreground">{subject.count} papers</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

