"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle, Download, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DiscussionPanel } from "./discussion-panel"
import { AssignmentPanel } from "./assignment-panel"

interface LessonViewerProps {
  courseId: Id<"courses">
  lessonId: string
}

export function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("content")

  const course = useQuery(api.courses.getCourseById, { courseId })
  const updateProgress = useMutation(api.courses.updateProgress)

  const currentLesson = course?.modules?.find((m) => m.id === lessonId)
  const currentIndex = course?.modules?.findIndex((m) => m.id === lessonId) ?? -1
  const nextLesson = course?.modules?.[currentIndex + 1]
  const prevLesson = course?.modules?.[currentIndex - 1]

  const handleCompleteLesson = async () => {
    if (!currentLesson) return

    try {
      await updateProgress({ courseId, moduleId: lessonId })
      toast.success("Lesson completed!")
    } catch (error) {
      toast.error("Failed to update progress")
      console.error(error)
    }
  }

  const navigateToLesson = (moduleId: string) => {
    router.push(`/courses/${courseId}/lessons/${moduleId}`)
  }

  if (course === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Lesson not found</h2>
        <p className="text-gray-500 mt-2">The lesson you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentLesson.title}</h1>
          <p className="text-gray-600 mt-1">{course.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{currentLesson.type}</Badge>
          {currentLesson.duration && <Badge variant="outline">{currentLesson.duration} min</Badge>}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {course.modules?.length || 0} lessons
            </span>
          </div>
          <Progress value={((currentIndex + 1) / (course.modules?.length || 1)) * 100} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentLesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{currentLesson.description}</p>

                  {/* Video Content */}
                  {currentLesson.type === "video" && currentLesson.content && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full"
                        src={currentLesson.content}
                        poster="/placeholder.svg?height=400&width=600"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* Text Content */}
                  {currentLesson.type === "text" && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    </div>
                  )}

                  {/* PDF Content */}
                  {currentLesson.type === "pdf" && (
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-4">PDF Document</p>
                      <Button asChild>
                        <a href={currentLesson.content} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentLesson.resources && currentLesson.resources.length > 0 ? (
                    <div className="space-y-3">
                      {currentLesson.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No resources available for this lesson.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions">
              <DiscussionPanel courseId={courseId} lessonId={lessonId} />
            </TabsContent>

            <TabsContent value="assignments">
              <AssignmentPanel courseId={courseId} lessonId={lessonId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleCompleteLesson} className="w-full" variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>

              <div className="flex space-x-2">
                <Button
                  onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
                  disabled={!prevLesson}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                  disabled={!nextLesson}
                  variant="outline"
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course Outline */}
          <Card>
            <CardHeader>
              <CardTitle>Course Outline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.modules?.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => navigateToLesson(module.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      module.id === lessonId ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {index + 1}. {module.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {module.type} • {module.duration || 0} min
                        </p>
                      </div>
                      {module.id === lessonId && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

