"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import  ComprehensiveCourseCreator  from "@/components/admin/comprehensive-course-creator"
import { Loader2 } from "lucide-react"

export default function EditCoursePage() {
  const params = useParams()
  const courseId = params.courseId as Id<"courses">

  const course = useQuery(api.courses.getCourse, { courseId })

  if (course === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Course not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <ComprehensiveCourseCreator initialCourse={course} isEditing={true} />
    </div>
  )
}
