"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner",
    form: "",
    price: 0,
    duration: "",
    tags: "",
    requirements: "",
    learningOutcomes: "",
  })

  const user = useQuery(api.users.current)
  const myCourses = useQuery(api.courses.getCoursesByInstructor, user ? { instructorId: user._id } : "skip")
  const createCourse = useMutation(api.courses.createCourse)

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      toast.error("Please fill in required fields")
      return
    }

    try {
      await createCourse({
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        difficulty: newCourse.difficulty as "beginner" | "intermediate" | "advanced",
        form: newCourse.form,
        price: newCourse.price,
        duration: newCourse.duration,
        tags: newCourse.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        requirements: newCourse.requirements.split("\n").filter(Boolean),
        learningOutcomes: newCourse.learningOutcomes.split("\n").filter(Boolean),
      })

      setNewCourse({
        title: "",
        description: "",
        category: "",
        difficulty: "beginner",
        form: "",
        price: 0,
        duration: "",
        tags: "",
        requirements: "",
        learningOutcomes: "",
      })
      setShowCreateCourse(false)
      toast.success("Course created successfully!")
    } catch (error) {
      toast.error("Failed to create course")
      console.error(error)
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

  const publishedCourses = myCourses?.filter((course) => course.published) || []
  const draftCourses = myCourses?.filter((course) => !course.published) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-600">Manage your courses and track student progress</p>
        </div>
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Fill in the details to create a new course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(value) => setNewCourse({ ...newCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Describe your course"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newCourse.difficulty}
                    onValueChange={(value) => setNewCourse({ ...newCourse, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="form">Form/Grade</Label>
                  <Input
                    id="form"
                    value={newCourse.form}
                    onChange={(e) => setNewCourse({ ...newCourse, form: e.target.value })}
                    placeholder="e.g., Form 1, Grade 9"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newCourse.tags}
                  onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
                  placeholder="algebra, equations, mathematics"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  value={newCourse.requirements}
                  onChange={(e) => setNewCourse({ ...newCourse, requirements: e.target.value })}
                  placeholder="Basic algebra knowledge&#10;Calculator&#10;Notebook"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="learningOutcomes">Learning Outcomes (one per line)</Label>
                <Textarea
                  id="learningOutcomes"
                  value={newCourse.learningOutcomes}
                  onChange={(e) => setNewCourse({ ...newCourse, learningOutcomes: e.target.value })}
                  placeholder="Solve linear equations&#10;Graph functions&#10;Apply algebraic concepts"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                        <p className="text-sm text-gray-500">{course.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={course.published ? "default" : "secondary"}>
                          {course.published ? "Published" : "Draft"}
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
                <p className="text-gray-500">No courses created yet. Create your first course to get started!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses?.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                      {course.title.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.published ? "default" : "secondary"}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Modules</span>
                    <span>{course.modules?.length || 0}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/courses/${course._id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
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
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-4">Create your first course to get started</p>
                <Button onClick={() => setShowCreateCourse(true)}>
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
              <p className="text-gray-500">Student management features coming soon...</p>
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
              <p className="text-gray-500">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

