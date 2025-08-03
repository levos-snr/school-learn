"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { Download, FileText, Search, Star, TrendingUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function PastPapersTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedForm, setSelectedForm] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const pastPapers = useQuery(api.pastPapers.list)

  const handleDownload = async (paperId: string, title: string) => {
    try {
      // In a real app, this would trigger the actual download
      toast.success(`Downloading ${title}...`)

      // Update download count (you'd implement this mutation)
      // await incrementDownload({ paperId })
    } catch (error) {
      toast.error("Failed to download paper")
    }
  }

  const filteredPapers = pastPapers?.filter((paper) => {
    const matchesSubject = selectedSubject === "all" || paper.subject === selectedSubject
    const matchesForm = selectedForm === "all" || paper.form === selectedForm
    const matchesYear = selectedYear === "all" || paper.year.toString() === selectedYear
    const matchesType = selectedType === "all" || paper.type === selectedType
    const matchesSearch =
      searchQuery === "" ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSubject && matchesForm && matchesYear && matchesType && matchesSearch
  })

  const totalPapers = pastPapers?.length || 0
  const totalDownloads = pastPapers?.reduce((acc, paper) => acc + paper.downloads, 0) || 0
  const popularPapers = pastPapers?.filter((paper) => paper.downloads > 100).length || 0
  const currentYear = new Date().getFullYear()
  const recentPapers = pastPapers?.filter((paper) => paper.year >= currentYear - 2).length || 0

  if (!pastPapers) {
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
              <CardTitle className="text-sm font-medium">Popular Papers</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{popularPapers}</div>
              <p className="text-xs text-muted-foreground">100+ downloads</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Papers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentPapers}</div>
              <p className="text-xs text-muted-foreground">Last 2 years</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search past papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
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

          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              <SelectItem value="Form 1">Form 1</SelectItem>
              <SelectItem value="Form 2">Form 2</SelectItem>
              <SelectItem value="Form 3">Form 3</SelectItem>
              <SelectItem value="Form 4">Form 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
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
              <SelectItem value="End Term">End Term</SelectItem>
              <SelectItem value="Mid Term">Mid Term</SelectItem>
              <SelectItem value="KCSE">KCSE</SelectItem>
              <SelectItem value="Mock">Mock</SelectItem>
              <SelectItem value="CAT">CAT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Papers Grid */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPapers?.map((paper) => {
          const isPopular = paper.downloads > 100
          const isRecent = paper.year >= currentYear - 1
          const isVerified = paper.isVerified

          return (
            <FadeIn key={paper._id}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                      <CardDescription>
                        {paper.subject} • {paper.form} • {paper.year}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      {isVerified && (
                        <Badge variant="default" className="text-xs bg-green-600">
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

                  <div className="text-xs text-muted-foreground">Uploaded on {paper.uploadDate}</div>

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

      {filteredPapers?.length === 0 && (
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
    </div>
  )
}

