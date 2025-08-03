"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { BookOpen, Clock, Play, Star, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function CoursesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedForm, setSelectedForm] = useState<string>("all")

  const courses = useQuery(api.courses.list)
  const enrollments = useQuery(api.courses.getUserEnrollments)
  const enrollInCourse = useMutation(api.courses.enroll)
  const updateProgress = useMutation(api.courses.updateProgress)

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse({ courseId: courseId as any })
      toast.success("Successfully enrolled in course! +100 XP")
    } catch (error) {
      toast.error("Failed to enroll in course")
    }
  }

  const handleContinueLearning = async (courseId: string, currentProgress: number) => {
    try {
      const newProgress = Math.min(currentProgress + 10, 100)
      await updateProgress({
        courseId: courseId as any,
        progress: newProgress,
        completedLessons: Math.floor(newProgress / 10),
      })
      toast.success(`Progress updated! +25 XP`)
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  const filteredCourses = courses?.filter((course) => {
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesForm = selectedForm === "all" || course.form === selectedForm
    return matchesCategory && matchesForm
  })

  const enrolledCourses = enrollments?.length || 0
  const completedCourses = enrollments?.filter((e) => e.progress === 100).length || 0
  const averageProgress = enrollments?.length
    ? enrollments.reduce((acc, enrollment) => acc + enrollment.progress, 0) / enrollments.length
    : 0

  if (!courses) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses}</div>
              <p className="text-xs text-muted-foreground">{completedCourses} completed</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
              <Progress value={averageProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Across all subjects</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Languages">Languages</SelectItem>
            <SelectItem value="Humanities">Humanities</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedForm} onValueChange={setSelectedForm}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="Form 1">Form 1</SelectItem>
            <SelectItem value="Form 2">Form 2</SelectItem>
            <SelectItem value="Form 3">Form 3</SelectItem>
            <SelectItem value="Form 4">Form 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses?.map((course) => {
          const enrollment = enrollments?.find((e) => e.courseId === course._id)
          const isEnrolled = !!enrollment

          return (
            <FadeIn key={course._id}>
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Badge variant="secondary" className="mb-2">
                      {course.category}
                    </Badge>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm">by {course.instructor}</CardDescription>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {course.form}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.totalLessons} lessons
                    </Badge>
                  </div>

                  {isEnrolled && enrollment && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-bold">{course.price === 0 ? "Free" : `KSh ${course.price}`}</div>

                    {isEnrolled ? (
                      <Button
                        onClick={() => handleContinueLearning(course._id, enrollment!.progress)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button onClick={() => handleEnroll(course._id)}>Enroll Now</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </StaggerContainer>

      {filteredCourses?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground text-center">
              {selectedCategory !== "all" || selectedForm !== "all"
                ? "Try adjusting your filters to see more courses."
                : "New courses will be added soon. Check back later!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

