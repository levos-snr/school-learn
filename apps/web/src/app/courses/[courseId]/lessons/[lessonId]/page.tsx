"use client"

import { use } from "react"
import { LessonViewer } from "@/components/courses/lesson-viewer"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface LessonPageProps {
  params: Promise<{
    courseId: string
    lessonId: string
  }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = use(params)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <LessonViewer 
        courseId={courseId as Id<"courses">} 
        lessonId={lessonId as Id<"lessons">} 
      />
    </div>
  )
}
