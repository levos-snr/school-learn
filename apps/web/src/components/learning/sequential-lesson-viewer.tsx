"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Lock, Play, Clock, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface SequentialLessonViewerProps {
  courseId: string
  currentLessonId?: string
}

export function SequentialLessonViewer({ courseId, currentLessonId }: SequentialLessonViewerProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(currentLessonId || null)

  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId: courseId as Id<"courses"> })
  
  const selectedLesson = useQuery(
    api.lessons.getLessonById,
    selectedLessonId ? { lessonId: selectedLessonId as any } : "skip",
  )
  const markCompleted = useMutation(api.lessons.markLessonCompleted)

  const handleLessonSelect = (lessonId: string, canAccess: boolean) => {
    if (!canAccess) {
      toast.error("Complete previous lessons to unlock this one")
      return
    }
    setSelectedLessonId(lessonId)
  }

  const handleMarkCompleted = async () => {
    if (!selectedLessonId) return

    try {
      await markCompleted({ lessonId: selectedLessonId as any })
      toast.success("Lesson completed! Next lesson unlocked.")
    } catch (error) {
      toast.error("Failed to mark lesson as completed")
    }
  }

  const getNextAccessibleLesson = () => {
    if (!lessons) return null
    const currentIndex = lessons.findIndex((l) => l._id === selectedLessonId)
    if (currentIndex === -1) return null

    for (let i = currentIndex + 1; i < lessons.length; i++) {
      if (lessons[i].canAccess) {
        return lessons[i]
      }
    }
    return null
  }

  const getPreviousLesson = () => {
    if (!lessons) return null
    const currentIndex = lessons.findIndex((l) => l._id === selectedLessonId)
    if (currentIndex <= 0) return null
    return lessons[currentIndex - 1]
  }

  const completedLessons = lessons?.filter((l) => l.isCompleted).length || 0
  const totalLessons = lessons?.length || 0
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lesson List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Progress</CardTitle>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {lessons?.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedLessonId === lesson._id
                    ? "border-primary bg-primary/5"
                    : lesson.canAccess
                      ? "border-border hover:border-primary/50"
                      : "border-muted bg-muted/30"
                }`}
                onClick={() => handleLessonSelect(lesson._id, lesson.canAccess)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {lesson.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : lesson.canAccess ? (
                      <Play className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}m
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-medium truncate ${
                        lesson.canAccess ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {lesson.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lesson Content */}
      <div className="lg:col-span-2">
        {selectedLesson ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedLesson.title}</CardTitle>
                  <CardDescription>{selectedLesson.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedLesson.duration}m
                  </Badge>
                  {selectedLesson.isCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Player */}
              {selectedLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    poster="/video-thumbnail.png"
                  />
                </div>
              )}

              {/* Lesson Content */}
              {selectedLesson.content && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </div>
              )}

              {/* Resources */}
              {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <div className="space-y-2">
                    {selectedLesson.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 transition-colors"
                      >
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-sm">{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation and Completion */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const prev = getPreviousLesson()
                    if (prev) setSelectedLessonId(prev._id)
                  }}
                  disabled={!getPreviousLesson()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {!selectedLesson.isCompleted && (
                    <Button onClick={handleMarkCompleted}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      const next = getNextAccessibleLesson()
                      if (next) setSelectedLessonId(next._id)
                    }}
                    disabled={!getNextAccessibleLesson()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a lesson to start learning</h3>
              <p className="text-muted-foreground text-center">
                Choose a lesson from the list to begin your learning journey.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
