"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, Search } from "lucide-react"
import Link from "next/link"

export function CourseCatalog() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [level, setLevel] = useState<string>("all")

  const courses = useQuery(api.courses.getAllCourses, {
    search: search || undefined,
    category: category === "all" ? undefined : category,
    level: level === "all" ? undefined : level,
  })

  const categories = ["Mathematics", "Science", "English", "History", "Computer Science", "Art"]
  const levels = ["beginner", "intermediate", "advanced"]

  if (courses === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {course.title.charAt(0)}
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  {course.difficulty}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={course.instructorImage || "/placeholder.svg"} />
                  <AvatarFallback>{course.instructorName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{course.instructorName}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.modules?.length || 0} lessons</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {course.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
              <div className="text-lg font-bold">{course.price === 0 ? "Free" : `$${course.price}`}</div>
              <Link href={`/courses/${course._id}`}>
                <Button>View Course</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}

