"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LessonManagement } from "@/components/instructor/lesson-management"
import { useRouter } from "next/navigation"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

export default function InstructorLessonsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const user = useQuery(api.users.current)
  const myCourses = useQuery(
    api.courses.getCoursesByInstructor,
    user ? { instructorId: user._id } : undefined
  )

  if (user === undefined || myCourses === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (user?.role !== "instructor" && user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
       <p className="text-muted-foreground mt-2">You need instructor privileges to access this page.</p>
      </div>
    )
  }

  const filteredCourses =
    myCourses?.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/instructor")} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Instructor Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Lesson Management</h1>
            <p className="text-muted-foreground">Create and manage lessons for your courses</p>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Course
          </CardTitle>
          <CardDescription>Choose a course to manage its lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCourseId === course._id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCourseId(course._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="text-sm">{course.category}</CardDescription>
                    </div>
                    <Badge variant={course.isPublished ? "default" : "secondary"} className="text-xs">
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.totalLessons || 0} lessons</span>
                    <span>{course.level}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found</p>
              <p className="text-sm">Create a course first to manage lessons</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Management */}
      {selectedCourseId && <LessonManagement courseId={selectedCourseId} />}
    </div>
  )
}
