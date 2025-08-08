"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Search, MoreHorizontal, Edit, Trash2, Eye, Users, BookOpen, Plus, Upload, RefreshCw, BarChart3 } from 'lucide-react'
import { toast } from "sonner"
import { CourseCreationWizard } from "./course-creation-wizard"
import { BulkCourseUpload } from "./bulk-course-upload"

interface CourseManagementDashboardProps {
userRole: "admin" | "instructor" | "user"
}

export function CourseManagementDashboard({ userRole }: CourseManagementDashboardProps) {
const [searchTerm, setSearchTerm] = useState("")
const [selectedCategory, setSelectedCategory] = useState<string>("")
const [selectedLevel, setSelectedLevel] = useState<string>("")
const [selectedCourses, setSelectedCourses] = useState<string[]>([])
const [showCreateWizard, setShowCreateWizard] = useState(false)
const [showBulkUpload, setShowBulkUpload] = useState(false)
const [activeTab, setActiveTab] = useState("all")
const [currentUserId, setCurrentUserId] = useState<string>("current_user_id") // You should get this from your auth context

// Queries
const courses = useQuery(api.courses.getAllCourses, {
  search: searchTerm,
  category: selectedCategory || undefined,
  level: selectedLevel || undefined,
})

// Fixed: Only call this query for instructors, otherwise skip it
const myCourses = useQuery(
  api.courses.getCoursesByInstructor,
  userRole === "instructor" ? { instructorId: currentUserId as any } : "skip"
)

const categories = useQuery(api.courseManagement.getCourseCategories)

// Mutations
const deleteCourse = useMutation(api.courses.deleteCourse)
const updateCourse = useMutation(api.courses.updateCourse)
const resetCourse = useMutation(api.courseManagement.resetCourse)

const handleDeleteCourse = async (courseId: string) => {
  try {
    await deleteCourse({ courseId: courseId as any })
    toast.success("Course deleted successfully")
  } catch (error) {
    toast.error("Failed to delete course")
  }
}

const handlePublishCourse = async (courseId: string, isPublished: boolean) => {
  try {
    await updateCourse({ courseId: courseId as any, isPublished })
    toast.success(`Course ${isPublished ? "published" : "unpublished"} successfully`)
  } catch (error) {
    toast.error("Failed to update course")
  }
}

const handleResetCourse = async (courseId: string) => {
  try {
    await resetCourse({
      courseId: courseId as any,
      resetOptions: {
        removeEnrollments: true,
        removeGrades: true,
        removeDiscussions: false,
        removeSubmissions: true,
        newStartDate: Date.now(),
      }
    })
    toast.success("Course reset successfully")
  } catch (error) {
    toast.error("Failed to reset course")
  }
}

const handleBulkAction = async (action: string) => {
  if (selectedCourses.length === 0) {
    toast.error("Please select courses first")
    return
  }

  try {
    switch (action) {
      case "publish":
        for (const courseId of selectedCourses) {
          await updateCourse({ courseId: courseId as any, isPublished: true })
        }
        toast.success(`Published ${selectedCourses.length} courses`)
        break
      case "unpublish":
        for (const courseId of selectedCourses) {
          await updateCourse({ courseId: courseId as any, isPublished: false })
        }
        toast.success(`Unpublished ${selectedCourses.length} courses`)
        break
      case "delete":
        for (const courseId of selectedCourses) {
          await deleteCourse({ courseId: courseId as any })
        }
        toast.success(`Deleted ${selectedCourses.length} courses`)
        break
    }
    setSelectedCourses([])
  } catch (error) {
    toast.error("Bulk action failed")
  }
}

const filteredCourses = courses?.filter(course => {
  if (activeTab === "published") return course.isPublished
  if (activeTab === "draft") return !course.isPublished
  return true
}) || []

const stats = {
  total: courses?.length || 0,
  published: courses?.filter(c => c.isPublished).length || 0,
  draft: courses?.filter(c => !c.isPublished).length || 0,
  enrollments: 0, // We'll need to get this from a separate query or calculation
}

if (showCreateWizard) {
  return (
    <CourseCreationWizard
      isOpen={true}
      onClose={() => setShowCreateWizard(false)}
    />
  )
}

if (showBulkUpload) {
  return <BulkCourseUpload />
}

return (
  <div className="max-w-7xl mx-auto p-6 space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Course Management
        </h1>
        <p className="text-muted-foreground mt-2">
          {userRole === "admin" 
            ? "Manage all courses across the platform"
            : userRole === "instructor"
            ? "Create and manage your courses"
            : "Browse available courses"
          }
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {(userRole === "admin" || userRole === "instructor") && (
          <>
            <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setShowCreateWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </>
        )}
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Edit className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.enrollments}</p>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Filters and Search */}
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (userRole === "admin" || userRole === "instructor") && (
          <div className="flex items-center justify-between mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">
              {selectedCourses.length} course(s) selected
            </p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("publish")}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("unpublish")}
              >
                Unpublish
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction("delete")}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Course Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Courses ({stats.total})</TabsTrigger>
        <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
        <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {(userRole === "admin" || userRole === "instructor") && (
                    <Checkbox
                      checked={selectedCourses.includes(course._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses([...selectedCourses, course._id])
                        } else {
                          setSelectedCourses(selectedCourses.filter(id => id !== course._id))
                        }
                      }}
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {(userRole === "admin" || userRole === "instructor") && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetCourse(course._id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Course
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishCourse(course._id, !course.isPublished)}
                          >
                            {course.isPublished ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <p className="text-sm font-medium">${course.price}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.category}</span>
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.totalEnrollments || 0} students</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {course.instructorName?.charAt(0) || "?"}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{course.instructorName}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory || selectedLevel
                ? "Try adjusting your filters"
                : "Get started by creating your first course"
              }
            </p>
            {(userRole === "admin" || userRole === "instructor") && (
              <Button onClick={() => setShowCreateWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  </div>
)
}

