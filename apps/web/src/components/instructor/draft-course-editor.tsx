"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Trash2, GripVertical, Clock } from "lucide-react"
import { toast } from "sonner"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface DraftCourseEditorProps {
  courseId: string
  onClose: () => void
}

interface Lesson {
  _id?: string
  title: string
  description: string
  duration: number
  videoUrl?: string
  order: number
}

/**
 * Modal dialog UI for editing a draft course and its lessons.
 *
 * Renders a multi-tab dialog that loads course and lesson data, lets the user edit basic course info, manage
 * lesson list (add, edit, reorder, delete), configure settings, and toggle publish state. On save, it updates the
 * course and creates/updates/deletes lessons as needed (network mutations). Success and failure are surfaced via toasts.
 *
 * Props:
 * - `courseId`: id of the draft course to load and edit.
 * - `onClose`: callback invoked to close the dialog (also called after a successful save).
 *
 * @returns The DraftCourseEditor React element (dialog).
 */
export function DraftCourseEditor({ courseId, onClose }: DraftCourseEditorProps) {
  const course = useQuery(api.courses.getCourseById, { courseId: courseId as any })
  const lessons = useQuery(api.courses.getLessonsByCourse, { courseId: courseId as any })

  const updateCourse = useMutation(api.courses.updateCourse)
  const createLesson = useMutation(api.lessons.createLesson)
  const updateLesson = useMutation(api.lessons.updateLesson)
  const deleteLesson = useMutation(api.lessons.deleteLesson)

  const [courseData, setCourseData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    level: course?.level || ("beginner" as "beginner" | "intermediate" | "advanced"),
    price: course?.price || 0,
    duration: course?.duration || "",
    maxStudents: course?.maxStudents || 0,
    prerequisites: course?.prerequisites || "",
    learningObjectives: course?.learningObjectives || [""],
    isPublished: course?.isPublished || false,
    allowDiscussions: course?.allowDiscussions || true,
    certificateEnabled: course?.certificateEnabled || true,
  })

  const [localLessons, setLocalLessons] = useState<Lesson[]>([])

  // Update local state when course data loads
  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price || 0,
        duration: course.duration,
        maxStudents: course.maxStudents || 0,
        prerequisites: course.prerequisites || "",
        learningObjectives: course.learningObjectives || [""],
        isPublished: course.isPublished,
        allowDiscussions: course.allowDiscussions ?? true,
        certificateEnabled: course.certificateEnabled ?? true,
      })
    }
  }, [course])

  useEffect(() => {
    if (lessons) {
      setLocalLessons(
        lessons.map((lesson) => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          videoUrl: lesson.videoUrl,
          order: lesson.order,
        })),
      )
    }
  }, [lessons])

  const addLesson = () => {
    const newLesson: Lesson = {
      title: "",
      description: "",
      duration: 30,
      order: localLessons.length + 1,
    }
    setLocalLessons([...localLessons, newLesson])
  }

  const updateLocalLesson = (index: number, updates: Partial<Lesson>) => {
    const updated = [...localLessons]
    updated[index] = { ...updated[index], ...updates }
    setLocalLessons(updated)
  }

  const removeLesson = async (index: number) => {
    const lesson = localLessons[index]
    if (lesson._id) {
      try {
        await deleteLesson({ lessonId: lesson._id as any })
        toast.success("Lesson deleted successfully")
      } catch (error) {
        toast.error("Failed to delete lesson")
        return
      }
    }
    setLocalLessons(localLessons.filter((_, i) => i !== index))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(localLessons)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }))

    setLocalLessons(updatedLessons)
  }

  const handleSave = async () => {
    try {
      // Update course
      await updateCourse({
        courseId: courseId as any,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        maxStudents: courseData.maxStudents,
        prerequisites: courseData.prerequisites,
        learningObjectives: courseData.learningObjectives.filter((obj) => obj.trim()),
        isPublished: courseData.isPublished,
        allowDiscussions: courseData.allowDiscussions,
        certificateEnabled: courseData.certificateEnabled,
      })

      // Create or update lessons
      for (const lesson of localLessons) {
        if (lesson.title.trim()) {
          if (lesson._id) {
            await updateLesson({
              lessonId: lesson._id as any,
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl,
              order: lesson.order,
            })
          } else {
            await createLesson({
              courseId: courseId as any,
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl,
              order: lesson.order,
            })
          }
        }
      }

      toast.success("Course updated successfully!")
      onClose()
    } catch (error) {
      toast.error("Failed to update course")
      console.error(error)
    }
  }

  if (!course) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Edit Draft Course: {course.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Update basic course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={courseData.category}
                      onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value: any) => setCourseData({ ...courseData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={courseData.duration}
                      onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Students</Label>
                    <Input
                      type="number"
                      value={courseData.maxStudents}
                      onChange={(e) =>
                        setCourseData({ ...courseData, maxStudents: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Lessons</CardTitle>
                    <CardDescription>Add and organize lessons sequentially</CardDescription>
                  </div>
                  <Button onClick={addLesson} className="gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="lessons">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {localLessons.map((lesson, index) => (
                          <Draggable key={`lesson-${index}`} draggableId={`lesson-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-lg p-4 space-y-4"
                              >
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  </div>
                                  <Badge variant="outline">Lesson {lesson.order}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLesson(index)}
                                    className="ml-auto cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    placeholder="Lesson title"
                                    value={lesson.title}
                                    onChange={(e) => updateLocalLesson(index, { title: e.target.value })}
                                  />
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <Input
                                      type="number"
                                      placeholder="Duration (minutes)"
                                      value={lesson.duration}
                                      onChange={(e) =>
                                        updateLocalLesson(index, { duration: Number.parseInt(e.target.value) || 0 })
                                      }
                                    />
                                  </div>
                                </div>

                                <Textarea
                                  placeholder="Lesson description"
                                  value={lesson.description}
                                  onChange={(e) => updateLocalLesson(index, { description: e.target.value })}
                                  rows={2}
                                />

                                <Input
                                  placeholder="Video URL (optional)"
                                  value={lesson.videoUrl || ""}
                                  onChange={(e) => updateLocalLesson(index, { videoUrl: e.target.value })}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Configure course preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Discussions</Label>
                    <p className="text-sm text-muted-foreground">Enable student discussions</p>
                  </div>
                  <Switch
                    checked={courseData.allowDiscussions}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, allowDiscussions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Certificate Enabled</Label>
                    <p className="text-sm text-muted-foreground">Award certificates on completion</p>
                  </div>
                  <Switch
                    checked={courseData.certificateEnabled}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, certificateEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prerequisites</Label>
                  <Textarea
                    placeholder="List any prerequisites..."
                    value={courseData.prerequisites}
                    onChange={(e) => setCourseData({ ...courseData, prerequisites: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publish" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Publish Course</CardTitle>
                <CardDescription>Make your course available to students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publish Course</Label>
                    <p className="text-sm text-muted-foreground">Make course visible to students</p>
                  </div>
                  <Switch
                    checked={courseData.isPublished}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, isPublished: checked })}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Course Status</h4>
                  <Badge variant={courseData.isPublished ? "default" : "secondary"}>
                    {courseData.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {courseData.isPublished
                      ? "Your course is live and visible to students"
                      : "Your course is in draft mode and only visible to you"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="cursor-pointer">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
