"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import  ComprehensiveCourseCreator  from "@/components/admin/comprehensive-course-creator"
import { Loader2 } from "lucide-react"

/**
 * Page component for editing a course in the admin UI.
 *
 * Reads `courseId` from the route params, fetches the course via the Convex query,
 * and renders one of three states:
 * - loading spinner while the query is pending,
 * - "Course not found" if no course exists for the id,
 * - the `ComprehensiveCourseCreator` initialized with the fetched course in editing mode.
 *
 * @returns The JSX element for the edit course page.
 */
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
