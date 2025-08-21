"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Star, Search, Filter, BookOpen, Users } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface CourseCatalogProps {
  onCourseSelect?: (courseId: string) => void
}

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  const courses = useQuery(api.courses.getAllCourses, {
    search: searchTerm || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    level: selectedLevel === "all" ? undefined : (selectedLevel as any),
    limit: 20,
  })

  const enrollInCourse = useMutation(api.courses.enrollInCourse)
  const user = useQuery(api.users.current)

  const categories = [
    "Mathematics",
    "Science",
    "Programming",
    "Languages",
    "History",
    "Art",
    "Music",
    "Business",
    "Health",
    "Technology",
  ]

  const levels = ["beginner", "intermediate", "advanced"]

  const handleEnroll = async (courseId: string) => {
    try {
      const result = await enrollInCourse({ courseId: courseId as any })
      if (result.message === "Already enrolled in this course") {
        toast.info("You're already enrolled in this course!")
      } else {
        toast.success("Successfully enrolled in course!")
      }
    } catch (error) {
      toast.error("Failed to enroll in course")
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const publishedCourses = courses?.filter((course) => course.isPublished) || []

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-card rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedCourses.map((course) => (
          <Card
            key={course._id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
          >
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg relative overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary/30">{course.title.charAt(0)}</div>
                </div>
              )}

              <div className="absolute top-3 right-3">
                <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.5</span>
                </div>
              </div>

              <CardDescription className="line-clamp-2">{course.description}</CardDescription>

              <div className="text-sm text-muted-foreground">by {course.instructorName}</div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students || 0}</span>
                  </div>
                </div>

                {course.price > 0 ? (
                  <div className="font-semibold text-primary">${course.price}</div>
                ) : (
                  <Badge variant="secondary">Free</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/courses/${course._id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Details
                  </Button>
                </Link>
                <Button className="flex-1 cursor-pointer" onClick={() => handleEnroll(course._id)} disabled={!user}>
                  {!user ? "Sign In to Enroll" : "Enroll Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {publishedCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground text-lg mb-2">No published courses found</div>
          <div className="text-sm text-muted-foreground">Try adjusting your search criteria or check back later</div>
        </div>
      )}
    </div>
  )
}
