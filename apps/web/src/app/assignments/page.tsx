"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  Download,
  Upload,
  Eye,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AssignmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "submitted" | "graded" | "overdue" | undefined>(
    undefined,
  )

  const assignments = useQuery(api.assignments.getUserAssignments, { status: selectedStatus })
  const stats = useQuery(api.assignments.getAssignmentStats)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "graded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "submitted":
        return <Upload className="h-4 w-4" />
      case "graded":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDueDate = (dueDate: number) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = dueDate - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`
    } else if (diffDays === 0) {
      return "Due today"
    } else if (diffDays === 1) {
      return "Due tomorrow"
    } else {
      return `Due in ${diffDays} days`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                My Assignments
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Stay on top of your assignments and never miss a deadline
              </p>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          {stats && (
            <SlideIn direction="up" delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm font-medium">Total</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                      <div className="text-sm font-medium">Pending</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                      <div className="text-sm font-medium">Submitted</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                      <div className="text-sm font-medium">Graded</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                      <div className="text-sm font-medium">Overdue</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SlideIn>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => setSelectedStatus(undefined)}>
              All
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setSelectedStatus("pending")}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="submitted" onClick={() => setSelectedStatus("submitted")}>
              Submitted
            </TabsTrigger>
            <TabsTrigger value="graded" onClick={() => setSelectedStatus("graded")}>
              Graded
            </TabsTrigger>
            <TabsTrigger value="overdue" onClick={() => setSelectedStatus("overdue")}>
              Overdue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {assignments === undefined ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No assignments found</h3>
                  <p className="text-muted-foreground">You don't have any assignments at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <FadeIn key={assignment._id} delay={index * 0.1}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-foreground">{assignment.title}</h3>
                              <Badge className={getStatusColor(assignment.status)}>
                                {getStatusIcon(assignment.status)}
                                <span className="ml-1 capitalize">{assignment.status}</span>
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{assignment.course?.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{assignment.instructor?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDueDate(assignment.dueDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{assignment.totalPoints} points</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {assignment.submission?.grade || "--"}/{assignment.totalPoints}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.submission?.grade
                                ? `${Math.round((assignment.submission.grade / assignment.totalPoints) * 100)}%`
                                : "Not graded"}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for graded assignments */}
                        {assignment.submission?.grade && (
                          <div className="mb-4">
                            <Progress
                              value={(assignment.submission.grade / assignment.totalPoints) * 100}
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Link href={`/assignments/${assignment._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>

                            {assignment.attachments.length > 0 && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Resources ({assignment.attachments.length})
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {assignment.status === "pending" && (
                              <Link href={`/assignments/${assignment._id}/submit`}>
                                <Button size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Submit
                                </Button>
                              </Link>
                            )}

                            {assignment.status === "graded" && assignment.submission?.feedback && (
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View Feedback
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

