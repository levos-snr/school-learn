"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Download, FileText, Search, Star, TrendingUp, Upload, Verified } from 'lucide-react'
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function PastPapersTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedForm, setSelectedForm] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "",
    form: "",
    year: new Date().getFullYear(),
    type: "End Term" as const,
    term: "",
    fileUrl: "",
    fileSize: "",
    tags: [] as string[],
  })

  const pastPapersQuery = useQuery(api.pastPapers.list, {
    subject: selectedSubject !== "all" ? selectedSubject : undefined,
    form: selectedForm !== "all" ? selectedForm : undefined,
    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    search: searchQuery || undefined,
  })

  const subjects = useQuery(api.pastPapers.getSubjects)
  const forms = useQuery(api.pastPapers.getForms)
  const years = useQuery(api.pastPapers.getYears)
  const types = useQuery(api.pastPapers.getTypes)
  const stats = useQuery(api.pastPapers.getPastPaperStats)
  const popularPapers = useQuery(api.pastPapers.getPopularPapers, { limit: 5 })
  const recentPapers = useQuery(api.pastPapers.getRecentPapers, { limit: 5 })

  const downloadPaper = useMutation(api.pastPapers.downloadPastPaper)
  const uploadPaper = useMutation(api.pastPapers.uploadPastPaper)

  const handleDownload = async (paperId: string, title: string) => {
    try {
      const result = await downloadPaper({ paperId: paperId as any })
      
      // Create download link
      const link = document.createElement('a')
      link.href = result.fileUrl
      link.download = result.fileName
      link.click()
      
      toast.success(`Downloaded ${title}`)
    } catch (error) {
      toast.error("Failed to download paper")
    }
  }

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.subject || !uploadData.form || !uploadData.fileUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await uploadPaper(uploadData)
      toast.success("Past paper uploaded successfully! +50 XP")
      setUploadDialogOpen(false)
      setUploadData({
        title: "",
        subject: "",
        form: "",
        year: new Date().getFullYear(),
        type: "End Term",
        term: "",
        fileUrl: "",
        fileSize: "",
        tags: [],
      })
    } catch (error) {
      toast.error("Failed to upload paper")
    }
  }

  const pastPapers = pastPapersQuery?.papers || []
  const totalPapers = stats?.totalPapers || 0
  const totalDownloads = stats?.totalDownloads || 0
  const kcsePapers = stats?.kcsePapers || 0
  const verifiedPapers = stats?.verifiedPapers || 0

  if (pastPapersQuery === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPapers}</div>
              <p className="text-xs text-muted-foreground">Across all subjects</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Community downloads</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KCSE Papers</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kcsePapers}</div>
              <p className="text-xs text-muted-foreground">Official exam papers</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Papers</CardTitle>
              <Verified className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedPapers}</div>
              <p className="text-xs text-muted-foreground">Quality assured</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Upload Button and Search */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search past papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Past Paper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g., Mathematics Form 4 End Term 1 2024"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={uploadData.subject} onValueChange={(value) => setUploadData({ ...uploadData, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="form">Form *</Label>
                  <Select value={uploadData.form} onValueChange={(value) => setUploadData({ ...uploadData, form: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms?.map((form) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={uploadData.year}
                    onChange={(e) => setUploadData({ ...uploadData, year: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={uploadData.type} onValueChange={(value: any) => setUploadData({ ...uploadData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="End Term">End Term</SelectItem>
                      <SelectItem value="Mid Term">Mid Term</SelectItem>
                      <SelectItem value="KCSE">KCSE</SelectItem>
                      <SelectItem value="Mock">Mock</SelectItem>
                      <SelectItem value="CAT">CAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fileUrl">File URL *</Label>
                <Input
                  id="fileUrl"
                  value={uploadData.fileUrl}
                  onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                  placeholder="https://example.com/paper.pdf"
                />
              </div>
              
              <div>
                <Label htmlFor="fileSize">File Size</Label>
                <Input
                  id="fileSize"
                  value={uploadData.fileSize}
                  onChange={(e) => setUploadData({ ...uploadData, fileSize: e.target.value })}
                  placeholder="e.g., 2.5 MB"
                />
              </div>
              
              <Button onClick={handleUpload} className="w-full">
                Upload Paper
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by subject" />
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

        <Select value={selectedForm} onValueChange={setSelectedForm}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            {forms?.map((form) => (
              <SelectItem key={form} value={form}>
                {form}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by year" />
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

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Papers Grid */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pastPapers.map((paper) => {
          const isPopular = paper.downloads > 100
          const isRecent = paper.year >= new Date().getFullYear() - 1
          const isVerified = paper.isVerified

          return (
            <FadeIn key={paper._id}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                      <CardDescription>
                        {paper.subject} • {paper.form} • {paper.year}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      {isVerified && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      {isRecent && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{paper.fileSize}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{paper.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {paper.type}
                    </Badge>
                    {paper.term && (
                      <Badge variant="outline" className="text-xs">
                        {paper.term}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      By {paper.uploaderName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button onClick={() => handleDownload(paper._id, paper.title)} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Paper
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </StaggerContainer>

      {pastPapers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No past papers found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ||
              selectedSubject !== "all" ||
              selectedForm !== "all" ||
              selectedYear !== "all" ||
              selectedType !== "all"
                ? "Try adjusting your search or filters to find more papers."
                : "Past papers will be added soon. Check back later!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Popular and Recent Papers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Popular Papers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularPapers?.slice(0, 5).map((paper) => (
                <div key={paper._id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{paper.title}</p>
                    <p className="text-xs text-muted-foreground">{paper.downloads} downloads</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(paper._id, paper.title)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Recent Papers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPapers?.slice(0, 5).map((paper) => (
                <div key={paper._id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{paper.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(paper._id, paper.title)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
