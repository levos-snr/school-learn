"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle, Download, FileText, Video, Play, Pause } from 'lucide-react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { VideoPlayer } from "@/components/learning/video-player"
import { PDFViewer } from "@/components/learning/pdf-viewer"
import { DiscussionPanel } from "./discussion-panel"
import { AssignmentPanel } from "./assignment-panel"

interface LessonViewerProps {
  courseId: Id<"courses">
  lessonId: Id<"lessons">
}

export function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("content")
  const [watchTime, setWatchTime] = useState(0)

  const course = useQuery(api.courses.getCourseById, { courseId })
  const lesson = useQuery(api.lessons.getLessonById, { lessonId })
  const lessons = useQuery(api.lessons.getLessonsByCourse, { courseId })
  const nextLesson = useQuery(api.lessons.getNextLesson, { 
    courseId, 
    currentOrder: lesson?.order || 0 
  })
  const previousLesson = useQuery(api.lessons.getPreviousLesson, { 
    courseId, 
    currentOrder: lesson?.order || 0 
  })
  
  const updateProgress = useMutation(api.lessons.updateLessonProgress)

  const currentIndex = lessons?.findIndex((l) => l._id === lessonId) ?? -1
  const totalLessons = lessons?.length || 0

  const handleCompleteLesson = async () => {
    if (!lesson) return

    try {
      await updateProgress({
        lessonId,
        watchTime,
        isCompleted: true,
        completedAt: Date.now(),
      })
      toast.success("Lesson completed! +25 XP")
    } catch (error) {
      toast.error("Failed to update progress")
      console.error(error)
    }
  }

  const handleVideoProgress = (currentTime: number, duration: number) => {
    setWatchTime(Math.floor(currentTime))
    
    // Auto-update progress every 30 seconds
    if (currentTime > 0 && currentTime % 30 === 0) {
      updateProgress({
        lessonId,
        watchTime: Math.floor(currentTime),
        isCompleted: false,
      }).catch(console.error)
    }
  }

  const handleVideoComplete = () => {
    handleCompleteLesson()
  }

  const navigateToLesson = (targetLessonId: Id<"lessons">) => {
    router.push(`/courses/${courseId}/lessons/${targetLessonId}`)
  }

  if (course === undefined || lesson === undefined || lessons === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!course || !lesson) {
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
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-gray-600 mt-1">{course.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {lesson.videoUrl ? "Video" : lesson.pdfUrl ? "PDF" : "Text"}
          </Badge>
          <Badge variant="outline">{lesson.duration} min</Badge>
          {lesson.userProgress?.isCompleted && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {totalLessons} lessons
            </span>
          </div>
          <Progress value={((currentIndex + 1) / totalLessons) * 100} />
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
                  <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{lesson.description}</p>

                  {/* Video Content */}
                  {lesson.videoUrl && (
                    <div className="aspect-video">
                      <VideoPlayer
                        src={lesson.videoUrl}
                        title={lesson.title}
                        onProgress={handleVideoProgress}
                        onComplete={handleVideoComplete}
                        initialTime={lesson.userProgress?.watchTime || 0}
                      />
                    </div>
                  )}

                  {/* PDF Content */}
                  {lesson.pdfUrl && !lesson.videoUrl && (
                    <PDFViewer
                      src={lesson.pdfUrl}
                      title={lesson.title}
                      onProgress={(page, total) => {
                        const progressTime = Math.floor((page / total) * lesson.duration * 60)
                        setWatchTime(progressTime)
                      }}
                    />
                  )}

                  {/* Text Content */}
                  {lesson.content && !lesson.videoUrl && !lesson.pdfUrl && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </div>
                  )}

                  {/* No Content Available */}
                  {!lesson.videoUrl && !lesson.pdfUrl && !lesson.content && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Content for this lesson is being prepared.</p>
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
                  {lesson.resources && lesson.resources.length > 0 ? (
                    <div className="space-y-3">
                      {lesson.resources.map((resource, index) => (
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
              {!lesson.userProgress?.isCompleted && (
                <Button onClick={handleCompleteLesson} className="w-full" variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => previousLesson && navigateToLesson(previousLesson._id)}
                  disabled={!previousLesson}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={() => nextLesson && navigateToLesson(nextLesson._id)}
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons?.map((lessonItem, index) => {
                  const isCurrentLesson = lessonItem._id === lessonId
                  const isCompleted = lessonItem.userProgress?.isCompleted || false
                  
                  return (
                    <button
                      key={lessonItem._id}
                      onClick={() => navigateToLesson(lessonItem._id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isCurrentLesson 
                          ? "bg-blue-50 border-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {index + 1}. {lessonItem.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {lessonItem.videoUrl && <Video className="h-3 w-3 text-blue-500" />}
                            {lessonItem.pdfUrl && <FileText className="h-3 w-3 text-red-500" />}
                            <span className="text-xs text-gray-500">{lessonItem.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {isCurrentLesson && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
