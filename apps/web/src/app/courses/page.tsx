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
    difficulty: undefined as "beginner" | "intermediate" | "advanced" | undefined,
    search: undefined as string | undefined,
    featured: false,
    limit: 12,
    offset: 0,
  })

  const coursesData = useQuery(api.courses.getCourses, filters)
  const categories = useQuery(api.courses.getCourseCategories)
  const enrolledCourses = useQuery(api.courses.getUserEnrolledCourses)

  const stats = [
    {
      icon: BookOpen,
      label: "Total Courses",
      value: coursesData?.total || 0,
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
      label: "Featured",
      value: coursesData?.courses?.filter((c) => c.isFeatured).length || 0,
      description: "Popular courses",
    },
  ]

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, offset: 0 }))
  }

  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({ ...prev, category: category === "all" ? undefined : category, offset: 0 }))
  }

  const handleDifficultyFilter = (difficulty: string) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: difficulty === "all" ? undefined : (difficulty as "beginner" | "intermediate" | "advanced"),
      offset: 0,
    }))
  }

  const loadMore = () => {
    setFilters((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
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
                  {categories?.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select onValueChange={handleDifficultyFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Toggle */}
              <Button
                variant={filters.featured ? "default" : "outline"}
                onClick={() => setFilters((prev) => ({ ...prev, featured: !prev.featured, offset: 0 }))}
                className="w-full lg:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Featured
              </Button>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.difficulty || filters.search || filters.featured) && (
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
                {filters.difficulty && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Level: {filters.difficulty}
                    <button onClick={() => handleDifficultyFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {filters.featured && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Featured
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, featured: false, offset: 0 }))}
                      className="ml-1 hover:text-destructive"
                    >
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
        ) : coursesData.courses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or browse all courses</p>
              <Button
                onClick={() =>
                  setFilters({
                    category: undefined,
                    difficulty: undefined,
                    search: undefined,
                    featured: false,
                    limit: 12,
                    offset: 0,
                  })
                }
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coursesData.courses.map((course, index) => {
                const enrollment = enrolledCourses?.find((e) => e.courseId === course._id)
                return (
                  <FadeIn key={course._id} delay={index * 0.1}>
                    <CourseCard course={course} enrollment={enrollment} showProgress={!!enrollment} />
                  </FadeIn>
                )
              })}
            </div>

            {/* Load More Button */}
            {coursesData.hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} variant="outline" size="lg">
                  Load More Courses
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

