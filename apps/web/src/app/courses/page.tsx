"use client"

import { CourseCatalog } from "@/components/courses/course-catalog"

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Course Catalog</h1>
        <p className="text-gray-600">Discover and enroll in courses to advance your learning journey</p>
      </div>
      <CourseCatalog />
    </div>
  )
}

