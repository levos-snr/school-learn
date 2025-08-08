"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Star, Search, Filter } from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { ScaleIn } from "@/components/motion/scale-in"

interface CourseCatalogProps {
  onCourseSelect?: (courseId: string) => void
}

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const courses = useQuery(api.courses.getAllCourses, {
    search: searchTerm || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    limit: 20,
  })

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

  const difficulties = ["beginner", "intermediate", "advanced"]

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <FadeIn>
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

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {/* Course Grid */}
      <StaggerContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <ScaleIn key={course._id}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
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
                    <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
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
                        <span>{formatDuration(course.estimatedDuration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount}</span>
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

                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => onCourseSelect?.(course._id)}
                  >
                    View Course
                  </Button>
                </CardContent>
              </Card>
            </ScaleIn>
          ))}
        </div>
      </StaggerContainer>

      {courses?.length === 0 && (
        <FadeIn>
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">No courses found</div>
            <div className="text-sm text-muted-foreground">Try adjusting your search criteria</div>
          </div>
        </FadeIn>
      )}
    </div>
  )
}

