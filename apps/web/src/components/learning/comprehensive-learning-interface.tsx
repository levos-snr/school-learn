"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "./video-player"
import { PDFViewer } from "./pdf-viewer"
import { Play, CheckCircle, Lock, FileText, Video, Download, Clock, BookOpen } from "lucide-react"
import { toast } from "sonner"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface ComprehensiveLearningInterfaceProps {
  courseId: Id<"courses">
  lessonId?: Id<"lessons">
}

export function ComprehensiveLearningInterface({ courseId, lessonId }: ComprehensiveLearningInterfaceProps) {
  const [activeTab, setActiveTab] = useState("content")
  const [currentLessonId, setCurrentLessonId] = useState<Id<"lessons"> | null>(lessonId || null)

  const course = useQuery(api.courses.getCourseById, { courseId })
  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId })
  const currentLesson = useQuery(api.lessons.getLessonById, currentLessonId ? { lessonId: currentLessonId } : "skip")
  const assignments = useQuery(api.assignments.getAssignmentsByCourse, { courseId })
  const discussions = useQuery(api.discussions.getCourseDiscussions, { courseId: courseId as any })
  const pastPapers = useQuery(api.pastPapers.getPastPapersByCourse, { courseId })

  const markCompleted = useMutation(api.lessons.markLessonCompleted)

  const handleLessonComplete = async () => {
    if (!currentLessonId) return

    try {
      await markCompleted({ lessonId: currentLessonId })
      toast.success("Lesson completed! Next lesson unlocked.")
    } catch (error) {
      toast.error("Failed to mark lesson as completed")
    }
  }

  const handleLessonSelect = (lessonId: Id<"lessons">, canAccess: boolean) => {
    if (!canAccess) {
      toast.error("Complete previous lessons to unlock this one")
      return
    }
    setCurrentLessonId(lessonId)
  }

  if (!course || !lessons) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Course Progress</CardTitle>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentLessonId === lesson._id
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

      <div className="lg:col-span-3">
        {currentLesson ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentLesson.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{currentLesson.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentLesson.duration}m
                  </Badge>
                  {currentLesson.isCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="past-papers">Past Papers</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  {currentLesson.videoUrl && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Video Lesson</h3>
                      <VideoPlayer
                        src={currentLesson.videoUrl}
                        title={currentLesson.title}
                        onComplete={handleLessonComplete}
                        className="w-full aspect-video"
                      />
                    </div>
                  )}

                  {currentLesson.content && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Lesson Content</h3>
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                      </div>
                    </div>
                  )}

                  {currentLesson.resources
                    ?.filter((r) => r.type === "pdf")
                    .map((resource, index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {resource.title}
                        </h3>
                        <PDFViewer src={resource.url} title={resource.title} className="w-full" />
                      </div>
                    ))}

                  {!currentLesson.isCompleted && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={handleLessonComplete} className="cursor-pointer">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assignments">
                  <div className="space-y-4">
                    {assignments?.map((assignment) => (
                      <Card key={assignment._id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <p className="text-muted-foreground">{assignment.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{assignment.type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                            <Button variant="outline" className="cursor-pointer bg-transparent">
                              View Assignment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="discussions">
                  <div className="space-y-4">
                    {discussions?.map((discussion) => (
                      <Card key={discussion._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{discussion.userName.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{discussion.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {discussion.type}
                                </Badge>
                              </div>
                              <h4 className="font-medium mb-1">{discussion.title}</h4>
                              <p className="text-sm text-muted-foreground">{discussion.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources">
                  <div className="space-y-4">
                    {currentLesson.resources?.map((resource, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                {resource.type === "pdf" ? (
                                  <FileText className="h-5 w-5 text-primary" />
                                ) : resource.type === "video" ? (
                                  <Video className="h-5 w-5 text-primary" />
                                ) : (
                                  <Download className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{resource.title}</h4>
                                <p className="text-sm text-muted-foreground capitalize">{resource.type} Resource</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="past-papers">
                  <div className="space-y-4">
                    {pastPapers?.map((paper) => (
                      <Card key={paper._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{paper.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {paper.year} • {paper.examType}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a lesson to start learning</h3>
              <p className="text-muted-foreground text-center">
                Choose a lesson from the sidebar to begin your learning journey.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
