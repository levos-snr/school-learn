"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, Eye, ArrowLeft, Globe, FileText } from "lucide-react"
import Link from "next/link"
import ComprehensiveCourseCreator from "@/components/admin/comprehensive-course-creator"
import { DraftCourseEditor } from "./draft-course-editor"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCourseCreator, setShowCourseCreator] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const router = useRouter()

  const user = useQuery(api.users.current)
  const myCourses = useQuery(api.courses.getCoursesByInstructor, user ? { instructorId: user._id } : "skip")

  const updateCourse = useMutation(api.courses.updateCourse)

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      await updateCourse({
        courseId: courseId as any,
        isPublished: !isPublished,
      })
      toast.success(`Course ${!isPublished ? "published" : "unpublished"} successfully`)
    } catch (error) {
      toast.error("Failed to update course status")
    }
  }

  if (user === undefined || myCourses === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (user?.role !== "instructor" && user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You need instructor privileges to access this page.</p>
      </div>
    )
  }

  const publishedCourses = myCourses?.filter((course) => course.isPublished) || []
  const draftCourses = myCourses?.filter((course) => !course.isPublished) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>
        </div>
        <Button onClick={() => setShowCourseCreator(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myCourses?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{publishedCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>Your latest course activities</CardDescription>
            </CardHeader>
            <CardContent>
              {myCourses && myCourses.length > 0 ? (
                <div className="space-y-4">
                  {myCourses.slice(0, 5).map((course) => (
                    <div key={course._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Link href={`/courses/${course._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No courses created yet. Create your first course to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses?.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/60 text-xl font-bold">
                      {course.title.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lessons</span>
                    <span>{course.totalLessons || 0}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/courses/${course._id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer bg-transparent"
                      onClick={() => setEditingCourseId(course._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer bg-transparent"
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      title={course.isPublished ? "Unpublish course" : "Publish course"}
                    >
                      {course.isPublished ? <FileText className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myCourses?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Create your first course to get started</p>
                <Button onClick={() => setShowCourseCreator(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage students enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Student management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Track performance and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showCourseCreator && (
        <ComprehensiveCourseCreator onClose={() => setShowCourseCreator(false)} userRole="instructor" />
      )}

      {editingCourseId && <DraftCourseEditor courseId={editingCourseId} onClose={() => setEditingCourseId(null)} />}
    </div>
  )
}
