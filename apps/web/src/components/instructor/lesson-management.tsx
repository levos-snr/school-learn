"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, GripVertical, Play, Lock } from "lucide-react"
import { toast } from "sonner"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface LessonManagementProps {
  courseId: string
}

export function LessonManagement({ courseId }: LessonManagementProps) {
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    type: "video" as "video" | "text" | "quiz",
    duration: 0,
  })

  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId: courseId as any })
  const createLesson = useMutation(api.lessons.createLesson)
  const updateLesson = useMutation(api.lessons.updateLesson)
  const deleteLesson = useMutation(api.lessons.deleteLesson)
  const reorderLessons = useMutation(api.lessons.reorderLessons)

  const handleCreateLesson = async () => {
    try {
      await createLesson({
        courseId: courseId as any,
        title: newLesson.title,
        description: newLesson.description,
        content: newLesson.content,
        type: newLesson.type,
        duration: newLesson.duration,
        order: (lessons?.length || 0) + 1, // Add at the end
      })

      setNewLesson({ title: "", description: "", content: "", type: "video", duration: 0 })
      setIsAddingLesson(false)
      toast.success("Lesson created successfully!")
    } catch (error) {
      toast.error("Failed to create lesson")
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson({ lessonId: lessonId as any })
      toast.success("Lesson deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete lesson")
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !lessons) return

    const items = Array.from(lessons)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order for all lessons
    const updates = items.map((lesson, index) => ({
      lessonId: lesson._id,
      order: index + 1,
    }))

    try {
      await reorderLessons({ updates })
      toast.success("Lessons reordered successfully!")
    } catch (error) {
      toast.error("Failed to reorder lessons")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Lessons</h3>
          <p className="text-sm text-muted-foreground">
            Manage your course lessons in sequential order. Students will access lessons one by one.
          </p>
        </div>

        <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Enter lesson description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Lesson Type</Label>
                  <Select
                    value={newLesson.type}
                    onValueChange={(value: any) => setNewLesson({ ...newLesson, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text/Reading</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({ ...newLesson, duration: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  placeholder="Enter lesson content, video URL, or quiz questions"
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLesson}>Create Lesson</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lessons && lessons.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {lessons.map((lesson, index) => (
                  <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "shadow-lg" : ""}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              {index === 0 ? (
                                <Play className="h-4 w-4 text-green-500" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex-1">
                              <CardTitle className="text-base">{lesson.title}</CardTitle>
                              <CardDescription className="text-sm">{lesson.description}</CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {lesson.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {lesson.duration}m
                              </Badge>

                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your course by adding your first lesson.
            </p>
            <Button onClick={() => setIsAddingLesson(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

