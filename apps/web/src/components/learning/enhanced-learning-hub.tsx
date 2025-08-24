"use client";

import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import {
	Award,
	BookOpen,
	Clock,
	Eye,
	Grid,
	List,
	Play,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CourseNav } from "@/components/navigation/course-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseLearning } from "@/hooks/use-course-learning";
import { ComprehensiveLearningInterface } from "./comprehensive-learning-interface";
import { CourseOverview } from "./course-overview";
import { SequentialLessonViewer } from "./sequential-lesson-viewer";

interface EnhancedLearningHubProps {
	courseId: Id<"courses">;
	initialLessonId?: Id<"lessons">;
	viewMode?: "comprehensive" | "sequential" | "overview";
}

export function EnhancedLearningHub({
	courseId,
	initialLessonId,
	viewMode = "comprehensive",
}: EnhancedLearningHubProps) {
	const [currentViewMode, setCurrentViewMode] = useState(viewMode);
	const [selectedLessonId, setSelectedLessonId] = useState<
		Id<"lessons"> | undefined
	>(initialLessonId);

	const {
		course,
		lessons,
		isEnrolled,
		completedLessons,
		totalLessons,
		progressPercentage,
		isLoading,
	} = useCourseLearning(courseId);

	// ✅ ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
	// Defense-in-depth: prevent locked/missing lessons from being pre-selected via URL
	useEffect(() => {
		if (!lessons || !selectedLessonId) return;
		const entry = lessons.find((l) => l._id === selectedLessonId);
		if (!entry || !entry.canAccess) {
			setSelectedLessonId(undefined);
		}
	}, [lessons, selectedLessonId]);

	// ✅ Early returns AFTER all hooks have been called
	if (isLoading) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-8 w-1/3 rounded bg-gray-200" />
				<div className="h-64 rounded bg-gray-200" />
			</div>
		);
	}

	// Additional loading guard for data completeness
	if (!course || !lessons || isEnrolled === undefined) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-8 w-1/3 rounded bg-gray-200" />
				<div className="h-64 rounded bg-gray-200" />
			</div>
		);
	}

	const renderLearningInterface = () => {
		switch (currentViewMode) {
			case "comprehensive":
				return (
					<ComprehensiveLearningInterface
						courseId={courseId}
						lessonId={selectedLessonId}
					/>
				);
			case "sequential":
				return (
					<SequentialLessonViewer
						courseId={courseId}
						currentLessonId={selectedLessonId}
					/>
				);
			case "overview":
			default:
				return (
					<CourseOverview
						course={course}
						lessons={lessons}
						isEnrolled={isEnrolled}
						progressPercentage={progressPercentage}
						completedLessons={completedLessons}
						totalLessons={totalLessons}
						onLessonSelect={(lessonId) => {
							setSelectedLessonId(lessonId);
							setCurrentViewMode("comprehensive");
						}}
					/>
				);
		}
	};

	return (
		<div className="space-y-6">
			{/* Learning Mode Selector */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5" />
								Learning Interface
							</CardTitle>
							<CardDescription>
								Choose your preferred learning experience
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={currentViewMode === "overview" ? "default" : "outline"}
								size="sm"
								onClick={() => setCurrentViewMode("overview")}
								className="gap-2"
							>
								<Grid className="h-4 w-4" />
								Overview
							</Button>
							<Button
								variant={
									currentViewMode === "sequential" ? "default" : "outline"
								}
								size="sm"
								onClick={() => setCurrentViewMode("sequential")}
								className="gap-2"
							>
								<List className="h-4 w-4" />
								Sequential
							</Button>
							<Button
								variant={
									currentViewMode === "comprehensive" ? "default" : "outline"
								}
								size="sm"
								onClick={() => setCurrentViewMode("comprehensive")}
								className="gap-2"
							>
								<Eye className="h-4 w-4" />
								Comprehensive
							</Button>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Course Navigation Sidebar */}
			{(currentViewMode === "comprehensive" ||
				currentViewMode === "sequential") && (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
					<div className="lg:col-span-1">
						<CourseNav courseId={courseId} currentLessonId={selectedLessonId} />
					</div>
					<div className="lg:col-span-3">{renderLearningInterface()}</div>
				</div>
			)}

			{/* Full Width for Overview Mode */}
			{currentViewMode === "overview" && renderLearningInterface()}
		</div>
	);
}
