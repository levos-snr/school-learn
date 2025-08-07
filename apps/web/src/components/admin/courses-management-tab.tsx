"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Users, BookOpen, TrendingUp, GraduationCap, Plus, Upload, Settings } from 'lucide-react'
import { toast } from "sonner"
import { CourseCreationWizard } from "@/components/courses/course-creation-wizard"
import { BulkCourseUpload } from "@/components/courses/bulk-course-upload"

export function CoursesManagementTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const coursesData = useQuery(api.courses.getCourses, {
    search: searchTerm || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    level: levelFilter !== "all" ? levelFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  const updateCourse = useMutation(api.courses.updateCourse)
  const deleteCourse = useMutation(api.courses.deleteCourse)

  const courses = coursesData?.courses || []

  const handlePublishToggle = async (courseId: string, currentStatus: boolean) => {
    try {
      await updateCourse({
        courseId: courseId as any,
        isPublished: !currentStatus,
      })
      toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      toast.error("Failed to update course status")
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      await deleteCourse({ courseId: courseId as any })
      toast.success("Course deleted successfully")
    } catch (error) {
      toast.error("Failed to delete course")
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
            await updateCourse({
              courseId: courseId as any,
              isPublished: true,
            })
          }
          toast.success(`${selectedCourses.length} courses published`)
          break
        case "unpublish":
          for (const courseId of selectedCourses) {
            await updateCourse({
              courseId: courseId as any,
              isPublished: false,
            })
          }
          toast.success(`${selectedCourses.length} courses unpublished`)
          break
        case "delete":
          if (!confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) {
            return
          }
          for (const courseId of selectedCourses) {
            await deleteCourse({ courseId: courseId as any })
          }
          toast.success(`${selectedCourses.length} courses deleted`)
          break
      }
      setSelectedCourses([])
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(courses.map(course => course._id))
    }
  }

  // Calculate statistics
  const totalCourses = courses.length
  const publishedCourses = courses.filter(course => course.isPublished).length
  const draftCourses = totalCourses - publishedCourses
  const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0)

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftCourses}</div>
            <p className="text-xs text-muted-foreground">
              {totalCourses > 0 ? Math.round((draftCourses / totalCourses) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowCreateWizard(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('publish')}>
                  Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('unpublish')}>
                  Unpublish
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCourses([])}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage and monitor all courses in the system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCourses.length === courses.length && courses.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== "all" || levelFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters to see more courses."
                  : "Get started by creating your first course."}
              </p>
              {!searchTerm && categoryFilter === "all" && levelFilter === "all" && statusFilter === "all" && (
                <Button onClick={() => setShowCreateWizard(true)}>
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedCourses.includes(course._id)}
                    onCheckedChange={() => toggleCourseSelection(course._id)}
                  />
                  
                  <div className="flex-shrink-0">
                    <img
                      src={course.thumbnail || "/placeholder.svg?height=60&width=80"}
                      alt={course.title}
                      className="w-20 h-15 object-cover rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={course.instructorAvatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {course.instructorName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{course.instructorName}</span>
                          </div>
                          <Badge variant="outline">{course.category}</Badge>
                          <Badge variant="outline" className="capitalize">{course.level}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 ml-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{course.students || 0}</span>
                          </div>
                          <Badge 
                            variant={course.isPublished ? "default" : "secondary"}
                            className={course.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePublishToggle(course._id, course.isPublished)}>
                              <Settings className="h-4 w-4 mr-2" />
                              {course.isPublished ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCourse(course._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateWizard && (
        <CourseCreationWizard
          isOpen={showCreateWizard}
          onClose={() => setShowCreateWizard(false)}
        />
      )}

      {showBulkUpload && (
        <BulkCourseUpload
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  )
}
