"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Play, CheckCircle, Lock, Star, BookOpen, Award } from 'lucide-react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CourseDetailProps {
  courseId: Id<"courses">
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const router = useRouter()
  const [enrolling, setEnrolling] = useState(false)

  const course = useQuery(api.courses.getCourseById, { courseId })
  const isEnrolled = useQuery(api.courses.isEnrolled, { courseId })
  const enrollInCourse = useMutation(api.courses.enrollInCourse)

  const handleEnroll = async () => {
    if (!course) return

    setEnrolling(true)
    try {
      await enrollInCourse({ courseId })
      toast.success("Successfully enrolled in course!")
      // Navigate to first lesson if available
      router.push(`/courses/${courseId}/learn`)
    } catch (error) {
      toast.error("Failed to enroll in course")
      console.error(error)
    } finally {
      setEnrolling(false)
    }
  }

  const handleStartLearning = () => {
    router.push(`/courses/${courseId}/learn`)
  }

  if (course === undefined || isEnrolled === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="text-gray-500 mt-2">The course you're looking for doesn't exist.</p>
      </div>
    )
  }

  // Mock data for demonstration - in real app this would come from the database
  const mockModules = [
    {
      id: "1",
      title: "Introduction to the Course",
      description: "Get started with the fundamentals and course overview",
      duration: "15 min",
      type: "video",
      isPreview: true
    },
    {
      id: "2", 
      title: "Core Concepts",
      description: "Learn the essential concepts you'll need throughout the course",
      duration: "30 min",
      type: "video",
      isPreview: false
    },
    {
      id: "3",
      title: "Practical Applications",
      description: "Apply what you've learned with hands-on exercises",
      duration: "45 min", 
      type: "exercise",
      isPreview: false
    },
    {
      id: "4",
      title: "Advanced Topics",
      description: "Dive deeper into advanced concepts and techniques",
      duration: "60 min",
      type: "video", 
      isPreview: false
    }
  ]

  const mockLearningOutcomes = [
    "Master the fundamental concepts and principles",
    "Apply knowledge through practical exercises and projects",
    "Develop problem-solving skills in real-world scenarios",
    "Build confidence in the subject matter",
    "Prepare for advanced topics and further learning"
  ]

  const mockRequirements = [
    "Basic computer literacy and internet access",
    "Willingness to learn and practice regularly",
    "No prior experience required - we'll start from the basics",
    "Approximately 2-3 hours per week for optimal progress"
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
        {course.thumbnail && (
          <img 
            src={course.thumbnail || "/placeholder.svg"} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="secondary" className="capitalize">{course.level}</Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">4.5 (128 reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-xl opacity-90 mb-4">{course.description}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={course.instructorImage || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{course.instructorName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{course.instructorName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{mockModules.length} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>1,234 students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockLearningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Course Content</h3>
                <p className="text-gray-600">
                  {mockModules.length} lessons • {mockModules.reduce((total, module) => total + parseInt(module.duration), 0)} minutes total
                </p>
              </div>
              
              {mockModules.map((module, index) => (
                <Card key={module.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {index + 1}. {module.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{module.duration}</Badge>
                        {isEnrolled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : module.isPreview ? (
                          <Play className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={course.instructorImage || "/placeholder.svg?height=64&width=64"} />
                      <AvatarFallback className="text-lg">{course.instructorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{course.instructorName}</CardTitle>
                      <CardDescription>Course Instructor</CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>⭐ 4.8 instructor rating</span>
                        <span>👥 12,345 students</span>
                        <span>🎓 25 courses</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {course.instructorBio || `${course.instructorName} is an experienced educator with years of expertise in ${course.category}. They are passionate about helping students achieve their learning goals through engaging and practical instruction.`}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">4.5</span>
                    </div>
                    <span className="text-gray-600">128 reviews</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock reviews */}
                    <div className="border-b pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <div className="flex items-center space-x-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Excellent course! The instructor explains concepts clearly and the practical exercises really help reinforce the learning.
                      </p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Sarah Miller</p>
                          <div className="flex items-center space-x-1">
                            {[1,2,3,4].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Great content and well-structured lessons. Would recommend to anyone looking to learn this subject.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </CardTitle>
              {course.price > 0 && (
                <p className="text-sm text-gray-600">One-time payment</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <Button onClick={handleStartLearning} className="w-full" size="lg">
                  Continue Learning
                </Button>
              ) : (
                <Button onClick={handleEnroll} disabled={enrolling} className="w-full" size="lg">
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lessons</span>
                  <span>{mockModules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span>English</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Yes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>This course includes:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-blue-500" />
                  <span>{mockModules.reduce((total, module) => total + parseInt(module.duration), 0)} minutes of video content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Downloadable resources</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span>Access to course community</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
