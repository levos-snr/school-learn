"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ComprehensiveLearningInterface } from "./comprehensive-learning-interface"
import { SequentialLessonViewer } from "./sequential-lesson-viewer"
import { CourseNav } from "@/components/navigation/course-nav"
import { BookOpen, Play, Users, Clock, Award, Eye, Grid, List } from "lucide-react"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface EnhancedLearningHubProps {
  courseId: Id<"courses">
  initialLessonId?: Id<"lessons">
  viewMode?: "comprehensive" | "sequential" | "overview"
}

export function EnhancedLearningHub({
  courseId,
  initialLessonId,
  viewMode = "comprehensive",
}: EnhancedLearningHubProps) {
  const [currentViewMode, setCurrentViewMode] = useState(viewMode)
  const [selectedLessonId, setSelectedLessonId] = useState<Id<"lessons"> | undefined>(initialLessonId)

  const course = useQuery(api.courses.getCourseById, { courseId })
  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId })
  const isEnrolled = useQuery(api.courses.isEnrolled, { courseId })
  const user = useQuery(api.users.current)

  if (!course || !lessons || isEnrolled === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  const completedLessons = lessons.filter((l) => l.isCompleted).length
  const totalLessons = lessons.length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const renderLearningInterface = () => {
    switch (currentViewMode) {
      case "comprehensive":
        return <ComprehensiveLearningInterface courseId={courseId} lessonId={selectedLessonId} />
      case "sequential":
        return <SequentialLessonViewer courseId={courseId} currentLessonId={selectedLessonId} />
      case "overview":
      default:
        return (
          <div className="space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">0 students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Certificate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Course Completion</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {completedLessons} of {totalLessons} lessons completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lessons Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>Click on any lesson to start learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {lessons.map((lesson, index) => (
                    <Card
                      key={lesson._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !lesson.canAccess ? "opacity-50" : ""
                      }`}
                      onClick={() => {
                        if (lesson.canAccess) {
                          setSelectedLessonId(lesson._id)
                          setCurrentViewMode("comprehensive")
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {lesson.isCompleted ? (
                                <Award className="h-4 w-4 text-green-500" />
                              ) : lesson.canAccess ? (
                                <Play className="h-4 w-4 text-primary" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Lesson {index + 1}: {lesson.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {lesson.duration}m
                            </Badge>
                            {lesson.isCompleted && (
                              <Badge variant="default" className="bg-green-500 text-xs">
                                Completed
                              </Badge>
                            )}
                            {lesson.isPreview && (
                              <Badge variant="secondary" className="text-xs">
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Learning Mode Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Interface
              </CardTitle>
              <CardDescription>Choose your preferred learning experience</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={currentViewMode === "overview" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentViewMode("overview")}
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={currentViewMode === "sequential" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentViewMode("sequential")}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Sequential
              </Button>
              <Button
                variant={currentViewMode === "comprehensive" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentViewMode("comprehensive")}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Comprehensive
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Navigation Sidebar */}
      {(currentViewMode === "comprehensive" || currentViewMode === "sequential") && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CourseNav courseId={courseId} currentLessonId={selectedLessonId} />
          </div>
          <div className="lg:col-span-3">{renderLearningInterface()}</div>
        </div>
      )}

      {/* Full Width for Overview Mode */}
      {currentViewMode === "overview" && renderLearningInterface()}
    </div>
  )
}
