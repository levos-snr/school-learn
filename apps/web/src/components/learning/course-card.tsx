"use client";

import { Clock, Star, Users, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    shortDescription?: string;
    description: string;
    instructor: string;
    instructorName?: string;
    instructorAvatar?: string;
    category: string;
    level: string;
    duration: string;
    estimatedHours: number;
    totalLessons: number;
    rating: number;
    students: number;
    thumbnail?: string;
    tags: string[];
    price?: number;
    difficulty: string;
  };
  enrollment?: {
    progress: number;
    lastAccessedAt: number;
    completedLessons: string[];
  };
  showProgress?: boolean;
  className?: string;
}

export function CourseCard({
  course,
  enrollment,
  showProgress = false,
  className = "",
}: CourseCardProps) {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="h-full overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
        {/* Course Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Level Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 text-foreground"
          >
            {course.level}
          </Badge>

          {/* Price Badge */}
          {course.price && (
            <Badge
              variant="default"
              className="absolute top-3 right-3 bg-primary text-primary-foreground"
            >
              ${course.price}
            </Badge>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button size="icon" variant="secondary" className="rounded-full">
              <Play className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.shortDescription || course.description}
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Bar for Enrolled Courses */}
          {showProgress && isEnrolled && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students.toLocaleString()}</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            {course.instructorAvatar ? (
              <img
                src={course.instructorAvatar || "/placeholder.svg"}
                alt={course.instructorName || course.instructor}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {(course.instructorName || course.instructor).charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {course.instructorName || course.instructor}
            </span>
          </div>

          {/* Tags */}
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

          {/* Action Button */}
          <Link href={`/courses/${course._id}`} className="block">
            <Button
              className="w-full"
              variant={isEnrolled ? "outline" : "default"}
            >
              {isEnrolled ? "Continue Learning" : "View Course"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
