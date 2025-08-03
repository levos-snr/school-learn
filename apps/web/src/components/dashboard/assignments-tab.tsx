"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Calendar, Clock, FileText, Trophy, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function AssignmentsTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const assignments = useQuery(api.assignments.list)
  const submissions = useQuery(api.assignments.getUserSubmissions)
  const submitAssignment = useMutation(api.assignments.submit)

  const handleSubmitAssignment = async (assignmentId: string) => {
    try {
      // Mock answers for demo - in real app, this would come from a form
      const mockAnswers = [
        { questionId: "1", answer: "A", isCorrect: true, pointsEarned: 10 },
        { questionId: "2", answer: "B", isCorrect: false, pointsEarned: 0 },
      ]

      await submitAssignment({
        assignmentId: assignmentId as any,
        answers: mockAnswers,
        timeSpent: 1800, // 30 minutes
      })

      toast.success("Assignment submitted successfully! +50 XP")
    } catch (error) {
      toast.error("Failed to submit assignment")
    }
  }

  const filteredAssignments = assignments?.filter((assignment) => {
    const matchesSubject = selectedSubject === "all" || assignment.subject === selectedSubject
    const submission = submissions?.find((s) => s.assignmentId === assignment._id)
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "completed" && submission) ||
      (selectedStatus === "pending" && !submission)

    return matchesSubject && matchesStatus
  })

  const completedCount = submissions?.length || 0
  const totalCount = assignments?.length || 0
  const averageScore = submissions?.length
    ? submissions.reduce((acc, sub) => acc + (sub.score / sub.totalPoints) * 100, 0) / submissions.length
    : 0

  if (!assignments) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
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
      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCount}/{totalCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
              <p className="text-xs text-muted-foreground">Across {submissions?.length || 0} submissions</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">New assignments due</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="History">History</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
      <StaggerContainer className="space-y-4">
        {filteredAssignments?.map((assignment) => {
          const submission = submissions?.find((s) => s.assignmentId === assignment._id)
          const isCompleted = !!submission
          const dueDate = new Date(assignment.dueDate)
          const isOverdue = dueDate < new Date() && !isCompleted

          return (
            <FadeIn key={assignment._id}>
              <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isCompleted ? "default" : isOverdue ? "destructive" : "secondary"}>
                        {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                      </Badge>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due: {dueDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {assignment.totalQuestions} questions • {assignment.estimatedTime}
                        </span>
                      </div>
                    </div>

                    {isCompleted && submission && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Score:</span>
                          <span className="font-medium">
                            {submission.score}/{submission.totalPoints} (
                            {Math.round((submission.score / submission.totalPoints) * 100)}%)
                          </span>
                        </div>
                        <Progress value={(submission.score / submission.totalPoints) * 100} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {assignment.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {assignment.type}
                      </Badge>
                    </div>

                    {!isCompleted && (
                      <Button onClick={() => handleSubmitAssignment(assignment._id)} disabled={isOverdue}>
                        {isOverdue ? "Overdue" : "Start Assignment"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </StaggerContainer>

      {filteredAssignments?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No assignments found</h3>
            <p className="text-muted-foreground text-center">
              {selectedSubject !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters to see more assignments."
                : "You're all caught up! New assignments will appear here."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

