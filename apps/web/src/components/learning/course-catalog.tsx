"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	BookOpen,
	Check,
	Clock,
	Filter,
	Search,
	Star,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface CourseCatalogProps {
	onCourseSelect?: (courseId: string) => void;
}

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedLevel, setSelectedLevel] = useState<string>("all");

	const courses = useQuery(api.courses.getAllCourses, {
		search: searchTerm || undefined,
		category: selectedCategory === "all" ? undefined : selectedCategory,
		level: selectedLevel === "all" ? undefined : (selectedLevel as any),
		limit: 20,
	});

	const enrollInCourse = useMutation(api.courses.enrollInCourse);
	const user = useQuery(api.users.current);

	// Get enrolled courses to check enrollment status
	const enrolledCourses = useQuery(api.courses.getEnrolledCourses);
	const enrolledCourseIds = new Set(
		enrolledCourses?.map((course) => course._id) || [],
	);

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
	];

	const levels = ["beginner", "intermediate", "advanced"];

	const handleEnroll = async (courseId: string) => {
		// Guard clause for authentication
		if (!user) {
			toast.error("Please sign in to enroll in courses");
			return;
		}

		try {
			const result = await enrollInCourse({ courseId: courseId as any });
			if (result.message === "Already enrolled in this course") {
				toast.info("You're already enrolled in this course!");
			} else {
				toast.success("Successfully enrolled in course!");
			}
		} catch (error) {
			toast.error("Failed to enroll in course");
			console.error("Enrollment error:", error);
		}
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	const getLevelColor = (level: string) => {
		switch (level) {
			case "beginner":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "advanced":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const isEnrolled = (courseId: string) => {
		return enrolledCourseIds.has(courseId);
	};

	const publishedCourses =
		courses?.filter((course) => course.isPublished) || [];

	return (
		<div className="space-y-6">
			{/* Search and Filters */}
			<div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
					<Input
						placeholder="Search courses..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>

				<Select value={selectedCategory} onValueChange={setSelectedCategory}>
					<SelectTrigger className="w-full sm:w-48">
						<Filter className="mr-2 h-4 w-4" />
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
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{publishedCourses.map((course) => (
					<Card
						key={course._id}
						className="group cursor-pointer border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
					>
						<div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-secondary/10">
							{course.thumbnail ? (
								<img
									src={course.thumbnail || "/placeholder.svg"}
									alt={course.title}
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center">
									<div className="font-bold text-4xl text-primary/30">
										{course.title.charAt(0)}
									</div>
								</div>
							)}

							<div className="absolute top-3 right-3">
								<Badge className={getLevelColor(course.level)}>
									{course.level}
								</Badge>
							</div>
						</div>

						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-2">
								<CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
									{course.title}
								</CardTitle>
								<div className="flex items-center gap-1 text-muted-foreground text-sm">
									<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
									<span>4.5</span>
								</div>
							</div>

							<CardDescription className="line-clamp-2">
								{course.description}
							</CardDescription>

							<div className="text-muted-foreground text-sm">
								by {course.instructorName}
							</div>
						</CardHeader>

						<CardContent className="pt-0">
							<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
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
									<div className="font-semibold text-primary">
										${course.price}
									</div>
								) : (
									<Badge variant="secondary">Free</Badge>
								)}
							</div>

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

							<div className="flex gap-2">
								<Link href={`/courses/${course._id}`} className="flex-1">
									<Button variant="outline" className="w-full">
										View Details
									</Button>
								</Link>

								{/* Enrollment Button Logic */}
								{!user ? (
									<Button className="flex-1" disabled>
										Sign In to Enroll
									</Button>
								) : isEnrolled(course._id) ? (
									<Button className="flex-1" variant="secondary" disabled>
										<Check className="mr-2 h-4 w-4" />
										Enrolled
									</Button>
								) : (
									<Button
										className="flex-1"
										onClick={() => handleEnroll(course._id)}
									>
										Enroll Now
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{publishedCourses.length === 0 && (
				<div className="py-12 text-center">
					<BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<div className="mb-2 text-lg text-muted-foreground">
						No published courses found
					</div>
					<div className="text-muted-foreground text-sm">
						Try adjusting your search criteria or check back later
					</div>
				</div>
			)}
		</div>
	);
}
