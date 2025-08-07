"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Award, Clock, FileText, Target, TrendingUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function TestsTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("available")

  const tests = useQuery(api.tests.list)
  const attempts = useQuery(api.tests.getUserAttempts)
  const startTest = useMutation(api.tests.startAttempt)
  const submitTest = useMutation(api.tests.submitAttempt)

  const handleStartTest = async (testId: string) => {
    try {
      await startTest({ testId: testId as any })
      toast.success("Test started! Good luck!")
    } catch (error) {
      toast.error("Failed to start test")
    }
  }

  const handleSubmitTest = async (testId: string) => {
    try {
      // Mock answers for demo
      const mockAnswers = [
        { questionId: "1", answer: "A", isCorrect: true, pointsEarned: 5 },
        { questionId: "2", answer: "B", isCorrect: true, pointsEarned: 5 },
        { questionId: "3", answer: "C", isCorrect: false, pointsEarned: 0 },
      ]

      await submitTest({
        testId: testId as any,
        answers: mockAnswers,
        timeSpent: 2400, // 40 minutes
      })

      toast.success("Test submitted successfully! +75 XP")
    } catch (error) {
      toast.error("Failed to submit test")
    }
  }

  const filteredTests = tests?.filter((test) => 
    selectedSubject === "all" || test.courseTitle?.toLowerCase().includes(selectedSubject.toLowerCase())
  )

  const completedTests = attempts?.filter((a) => a.status === "completed").length || 0
  const averageScore = attempts?.length
    ? attempts.reduce((acc, attempt) => acc + attempt.percentage, 0) / attempts.length
    : 0
  const bestScore = attempts?.length ? Math.max(...attempts.map((a) => a.percentage)) : 0

  if (!tests) {
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
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTests}</div>
              <p className="text-xs text-muted-foreground">Out of {tests?.length || 0} available</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
              <Progress value={averageScore} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(bestScore)}%</div>
              <p className="text-xs text-muted-foreground">Personal best</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Tests due soon</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="history">History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tests Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <StaggerContainer className="space-y-4">
            {filteredTests
              ?.filter((test) => {
                const hasAttempt = attempts?.some((a) => a.testId === test._id && a.status === "completed")
                return !hasAttempt && test.status === "available"
              })
              .map((test) => {
                // Since we don't have dueDate in the current schema, we'll create a mock one
                const mockDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                const isOverdue = false // Since it's a mock date

                return (
                  <FadeIn key={test._id}>
                    <Card
                      className={`transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isOverdue ? "destructive" : "secondary"}>
                              {isOverdue ? "Overdue" : "Available"}
                            </Badge>
                            <Badge variant="outline">{test.courseTitle}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Duration: {test.timeLimit} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Questions available</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Target className="h-4 w-4" />
                              <span>Passing: {test.passingScore}%</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Attempts: {test.attemptsUsed}/{test.maxAttempts || "∞"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {test.status}
                            </Badge>
                          </div>

                          <Button onClick={() => handleStartTest(test._id)} disabled={isOverdue}>
                            {isOverdue ? "Overdue" : "Start Test"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )
              })}
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <StaggerContainer className="space-y-4">
            {attempts
              ?.filter((attempt) => attempt.status === "completed")
              .map((attempt) => {
                const scoreColor =
                  attempt.percentage >= 80
                    ? "text-green-600"
                    : attempt.percentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600"

                return (
                  <FadeIn key={attempt._id}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{attempt.testTitle}</CardTitle>
                            <CardDescription>
                              Completed on {new Date(attempt.completedAt!).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Completed</Badge>
                            <Badge variant="outline">{attempt.subject}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${scoreColor}`}>{Math.round(attempt.percentage)}%</div>
                            <p className="text-sm text-muted-foreground">Final Score</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {Math.round(attempt.score)}/{attempt.totalPoints}
                            </div>
                            <p className="text-sm text-muted-foreground">Points Earned</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{Math.floor(attempt.timeSpent / 60)}m</div>
                            <p className="text-sm text-muted-foreground">Time Spent</p>
                          </div>
                        </div>

                        <Progress value={attempt.percentage} className="h-3" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {attempt.passed && (
                              <Badge variant="default" className="bg-green-600">
                                <Award className="h-3 w-3 mr-1" />
                                Passed
                              </Badge>
                            )}
                            {attempt.percentage >= 90 && (
                              <Badge variant="default" className="bg-yellow-600">
                                <Award className="h-3 w-3 mr-1" />
                                Excellent
                              </Badge>
                            )}
                          </div>

                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )
              })}
          </StaggerContainer>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <StaggerContainer className="space-y-4">
            {filteredTests
              ?.filter((test) => {
                const hasAttempt = attempts?.some((a) => a.testId === test._id && a.status === "completed")
                return test.status === "upcoming" && !hasAttempt
              })
              .map((test) => {
                // Mock upcoming date since it's not in the current schema
                const mockDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                const daysUntilDue = 7

                return (
                  <FadeIn key={test._id}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {daysUntilDue === 1 ? "Due Tomorrow" : `${daysUntilDue} days left`}
                            </Badge>
                            <Badge variant="outline">{test.courseTitle}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Duration: {test.timeLimit} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Questions available</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Target className="h-4 w-4" />
                              <span>Passing: {test.passingScore}%</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Due: {mockDueDate.toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {test.status}
                            </Badge>
                          </div>

                          <Button variant="outline">Set Reminder</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )
              })}
          </StaggerContainer>
        </TabsContent>
      </Tabs>

      {filteredTests?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tests found</h3>
            <p className="text-muted-foreground text-center">
              {selectedSubject !== "all"
                ? "Try adjusting your filters to see more tests."
                : "New tests will be available soon. Check back later!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
