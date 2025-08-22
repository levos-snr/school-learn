"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, GripVertical, Play, Lock, Video, FileText, Link } from "lucide-react"
import { toast } from "sonner"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { AdvancedLessonEditor } from "./advanced-lesson-editor"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface LessonManagementProps {
  courseId: Id<"courses">
}

/**
 * UI for managing a course's lessons: view, reorder (drag-and-drop), create, edit, and delete lessons.
 *
 * Displays lessons for the given course in sequential order and exposes controls to:
 * - reorder lessons via drag-and-drop (persists order)
 * - open the lesson editor to create or edit a lesson
 * - delete a lesson (with confirmation)
 * The component shows contextual badges (duration, resources, preview) and content-type icons.
 *
 * @param courseId - The course identifier whose lessons are managed (Id<"courses">).
 * @returns A React element containing the lesson management UI.
 */
export function LessonManagement({ courseId }: LessonManagementProps) {
  const [showLessonEditor, setShowLessonEditor] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<Id<"lessons"> | null>(null)

  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId })
  const deleteLesson = useMutation(api.lessons.deleteLesson)
  const reorderLessons = useMutation(api.lessons.reorderLessons)

  const handleDeleteLesson = async (lessonId: Id<"lessons">) => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return
    }

    try {
      await deleteLesson({ lessonId })
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

  const handleEditLesson = (lessonId: Id<"lessons">) => {
    setEditingLessonId(lessonId)
    setShowLessonEditor(true)
  }

  const handleCloseEditor = () => {
    setShowLessonEditor(false)
    setEditingLessonId(null)
  }

  const getContentTypeIcon = (lesson: any) => {
    if (lesson.videoUrl) return <Video className="h-4 w-4 text-blue-500" />
    if (lesson.pdfUrl) return <FileText className="h-4 w-4 text-red-500" />
    if (lesson.resources?.length > 0) return <Link className="h-4 w-4 text-green-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
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

        <Button onClick={() => setShowLessonEditor(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
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
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-base">{lesson.title}</CardTitle>
                                {getContentTypeIcon(lesson)}
                                {lesson.isPreview && (
                                  <Badge variant="secondary" className="text-xs">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-sm">{lesson.description}</CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {lesson.duration}m
                              </Badge>
                              {lesson.resources && lesson.resources.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {lesson.resources.length} resources
                                </Badge>
                              )}

                              <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson._id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="text-destructive hover:text-destructive"
                              >
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
            <Button onClick={() => setShowLessonEditor(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      )}

      {showLessonEditor && (
        <AdvancedLessonEditor
          courseId={courseId}
          lessonId={editingLessonId || undefined}
          onClose={handleCloseEditor}
          onSave={handleCloseEditor}
        />
      )}
    </div>
  )
}
