"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, CheckCircle, Lock, Play } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CourseNavProps {
	courseId: Id<"courses">;
	currentLessonId?: Id<"lessons">;
}

export function CourseNav({ courseId, currentLessonId }: CourseNavProps) {
	const course = useQuery(api.courses.getCourseById, { courseId });
	const lessons = useQuery(api.lessons.getLessonsSequential, { courseId });
	const isEnrolled = useQuery(api.courses.isEnrolled, { courseId });

	if (!course || !lessons) {
		return (
			<div className="animate-pulse space-y-2">
				<div className="h-4 w-3/4 rounded bg-gray-200" />
				<div className="h-2 rounded bg-gray-200" />
			</div>
		);
	}

	const completedLessons = lessons.filter((l) => l.isCompleted).length;
	const totalLessons = lessons.length;
	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

	const currentLessonIndex = currentLessonId
		? lessons.findIndex((l) => l._id === currentLessonId)
		: -1;

	const nextLesson =
		currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
			? lessons[currentLessonIndex + 1]
			: null;

	return (
		<div className="space-y-4 rounded-lg border bg-card p-4">
			{/* Course Progress */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<h3 className="flex items-center gap-2 font-medium">
						<BookOpen className="h-4 w-4" />
						{course.title}
					</h3>
					<Badge variant="outline">
						{completedLessons}/{totalLessons}
					</Badge>
				</div>
				<Progress value={progressPercentage} className="h-2" />
				<p className="text-muted-foreground text-xs">
					{Math.round(progressPercentage)}% complete
				</p>
			</div>

			{/* Quick Actions */}
			<div className="flex gap-2">
				{!isEnrolled ? (
					<Link href={`/courses/${courseId}`} className="flex-1">
						<Button variant="outline" className="w-full bg-transparent">
							View Course
						</Button>
					</Link>
				) : (
					<>
						<Link href={`/courses/${courseId}/learn`} className="flex-1">
							<Button variant="outline" className="w-full bg-transparent">
								<Play className="mr-2 h-4 w-4" />
								Continue
							</Button>
						</Link>

						{nextLesson && nextLesson.canAccess && (
							<Link
								href={`/courses/${courseId}/learn?lesson=${nextLesson._id}`}
							>
								<Button size="sm" variant="ghost">
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						)}
					</>
				)}
			</div>

			{/* Lesson Quick List */}
			<div className="max-h-48 space-y-1 overflow-y-auto">
				<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Lessons
				</h4>
				{lessons.slice(0, 5).map((lesson, index) => (
					<div
						key={lesson._id}
						className={`flex items-center gap-2 rounded p-2 text-sm ${
							currentLessonId === lesson._id
								? "bg-primary/10 text-primary"
								: "hover:bg-muted/50"
						}`}
					>
						<div className="flex-shrink-0">
							{lesson.isCompleted ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : lesson.canAccess ? (
								<Play className="h-4 w-4 text-primary" />
							) : (
								<Lock className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<span className="flex-1 truncate">
							{index + 1}. {lesson.title}
						</span>
					</div>
				))}

				{lessons.length > 5 && (
					<Link href={`/courses/${courseId}/learn`}>
						<Button variant="ghost" size="sm" className="w-full text-xs">
							View all {lessons.length} lessons
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
