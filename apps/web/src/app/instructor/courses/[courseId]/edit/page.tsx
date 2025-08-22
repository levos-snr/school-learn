"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../../../packages/backend/convex/_generated/api"
import type { Id } from "../../../../../../packages/backend/convex/_generated/dataModel"
import { ComprehensiveCourseCreator } from "../../../../../components/instructor/comprehensive-course-creator"
import { Loader2 } from "lucide-react"

/**
 * Page component that loads a course by route `courseId` and renders the editor.
 *
 * Reads `courseId` from the route params, fetches the course via the Convex query
 * `api.courses.getCourse`, and renders one of:
 * - a full-screen loading spinner while the query is unresolved (returns `undefined`),
 * - a full-screen "Course not found" message if the query resolves to a falsy value,
 * - the `ComprehensiveCourseCreator` with `initialCourse` set and `isEditing={true}` when the course is available.
 *
 * @returns The page's React element.
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
