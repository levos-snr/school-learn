"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { CourseCard } from "@/components/learning/course-card"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import { BookOpen, TrendingUp, Award, Users, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    category: undefined as string | undefined,
    subject: undefined as string | undefined,
    form: undefined as string | undefined,
    search: undefined as string | undefined,
  })

  const coursesData = useQuery(api.courses.getAllCourses, filters)
  const enrolledCourses = useQuery(api.courses.getUserEnrollments)

  // Static categories - you can replace with dynamic query later
  const categories = [
    "mathematics",
    "science", 
    "languages",
    "social-studies",
    "arts"
  ]

  const stats = [
    {
      icon: BookOpen,
      label: "Total Courses",
      value: coursesData?.length || 0,
      description: "Available courses",
    },
    {
      icon: Users,
      label: "Your Courses",
      value: enrolledCourses?.length || 0,
      description: "Enrolled courses",
    },
    {
      icon: Award,
      label: "Categories",
      value: categories?.length || 0,
      description: "Subject areas",
    },
    {
      icon: TrendingUp,
      label: "Published",
      value: coursesData?.filter((c) => c.isPublished).length || 0,
      description: "Published courses",
    },
  ]

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
  }

  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({ ...prev, category: category === "all" ? undefined : category }))
  }

  const handleSubjectFilter = (subject: string) => {
    setFilters((prev) => ({ ...prev, subject: subject === "all" ? undefined : subject }))
  }

  const handleFormFilter = (form: string) => {
    setFilters((prev) => ({ ...prev, form: form === "all" ? undefined : form }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Explore Our Courses
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover engaging courses designed to help you learn, grow, and achieve your goals
              </p>
            </div>
          </FadeIn>

          {/* Stats Grid */}
          <SlideIn direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={stat.label} className="text-center">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm font-medium">{stat.label}</div>
                      <div className="text-xs text-muted-foreground">{stat.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SlideIn>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subject Filter */}
              <Select onValueChange={handleSubjectFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="kiswahili">Kiswahili</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                </SelectContent>
              </Select>

              {/* Form Filter */}
              <Select onValueChange={handleFormFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  <SelectItem value="form1">Form 1</SelectItem>
                  <SelectItem value="form2">Form 2</SelectItem>
                  <SelectItem value="form3">Form 3</SelectItem>
                  <SelectItem value="form4">Form 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.subject || filters.form || filters.search) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <button onClick={() => handleSearch("")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <button onClick={() => handleCategoryFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Subject: {filters.subject}
                    <button onClick={() => handleSubjectFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.form && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Form: {filters.form}
                    <button onClick={() => handleFormFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 pb-8">
        {coursesData === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coursesData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or browse all courses</p>
              <Button
                onClick={() =>
                  setFilters({
                    category: undefined,
                    subject: undefined,
                    form: undefined,
                    search: undefined,
                  })
                }
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesData.map((course, index) => {
              const enrollment = enrolledCourses?.find((e) => e.courseId === course._id)
              
              // Adapt the course data to match CourseCard expectations
              const adaptedCourse = {
                ...course,
                _id: course._id,
                level: course.difficulty,
                estimatedHours: parseInt(course.duration.split(' ')[0]) || 1, // Extract hours from duration string
                tags: [course.category, course.subject].filter(Boolean),
                shortDescription: course.description.length > 100 
                  ? course.description.substring(0, 100) + "..." 
                  : course.description,
                instructorName: course.instructor,
                instructorAvatar: undefined as string | undefined,
              }
              
              return (
                <FadeIn key={course._id} delay={index * 0.1}>
                  <CourseCard 
                    course={adaptedCourse} 
                    enrollment={enrollment} 
                    showProgress={!!enrollment} 
                  />
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
