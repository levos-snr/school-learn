"use client"

import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Play, Lock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

interface CourseNavProps {
  courseId: Id<"courses">
  currentLessonId?: Id<"lessons">
}

/**
 * Course navigation card showing progress, quick actions, and a short lesson list for a course.
 *
 * Fetches course details, sequential lessons, and enrollment status; renders a loading skeleton until
 * course and lessons are available. Once loaded, it displays progress (completed/total and a progress bar),
 * action buttons that depend on enrollment and next-lesson accessibility, and a quick list of up to five lessons
 * with status icons and an indicator for the current lesson.
 *
 * @param courseId - The course identifier to load and link to.
 * @param currentLessonId - Optional lesson id used to highlight the current lesson and compute the "next" lesson.
 * @returns A React element rendering the course navigation UI.
 */
export function CourseNav({ courseId, currentLessonId }: CourseNavProps) {
  const course = useQuery(api.courses.getCourseById, { courseId })
  const lessons = useQuery(api.lessons.getLessonsSequential, { courseId })
  const isEnrolled = useQuery(api.courses.isEnrolled, { courseId })

  if (!course || !lessons) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded" />
      </div>
    )
  }

  const completedLessons = lessons.filter((l) => l.isCompleted).length
  const totalLessons = lessons.length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const currentLessonIndex = currentLessonId ? lessons.findIndex((l) => l._id === currentLessonId) : -1

  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Course Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {course.title}
          </h3>
          <Badge variant="outline">
            {completedLessons}/{totalLessons}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% complete</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        {!isEnrolled ? (
          <Link href={`/courses/${courseId}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Course
            </Button>
          </Link>
        ) : (
          <>
            <Link href={`/courses/${courseId}/learn`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </Link>

            {nextLesson && nextLesson.canAccess && (
              <Link href={`/courses/${courseId}/learn?lesson=${nextLesson._id}`}>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </>
        )}
      </div>

      {/* Lesson Quick List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lessons</h4>
        {lessons.slice(0, 5).map((lesson, index) => (
          <div
            key={lesson._id}
            className={`flex items-center gap-2 p-2 rounded text-sm ${
              currentLessonId === lesson._id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex-shrink-0">
              {lesson.isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : lesson.canAccess ? (
                <Play className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="flex-1 truncate">
              {index + 1}. {lesson.title}
            </span>
          </div>
        ))}

        {lessons.length > 5 && (
          <Link href={`/courses/${courseId}/learn`}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all {lessons.length} lessons
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
