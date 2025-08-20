"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Lock, Play, BookOpen, Clock, Users, MessageSquare, Award, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface SequentialCourseViewerProps {
  courseId: Id<"courses">
}

export function SequentialCourseViewer({ courseId }: SequentialCourseViewerProps) {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  const course = useQuery(api.courses.getCourseById, { courseId })
  const lessons = useQuery(api.lessons.getLessonsByCourse, { courseId })
  const enrollment = useQuery(api.courses.isEnrolled, { courseId })
  const updateProgress = useMutation(api.courses.updateProgress)

  const completedLessons = enrollment ? [] : [] // This would come from enrollment data

  const canAccessLesson = (lessonOrder: number) => {
    if (lessonOrder === 1) return true // First lesson always accessible
    return completedLessons.includes(lessonOrder - 1) // Can access if previous lesson completed
  }

  const handleCompleteLesson = async (lessonId: Id<"lessons">) => {
    if (!enrollment) {
      toast.error("Please enroll in the course first")
      return
    }

    try {
      await updateProgress({ courseId, lessonId })
      toast.success("Lesson completed!")
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  if (!course || !lessons) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  const sortedLessons = lessons.sort((a, b) => a.order - b.order)
  const totalLessons = sortedLessons.length
  const completedCount = completedLessons.length
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="mt-2">{course.description}</CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {course.price === 0 ? "Free" : `KES ${course.price}`}
              </div>
              {enrollment && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Progress: {completedCount}/{totalLessons} lessons
                  </div>
                  <Progress value={progressPercentage} className="w-32" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-4">
              {sortedLessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.order)
                const canAccess = canAccessLesson(lesson.order)
                const isActive = activeLesson === lesson._id

                return (
                  <Card
                    key={lesson._id}
                    className={cn(
                      "cursor-pointer transition-all",
                      isActive && "ring-2 ring-blue-500",
                      !canAccess && "opacity-50",
                    )}
                    onClick={() => canAccess && setActiveLesson(lesson._id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : canAccess ? (
                              <Play className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Lesson {lesson.order}: {lesson.title}
                            </CardTitle>
                            <CardDescription>{lesson.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.duration}min
                          </Badge>
                          {lesson.isPreview && <Badge variant="secondary">Preview</Badge>}
                        </div>
                      </div>
                    </CardHeader>

                    {isActive && (
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="prose max-w-none">
                            <p>{lesson.content}</p>
                          </div>

                          {lesson.videoUrl && (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Video content would load here</p>
                                <p className="text-xs text-gray-500">{lesson.videoUrl}</p>
                              </div>
                            </div>
                          )}

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Resources</h4>
                              <div className="space-y-2">
                                {lesson.resources.map((resource, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">{resource.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {canAccess && !isCompleted && (
                            <div className="flex justify-end">
                              <Button onClick={() => handleCompleteLesson(lesson._id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Complete
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="assignments">
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assignments</h3>
                  <p className="text-gray-500">Course assignments will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions">
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discussions</h3>
                  <p className="text-gray-500">Course discussions will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resources</h3>
                  <p className="text-gray-500">Additional course resources will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Progress */}
          {enrollment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} />
                  </div>
                  <div className="text-sm text-gray-600">
                    {completedCount} of {totalLessons} lessons completed
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-600" />
                <span>Instructor: {course.instructorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span>Duration: {course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-gray-600" />
                <span>Certificate Available</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Download Resources
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Award className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
