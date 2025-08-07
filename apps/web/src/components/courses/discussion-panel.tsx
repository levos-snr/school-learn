"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Pin, Send } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface DiscussionPanelProps {
  courseId: Id<"courses">
  lessonId?: string
}

export function DiscussionPanel({ courseId, lessonId }: DiscussionPanelProps) {
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    type: "discussion" as "question" | "discussion" | "announcement",
  })
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)

  const discussions = useQuery(api.discussions.getCourseDiscussions, {
    courseId,
    lessonId,
  })
  const createDiscussion = useMutation(api.discussions.createDiscussion)
  const replyToDiscussion = useMutation(api.discussions.replyToDiscussion)

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await createDiscussion({
        courseId,
        lessonId,
        title: newDiscussion.title,
        content: newDiscussion.content,
        type: newDiscussion.type,
      })
      setNewDiscussion({ title: "", content: "", type: "discussion" })
      setShowNewDiscussion(false)
      toast.success("Discussion created successfully!")
    } catch (error) {
      toast.error("Failed to create discussion")
      console.error(error)
    }
  }

  const handleReply = async (discussionId: Id<"discussions">) => {
    const content = replyContent[discussionId]
    if (!content?.trim()) {
      toast.error("Please enter a reply")
      return
    }

    try {
      await replyToDiscussion({ discussionId, content })
      setReplyContent({ ...replyContent, [discussionId]: "" })
      toast.success("Reply posted successfully!")
    } catch (error) {
      toast.error("Failed to post reply")
      console.error(error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "question":
        return "bg-blue-100 text-blue-800"
      case "announcement":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (discussions === undefined) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Discussion Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{lessonId ? "Lesson Discussions" : "Course Discussions"}</h3>
        <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Discussion title"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              />
              <Select
                value={newDiscussion.type}
                onValueChange={(value: "question" | "discussion" | "announcement") =>
                  setNewDiscussion({ ...newDiscussion, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="What would you like to discuss?"
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              rows={4}
            />
            <div className="flex space-x-2">
              <Button onClick={handleCreateDiscussion}>Post Discussion</Button>
              <Button variant="outline" onClick={() => setShowNewDiscussion(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions?.map((discussion) => (
          <Card key={discussion._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getTypeColor(discussion.type)}>{discussion.type}</Badge>
                    {discussion.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <CardTitle className="text-lg">{discussion.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={discussion.userImage || "/placeholder.svg"} />
                      <AvatarFallback>{discussion.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{discussion.userName}</span>
                    <span className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline">{discussion.replyCount} replies</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{discussion.content}</p>

              {/* Replies */}
              {discussion.replies && discussion.replies.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  {discussion.replies.map((reply) => (
                    <div key={reply._id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.userImage || "/placeholder.svg"} />
                        <AvatarFallback>{reply.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{reply.userName}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="flex space-x-2 border-t pt-4">
                <Input
                  placeholder="Write a reply..."
                  value={replyContent[discussion._id] || ""}
                  onChange={(e) =>
                    setReplyContent({
                      ...replyContent,
                      [discussion._id]: e.target.value,
                    })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleReply(discussion._id)
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleReply(discussion._id)}
                  disabled={!replyContent[discussion._id]?.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {discussions?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
              <p className="text-gray-500">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

