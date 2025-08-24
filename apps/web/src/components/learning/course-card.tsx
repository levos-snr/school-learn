"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Play, Star, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
			<Card className="h-full overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg">
				{/* Course Thumbnail */}
				<div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
					{course.thumbnail ? (
						<img
							src={course.thumbnail || "/placeholder.svg"}
							alt={course.title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<BookOpen className="h-16 w-16 text-primary/40" />
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
					<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 hover:opacity-100">
						<Button size="icon" variant="secondary" className="rounded-full">
							<Play className="h-6 w-6" />
						</Button>
					</div>
				</div>

				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-2">
						<h3 className="line-clamp-2 font-semibold text-foreground text-lg leading-tight">
							{course.title}
						</h3>
						<div className="flex shrink-0 items-center gap-1 text-muted-foreground text-sm">
							<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
							<span>{course.rating.toFixed(1)}</span>
						</div>
					</div>

					<p className="line-clamp-2 text-muted-foreground text-sm">
						{course.shortDescription || course.description}
					</p>
				</CardHeader>

				<CardContent className="pt-0">
					{/* Progress Bar for Enrolled Courses */}
					{showProgress && isEnrolled && (
						<div className="mb-4">
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Progress</span>
								<span className="font-medium text-foreground">{progress}%</span>
							</div>
							<Progress value={progress} className="h-2" />
						</div>
					)}

					{/* Course Stats */}
					<div className="mb-4 flex items-center gap-4 text-muted-foreground text-sm">
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
							<span>{course.students.toLocaleString()}</span>
						</div>
					</div>

					{/* Instructor */}
					<div className="mb-4 flex items-center gap-2">
						{course.instructorAvatar ? (
							<img
								src={course.instructorAvatar || "/placeholder.svg"}
								alt={course.instructorName || course.instructor}
								className="h-6 w-6 rounded-full"
							/>
						) : (
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
								<span className="font-medium text-primary text-xs">
									{(course.instructorName || course.instructor).charAt(0)}
								</span>
							</div>
						)}
						<span className="text-muted-foreground text-sm">
							{course.instructorName || course.instructor}
						</span>
					</div>

					{/* Tags */}
					<div className="mb-4 flex flex-wrap gap-1">
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
