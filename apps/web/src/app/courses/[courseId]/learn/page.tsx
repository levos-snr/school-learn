"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EnhancedLearningHub } from "@/components/learning/enhanced-learning-hub";
import { Button } from "@/components/ui/button";

export default function CourseLearnPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const courseId = params.courseId as string;

	const lessonId = searchParams.get("lesson") ?? undefined;
	const viewParam = searchParams.get("view");
	const viewMode: "comprehensive" | "sequential" | "overview" =
		viewParam === "comprehensive" ||
		viewParam === "sequential" ||
		viewParam === "overview"
			? viewParam
			: "comprehensive";

	const typedCourseId = courseId as Id<"courses">;
	const course = useQuery(api.courses.getCourseById, {
		courseId: typedCourseId,
	});
	const isEnrolled = useQuery(api.courses.isEnrolled, {
		courseId: typedCourseId,
	});
	const user = useQuery(api.users.current);

	if (isEnrolled === false) {
		toast.error("Please enroll in this course first");
		router.push(`/courses/${courseId}`);
		return null;
	}

	if (!course || isEnrolled === undefined) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse space-y-6">
					<div className="h-8 w-1/2 rounded bg-gray-200" />
					<div className="h-64 rounded bg-gray-200" />
					<div className="h-4 w-3/4 rounded bg-gray-200" />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="border-border border-b bg-card">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => router.push(`/courses/${courseId}`)}
								className="cursor-pointer"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Course
							</Button>
							<div className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-primary" />
								<h1 className="font-semibold text-xl">{course.title}</h1>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push("/dashboard")}
							className="cursor-pointer"
						>
							Dashboard
						</Button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				<EnhancedLearningHub
					courseId={typedCourseId}
					initialLessonId={lessonId}
					viewMode={viewMode}
				/>
			</div>
		</div>
	);
}
