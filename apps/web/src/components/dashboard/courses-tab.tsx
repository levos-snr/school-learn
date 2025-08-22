"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Search, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CourseCatalog } from "@/components/learning/course-catalog"

/**
 * CoursesTab component — three-tab interface for browsing courses, viewing enrolled courses, and tracking progress.
 *
 * Renders:
 * - "Browse Courses": shows the CourseCatalog.
 * - "My Courses": searchable list of the current user's enrolled courses with progress, last accessed date, thumbnail or initial placeholder, and a link to each course. Shows loading skeleton while data is loading and an empty state that switches to the browse tab when no courses match the filter.
 * - "Progress": summary cards (total, completed, in progress) and a detailed per-course progress list; also shows loading skeletons and an empty state when there are no enrolled courses.
 *
 * Data usage:
 * - Fetches the current user and their enrolled courses via Convex queries.
 * - Filters enrolled courses by the local search query (case-insensitive).
 * - If the user role is "instructor", displays a "Create Course" button linking to /instructor.
 *
 * @returns The rendered tabbed Courses UI as a JSX element.
 */
export function CoursesTab() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")

  const enrolledCourses = useQuery(api.courses.getEnrolledCourses)
  const user = useQuery(api.users.current)

  const filteredEnrolledCourses = enrolledCourses?.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Discover and learn from our comprehensive course catalog</p>
        </div>
        {user?.role === "instructor" && (
          <Link href="/instructor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <CourseCatalog />
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {enrolledCourses === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-t-lg" />
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEnrolledCourses && filteredEnrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolledCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {course.title?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{course.instructorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{course.instructorName}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{Math.round(course.progress || 0)}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Last accessed {new Date(course.lastAccessedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link href={`/courses/${course._id}`}>
                      <Button className="w-full">
                        {course.progress === 100 ? "Review Course" : "Continue Learning"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
                <p className="text-gray-500 mb-4">Start learning by enrolling in a course</p>
                <Button onClick={() => setActiveTab("browse")}>Browse Courses</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {enrolledCourses === undefined ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-gray-200 rounded mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enrolledCourses.filter((c) => c.progress === 100).length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Progress</CardTitle>
                  <CardDescription>Track your learning progress across all courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{course.instructorName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">by {course.instructorName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Math.round(course.progress || 0)}%</p>
                          <p className="text-sm text-gray-500">
                            {course.progress === 100 ? "Completed" : "In Progress"}
                          </p>
                        </div>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress to show</h3>
                <p className="text-gray-500 mb-4">Enroll in courses to track your progress</p>
                <Button onClick={() => setActiveTab("browse")}>Browse Courses</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
