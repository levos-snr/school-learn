"use client"

import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { EnhancedLearningHub } from "@/components/learning/enhanced-learning-hub"
import { toast } from "sonner"

export default function CourseLearnPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = params.courseId as string

  const lessonId = searchParams.get("lesson")
  const viewMode = (searchParams.get("view") as "comprehensive" | "sequential" | "overview") || "comprehensive"

  const course = useQuery(api.courses.getCourseById, { courseId: courseId as any })
  const isEnrolled = useQuery(api.courses.isEnrolled, { courseId: courseId as any })
  const user = useQuery(api.users.current)

  if (isEnrolled === false) {
    toast.error("Please enroll in this course first")
    router.push(`/courses/${courseId}`)
    return null
  }

  if (!course || isEnrolled === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
                className="cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">{course.title}</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="cursor-pointer">
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <EnhancedLearningHub courseId={courseId as any} initialLessonId={lessonId as any} viewMode={viewMode} />
      </div>
    </div>
  )
}
