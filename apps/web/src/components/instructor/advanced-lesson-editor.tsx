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
import { Separator } from "@/components/ui/separator"
import { Play, FileText, Link, Plus, Trash2, Eye, Clock, BookOpen, Video, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface AdvancedLessonEditorProps {
  courseId: Id<"courses">
  lessonId?: Id<"lessons">
  onClose: () => void
  onSave?: () => void
}

interface LessonResource {
  title: string
  url: string
  type: "pdf" | "link" | "video" | "document"
}

/**
 * Dialog-based editor for creating or updating a lesson within a course.
 *
 * Renders a modal with tabs for Content, Media, Resources, and Settings. When a
 * `lessonId` is provided the component loads the existing lesson and populates
 * the form; otherwise it initializes an empty form for creating a new lesson.
 * On save it validates the title, filters resources to entries that have both
 * a title and a URL, and calls the appropriate API mutation (create or update).
 * Successful saves trigger `onSave` (if provided) and then `onClose`; failures
 * surface an error toast.
 *
 * @param courseId - Id of the course this lesson belongs to (required for create).
 * @param lessonId - Optional lesson id; when present the component edits that lesson.
 * @param onClose - Callback invoked to close the editor dialog.
 * @param onSave - Optional callback invoked after a successful create/update.
 * @returns The editor rendered as a Dialog (JSX.Element).
 */
export function AdvancedLessonEditor({ courseId, lessonId, onClose, onSave }: AdvancedLessonEditorProps) {
  const [activeTab, setActiveTab] = useState("content")

  const lesson = useQuery(api.lessons.getLessonById, lessonId ? { lessonId } : "skip")
  const createLesson = useMutation(api.lessons.createLesson)
  const updateLesson = useMutation(api.lessons.updateLesson)

  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    pdfUrl: "",
    duration: 30,
    order: 1,
    isPreview: false,
    resources: [] as LessonResource[],
  })

  useEffect(() => {
    if (lesson) {
      setLessonData({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        pdfUrl: lesson.pdfUrl || "",
        duration: lesson.duration,
        order: lesson.order,
        isPreview: lesson.isPreview,
        resources: lesson.resources || [],
      })
    }
  }, [lesson])

  const addResource = () => {
    setLessonData({
      ...lessonData,
      resources: [...lessonData.resources, { title: "", url: "", type: "link" }],
    })
  }

  const updateResource = (index: number, updates: Partial<LessonResource>) => {
    const updatedResources = [...lessonData.resources]
    updatedResources[index] = { ...updatedResources[index], ...updates }
    setLessonData({ ...lessonData, resources: updatedResources })
  }

  const removeResource = (index: number) => {
    setLessonData({
      ...lessonData,
      resources: lessonData.resources.filter((_, i) => i !== index),
    })
  }

  const handleSave = async () => {
    if (!lessonData.title.trim()) {
      toast.error("Please enter a lesson title")
      return
    }

    try {
      if (lessonId) {
        await updateLesson({
          lessonId,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl || undefined,
          pdfUrl: lessonData.pdfUrl || undefined,
          duration: lessonData.duration,
          order: lessonData.order,
          isPreview: lessonData.isPreview,
          resources: lessonData.resources.filter((r) => r.title && r.url),
        })
        toast.success("Lesson updated successfully!")
      } else {
        await createLesson({
          courseId,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl || undefined,
          pdfUrl: lessonData.pdfUrl || undefined,
          duration: lessonData.duration,
          order: lessonData.order,
          isPreview: lessonData.isPreview,
          resources: lessonData.resources.filter((r) => r.title && r.url),
        })
        toast.success("Lesson created successfully!")
      }

      onSave?.()
      onClose()
    } catch (error) {
      toast.error(lessonId ? "Failed to update lesson" : "Failed to create lesson")
      console.error(error)
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "link":
        return <Link className="h-4 w-4" />
      case "document":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {lessonId ? "Edit Lesson" : "Create New Lesson"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
                <CardDescription>Create engaging lesson content for your students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title *</Label>
                    <Input
                      id="title"
                      value={lessonData.title}
                      onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                      placeholder="Enter lesson title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={lessonData.duration}
                      onChange={(e) => setLessonData({ ...lessonData, duration: Number.parseInt(e.target.value) || 0 })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lessonData.description}
                    onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                    placeholder="Brief description of what students will learn"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Lesson Content</Label>
                  <Textarea
                    id="content"
                    value={lessonData.content}
                    onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
                    placeholder="Write your lesson content here. You can include text, instructions, explanations, etc."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: You can use HTML formatting for rich text content
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Content</CardTitle>
                <CardDescription>Add video and document resources to your lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={lessonData.videoUrl}
                      onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=... or direct video URL"
                    />
                    <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, or direct video file URLs</p>
                  </div>

                  {lessonData.videoUrl && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Video Preview</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lessonData.videoUrl}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="pdfUrl">PDF Document URL</Label>
                    <Input
                      id="pdfUrl"
                      value={lessonData.pdfUrl}
                      onChange={(e) => setLessonData({ ...lessonData, pdfUrl: e.target.value })}
                      placeholder="https://example.com/document.pdf"
                    />
                    <p className="text-xs text-muted-foreground">Direct link to a PDF document for reading material</p>
                  </div>

                  {lessonData.pdfUrl && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">PDF Document</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lessonData.pdfUrl}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Additional Resources</CardTitle>
                    <CardDescription>Add supplementary materials and links</CardDescription>
                  </div>
                  <Button onClick={addResource} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessonData.resources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No additional resources yet</p>
                    <p className="text-sm">Add links, documents, or other materials to support learning</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonData.resources.map((resource, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResource(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Resource Title</Label>
                            <Input
                              value={resource.title}
                              onChange={(e) => updateResource(index, { title: e.target.value })}
                              placeholder="Resource name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Resource Type</Label>
                            <Select
                              value={resource.type}
                              onValueChange={(value: any) => updateResource(index, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Web Link</SelectItem>
                                <SelectItem value="pdf">PDF Document</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={resource.url}
                            onChange={(e) => updateResource(index, { url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
                <CardDescription>Configure lesson access and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="order">Lesson Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={lessonData.order}
                      onChange={(e) => setLessonData({ ...lessonData, order: Number.parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground">Position in the course sequence</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Preview Lesson</Label>
                        <p className="text-xs text-muted-foreground">Allow non-enrolled students to preview</p>
                      </div>
                      <Switch
                        checked={lessonData.isPreview}
                        onCheckedChange={(checked) => setLessonData({ ...lessonData, isPreview: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Lesson Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {lessonData.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Preview: {lessonData.isPreview ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span>Video: {lessonData.videoUrl ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Resources: {lessonData.resources.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{lessonId ? "Update Lesson" : "Create Lesson"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
