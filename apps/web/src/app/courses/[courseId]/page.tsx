"use client"

import { use } from "react"
import { CourseDetail } from "@/components/courses/course-detail"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

export default function CoursePage({ params }: CoursePageProps) {
  const { courseId } = use(params)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CourseDetail courseId={courseId as Id<"courses">} />
    </div>
  )
}
