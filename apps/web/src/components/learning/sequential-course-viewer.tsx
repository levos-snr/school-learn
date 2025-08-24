"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Award,
	BookOpen,
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	Lock,
	MessageSquare,
	Play,
	Users,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SequentialCourseViewerProps {
	courseId: Id<"courses">;
}

export function SequentialCourseViewer({
	courseId,
}: SequentialCourseViewerProps) {
	const [activeLesson, setActiveLesson] = useState<string | null>(null);

	const course = useQuery(api.courses.getCourseById, { courseId });
	const lessons = useQuery(api.lessons.getLessonsByCourse, { courseId });
	const enrollment = useQuery(api.courses.isEnrolled, { courseId });
	const updateProgress = useMutation(api.courses.updateProgress);

	const completedLessons = enrollment ? [] : []; // This would come from enrollment data

	const canAccessLesson = (lessonOrder: number) => {
		if (lessonOrder === 1) return true; // First lesson always accessible
		return completedLessons.includes(lessonOrder - 1); // Can access if previous lesson completed
	};

	const handleCompleteLesson = async (lessonId: Id<"lessons">) => {
		if (!enrollment) {
			toast.error("Please enroll in the course first");
			return;
		}

		try {
			await updateProgress({ courseId, lessonId });
			toast.success("Lesson completed!");
		} catch (error) {
			toast.error("Failed to update progress");
		}
	};

	if (!course || !lessons) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-8 w-1/3 rounded bg-gray-200" />
				<div className="h-64 rounded bg-gray-200" />
			</div>
		);
	}

	const sortedLessons = lessons.sort((a, b) => a.order - b.order);
	const totalLessons = sortedLessons.length;
	const completedCount = completedLessons.length;
	const progressPercentage =
		totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6">
			{/* Course Header */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">{course.title}</CardTitle>
							<CardDescription className="mt-2">
								{course.description}
							</CardDescription>
							<div className="mt-4 flex items-center gap-4">
								<Badge variant="outline">{course.category}</Badge>
								<Badge variant="outline">{course.level}</Badge>
								<div className="flex items-center gap-1 text-gray-600 text-sm">
									<Clock className="h-4 w-4" />
									{course.duration}
								</div>
								<div className="flex items-center gap-1 text-gray-600 text-sm">
									<BookOpen className="h-4 w-4" />
									{totalLessons} lessons
								</div>
							</div>
						</div>
						<div className="text-right">
							<div className="font-bold text-2xl text-green-600">
								{course.price === 0 ? "Free" : `KES ${course.price}`}
							</div>
							{enrollment && (
								<div className="mt-2">
									<div className="mb-1 text-gray-600 text-sm">
										Progress: {completedCount}/{totalLessons} lessons
									</div>
									<Progress value={progressPercentage} className="w-32" />
								</div>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Course Content */}
				<div className="lg:col-span-2">
					<Tabs defaultValue="lessons" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="lessons">Lessons</TabsTrigger>
							<TabsTrigger value="assignments">Assignments</TabsTrigger>
							<TabsTrigger value="discussions">Discussions</TabsTrigger>
							<TabsTrigger value="resources">Resources</TabsTrigger>
						</TabsList>

						<TabsContent value="lessons" className="space-y-4">
							{sortedLessons.map((lesson, index) => {
								const isCompleted = completedLessons.includes(lesson.order);
								const canAccess = canAccessLesson(lesson.order);
								const isActive = activeLesson === lesson._id;

								return (
									<Card
										key={lesson._id}
										className={cn(
											"cursor-pointer transition-all",
											isActive && "ring-2 ring-blue-500",
											!canAccess && "opacity-50",
										)}
										onClick={() => canAccess && setActiveLesson(lesson._id)}
									>
										<CardHeader className="pb-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
														{isCompleted ? (
															<CheckCircle className="h-5 w-5 text-green-600" />
														) : canAccess ? (
															<Play className="h-4 w-4 text-blue-600" />
														) : (
															<Lock className="h-4 w-4 text-gray-400" />
														)}
													</div>
													<div>
														<CardTitle className="text-lg">
															Lesson {lesson.order}: {lesson.title}
														</CardTitle>
														<CardDescription>
															{lesson.description}
														</CardDescription>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Badge variant="outline">
														<Clock className="mr-1 h-3 w-3" />
														{lesson.duration}min
													</Badge>
													{lesson.isPreview && (
														<Badge variant="secondary">Preview</Badge>
													)}
												</div>
											</div>
										</CardHeader>

										{isActive && (
											<CardContent className="pt-0">
												<div className="space-y-4">
													<div className="prose max-w-none">
														<p>{lesson.content}</p>
													</div>

													{lesson.videoUrl && (
														<div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
															<div className="text-center">
																<Play className="mx-auto mb-2 h-12 w-12 text-gray-400" />
																<p className="text-gray-600 text-sm">
																	Video content would load here
																</p>
																<p className="text-gray-500 text-xs">
																	{lesson.videoUrl}
																</p>
															</div>
														</div>
													)}

													{lesson.resources && lesson.resources.length > 0 && (
														<div>
															<h4 className="mb-2 font-semibold">Resources</h4>
															<div className="space-y-2">
																{lesson.resources.map((resource, idx) => (
																	<div
																		key={idx}
																		className="flex items-center gap-2 rounded bg-gray-50 p-2"
																	>
																		<FileText className="h-4 w-4 text-gray-600" />
																		<span className="text-sm">
																			{resource.title}
																		</span>
																		<Badge
																			variant="outline"
																			className="text-xs"
																		>
																			{resource.type}
																		</Badge>
																	</div>
																))}
															</div>
														</div>
													)}

													{canAccess && !isCompleted && (
														<div className="flex justify-end">
															<Button
																onClick={() => handleCompleteLesson(lesson._id)}
															>
																<CheckCircle className="mr-2 h-4 w-4" />
																Mark as Complete
															</Button>
														</div>
													)}
												</div>
											</CardContent>
										)}
									</Card>
								);
							})}
						</TabsContent>

						<TabsContent value="assignments">
							<Card>
								<CardContent className="py-12 text-center">
									<FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
									<h3 className="mb-2 font-medium text-gray-900 text-lg">
										Assignments
									</h3>
									<p className="text-gray-500">
										Course assignments will appear here
									</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="discussions">
							<Card>
								<CardContent className="py-12 text-center">
									<MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
									<h3 className="mb-2 font-medium text-gray-900 text-lg">
										Discussions
									</h3>
									<p className="text-gray-500">
										Course discussions will appear here
									</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="resources">
							<Card>
								<CardContent className="py-12 text-center">
									<BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
									<h3 className="mb-2 font-medium text-gray-900 text-lg">
										Resources
									</h3>
									<p className="text-gray-500">
										Additional course resources will appear here
									</p>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Course Progress */}
					{enrollment && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Your Progress</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<div className="mb-1 flex justify-between text-sm">
											<span>Completion</span>
											<span>{Math.round(progressPercentage)}%</span>
										</div>
										<Progress value={progressPercentage} />
									</div>
									<div className="text-gray-600 text-sm">
										{completedCount} of {totalLessons} lessons completed
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Course Info */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Course Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2 text-sm">
								<Users className="h-4 w-4 text-gray-600" />
								<span>Instructor: {course.instructorName}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-gray-600" />
								<span>Duration: {course.duration}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Award className="h-4 w-4 text-gray-600" />
								<span>Certificate Available</span>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant="outline"
								className="w-full justify-start bg-transparent"
							>
								<MessageSquare className="mr-2 h-4 w-4" />
								Ask a Question
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start bg-transparent"
							>
								<FileText className="mr-2 h-4 w-4" />
								Download Resources
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start bg-transparent"
							>
								<Award className="mr-2 h-4 w-4" />
								View Certificate
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
