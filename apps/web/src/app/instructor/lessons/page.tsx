"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonManagement } from "@/components/instructor/lesson-management";
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

export default function InstructorLessonsPage() {
	const [selectedCourseId, setSelectedCourseId] =
		useState<Id<"courses"> | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const user = useQuery(api.users.current);
	const myCourses = useQuery(
		api.courses.getCoursesByInstructor,
		user ? { instructorId: user._id } : undefined,
	);

	if (user === undefined || myCourses === undefined) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-8 w-1/3 rounded bg-gray-200" />
				<div className="h-64 rounded bg-gray-200" />
			</div>
		);
	}

	if (user?.role !== "instructor" && user?.role !== "admin") {
		return (
			<div className="py-12 text-center">
				<h2 className="font-bold text-2xl text-gray-900">Access Denied</h2>
				<p className="mt-2 text-muted-foreground">
					You need instructor privileges to access this page.
				</p>
			</div>
		);
	}

	const filteredCourses =
		myCourses?.filter(
			(course) =>
				course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				course.category.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	return (
		<div className="container mx-auto space-y-6 px-4 py-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push("/instructor")}
						className="cursor-pointer"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Instructor Dashboard
					</Button>
					<div>
						<h1 className="font-bold text-3xl">Lesson Management</h1>
						<p className="text-muted-foreground">
							Create and manage lessons for your courses
						</p>
					</div>
				</div>
			</div>

			{/* Course Selection */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Select Course
					</CardTitle>
					<CardDescription>
						Choose a course to manage its lessons
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4">
						<div className="flex-1">
							<Input
								placeholder="Search courses..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="max-w-sm"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredCourses.map((course) => (
							<Card
								key={course._id}
								className={`cursor-pointer transition-all hover:shadow-md ${
									selectedCourseId === course._id ? "ring-2 ring-primary" : ""
								}`}
								onClick={() => setSelectedCourseId(course._id)}
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="line-clamp-2 text-base">
												{course.title}
											</CardTitle>
											<CardDescription className="text-sm">
												{course.category}
											</CardDescription>
										</div>
										<Badge
											variant={course.isPublished ? "default" : "secondary"}
											className="text-xs"
										>
											{course.isPublished ? "Published" : "Draft"}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between text-muted-foreground text-sm">
										<span>{course.totalLessons || 0} lessons</span>
										<span>{course.level}</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{filteredCourses.length === 0 && (
						<div className="py-8 text-center text-muted-foreground">
							<BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p>No courses found</p>
							<p className="text-sm">Create a course first to manage lessons</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Lesson Management */}
			{selectedCourseId && <LessonManagement courseId={selectedCourseId} />}
		</div>
	);
}
