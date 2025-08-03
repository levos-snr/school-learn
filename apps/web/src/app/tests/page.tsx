"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import {
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  Play,
  Trophy,
  Target,
  Brain,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function TestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"upcoming" | "completed" | "overdue" | undefined>(undefined)

  const tests = useQuery(api.tests.getUserTests, { status: selectedStatus })
  const stats = useQuery(api.tests.getTestStats)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-blue-500"
      case "midterm":
        return "bg-orange-500"
      case "final":
        return "bg-red-500"
      case "practice":
        return "bg-green-500"
      default:
        return "bg-gray-500"
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
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Tests & Quizzes
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Test your knowledge and track your progress
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
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <TestTube className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                      <div className="text-sm font-medium">Total</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                      <div className="text-sm font-medium">Upcoming</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-sm font-medium">Completed</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.passed}</div>
                      <div className="text-sm font-medium">Passed</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <Target className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-600">{stats.averageScore}%</div>
                      <div className="text-sm font-medium">Average</div>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => setSelectedStatus(undefined)}>
              All Tests
            </TabsTrigger>
            <TabsTrigger value="upcoming" onClick={() => setSelectedStatus("upcoming")}>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setSelectedStatus("completed")}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="overdue" onClick={() => setSelectedStatus("overdue")}>
              Overdue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {tests === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-2 bg-muted rounded-t-lg" />
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
            ) : tests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TestTube className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tests found</h3>
                  <p className="text-muted-foreground">You don't have any tests at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test, index) => (
                  <FadeIn key={test._id} delay={index * 0.1}>
                    <Card className="hover:shadow-lg transition-all duration-300 group">
                      <div className={`h-2 bg-gradient-to-r ${getTypeColor(test.type)} rounded-t-lg`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${getTypeColor(test.type)}`}>
                              <Brain className="h-5 w-5 text-white" />
                            </div>
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusIcon(test.status)}
                              <span className="ml-1 capitalize">{test.status}</span>
                            </Badge>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {test.type}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {test.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{test.description}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span>{test.course?.title}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{test.instructor?.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDueDate(test.dueDate)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Brain className="h-4 w-4" />
                              <span>{test.questions.length} questions</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{test.timeLimit} mins</span>
                            </div>
                          </div>
                        </div>

                        {/* Best Score Display */}
                        {test.bestAttempt && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Best Score</span>
                              <span className="font-semibold text-primary">
                                {test.bestAttempt.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={test.bestAttempt.percentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                              <span>
                                Attempts: {test.attempts.length}/{test.maxAttempts}
                              </span>
                              <span className={test.bestAttempt.passed ? "text-green-600" : "text-red-600"}>
                                {test.bestAttempt.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {test.status === "upcoming" && test.attemptsRemaining > 0 ? (
                            <Link href={`/tests/${test._id}/take`} className="flex-1">
                              <Button className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Start Test
                              </Button>
                            </Link>
                          ) : test.status === "completed" ? (
                            <Link href={`/tests/${test._id}/results`} className="flex-1">
                              <Button variant="outline" className="w-full bg-transparent">
                                <Trophy className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="outline" className="flex-1 bg-transparent" disabled>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {test.status === "overdue" ? "Overdue" : "No Attempts Left"}
                            </Button>
                          )}

                          <Link href={`/tests/${test._id}`}>
                            <Button variant="outline" size="sm">
                              <TestTube className="h-4 w-4" />
                            </Button>
                          </Link>
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
"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import {
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  Play,
  Trophy,
  Target,
  Brain,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function TestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"upcoming" | "completed" | "overdue" | undefined>(undefined)

  const tests = useQuery(api.tests.getUserTests, { status: selectedStatus })
  const stats = useQuery(api.tests.getTestStats)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-blue-500"
      case "midterm":
        return "bg-orange-500"
      case "final":
        return "bg-red-500"
      case "practice":
        return "bg-green-500"
      default:
        return "bg-gray-500"
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
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Tests & Quizzes
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Test your knowledge and track your progress
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
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <TestTube className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                      <div className="text-sm font-medium">Total</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                      <div className="text-sm font-medium">Upcoming</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-sm font-medium">Completed</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.passed}</div>
                      <div className="text-sm font-medium">Passed</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <Target className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-600">{stats.averageScore}%</div>
                      <div className="text-sm font-medium">Average</div>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => setSelectedStatus(undefined)}>
              All Tests
            </TabsTrigger>
            <TabsTrigger value="upcoming" onClick={() => setSelectedStatus("upcoming")}>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setSelectedStatus("completed")}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="overdue" onClick={() => setSelectedStatus("overdue")}>
              Overdue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {tests === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-2 bg-muted rounded-t-lg" />
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
            ) : tests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TestTube className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tests found</h3>
                  <p className="text-muted-foreground">You don't have any tests at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test, index) => (
                  <FadeIn key={test._id} delay={index * 0.1}>
                    <Card className="hover:shadow-lg transition-all duration-300 group">
                      <div className={`h-2 bg-gradient-to-r ${getTypeColor(test.type)} rounded-t-lg`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${getTypeColor(test.type)}`}>
                              <Brain className="h-5 w-5 text-white" />
                            </div>
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusIcon(test.status)}
                              <span className="ml-1 capitalize">{test.status}</span>
                            </Badge>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {test.type}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {test.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{test.description}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span>{test.course?.title}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{test.instructor?.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDueDate(test.dueDate)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Brain className="h-4 w-4" />
                              <span>{test.questions.length} questions</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{test.timeLimit} mins</span>
                            </div>
                          </div>
                        </div>

                        {/* Best Score Display */}
                        {test.bestAttempt && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Best Score</span>
                              <span className="font-semibold text-primary">
                                {test.bestAttempt.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={test.bestAttempt.percentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                              <span>
                                Attempts: {test.attempts.length}/{test.maxAttempts}
                              </span>
                              <span className={test.bestAttempt.passed ? "text-green-600" : "text-red-600"}>
                                {test.bestAttempt.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {test.status === "upcoming" && test.attemptsRemaining > 0 ? (
                            <Link href={`/tests/${test._id}/take`} className="flex-1">
                              <Button className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Start Test
                              </Button>
                            </Link>
                          ) : test.status === "completed" ? (
                            <Link href={`/tests/${test._id}/results`} className="flex-1">
                              <Button variant="outline" className="w-full bg-transparent">
                                <Trophy className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="outline" className="flex-1 bg-transparent" disabled>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {test.status === "overdue" ? "Overdue" : "No Attempts Left"}
                            </Button>
                          )}

                          <Link href={`/tests/${test._id}`}>
                            <Button variant="outline" size="sm">
                              <TestTube className="h-4 w-4" />
                            </Button>
                          </Link>
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

