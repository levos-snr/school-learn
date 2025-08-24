"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	Clock,
	Lock,
	Play,
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

interface SequentialLessonViewerProps {
	courseId: string;
	currentLessonId?: string;
}

export function SequentialLessonViewer({
	courseId,
	currentLessonId,
}: SequentialLessonViewerProps) {
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
		currentLessonId || null,
	);

	const lessons = useQuery(api.lessons.getLessonsSequential, {
		courseId: courseId as Id<"courses">,
	});

	const selectedLesson = useQuery(
		api.lessons.getLessonById,
		selectedLessonId ? { lessonId: selectedLessonId as any } : "skip",
	);
	const markCompleted = useMutation(api.lessons.markLessonCompleted);

	const handleLessonSelect = (lessonId: string, canAccess: boolean) => {
		if (!canAccess) {
			toast.error("Complete previous lessons to unlock this one");
			return;
		}
		setSelectedLessonId(lessonId);
	};

	const handleMarkCompleted = async () => {
		if (!selectedLessonId) return;

		try {
			await markCompleted({ lessonId: selectedLessonId as any });
			toast.success("Lesson completed! Next lesson unlocked.");
		} catch (error) {
			toast.error("Failed to mark lesson as completed");
		}
	};

	const getNextAccessibleLesson = () => {
		if (!lessons) return null;
		const currentIndex = lessons.findIndex((l) => l._id === selectedLessonId);
		if (currentIndex === -1) return null;

		for (let i = currentIndex + 1; i < lessons.length; i++) {
			if (lessons[i].canAccess) {
				return lessons[i];
			}
		}
		return null;
	};

	const getPreviousLesson = () => {
		if (!lessons) return null;
		const currentIndex = lessons.findIndex((l) => l._id === selectedLessonId);
		if (currentIndex <= 0) return null;
		return lessons[currentIndex - 1];
	};

	const completedLessons = lessons?.filter((l) => l.isCompleted).length || 0;
	const totalLessons = lessons?.length || 0;
	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Lesson List */}
			<div className="lg:col-span-1">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Course Progress</CardTitle>
						<div className="space-y-2">
							<Progress value={progressPercentage} className="h-2" />
							<p className="text-muted-foreground text-sm">
								{completedLessons} of {totalLessons} lessons completed
							</p>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						{lessons?.map((lesson, index) => (
							<div
								key={lesson._id}
								className={`cursor-pointer rounded-lg border p-3 transition-all ${
									selectedLessonId === lesson._id
										? "border-primary bg-primary/5"
										: lesson.canAccess
											? "border-border hover:border-primary/50"
											: "border-muted bg-muted/30"
								}`}
								onClick={() => handleLessonSelect(lesson._id, lesson.canAccess)}
							>
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0">
										{lesson.isCompleted ? (
											<CheckCircle className="h-5 w-5 text-green-500" />
										) : lesson.canAccess ? (
											<Play className="h-5 w-5 text-primary" />
										) : (
											<Lock className="h-5 w-5 text-muted-foreground" />
										)}
									</div>

									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												{index + 1}
											</Badge>
											<span className="flex items-center gap-1 text-muted-foreground text-xs">
												<Clock className="h-3 w-3" />
												{lesson.duration}m
											</span>
										</div>
										<h4
											className={`truncate font-medium text-sm ${
												lesson.canAccess
													? "text-foreground"
													: "text-muted-foreground"
											}`}
										>
											{lesson.title}
										</h4>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Lesson Content */}
			<div className="lg:col-span-2">
				{selectedLesson ? (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{selectedLesson.title}</CardTitle>
									<CardDescription>
										{selectedLesson.description}
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">
										<Clock className="mr-1 h-3 w-3" />
										{selectedLesson.duration}m
									</Badge>
									{selectedLesson.isCompleted && (
										<Badge variant="default" className="bg-green-500">
											<CheckCircle className="mr-1 h-3 w-3" />
											Completed
										</Badge>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Video Player */}
							{selectedLesson.videoUrl && (
								<div className="aspect-video overflow-hidden rounded-lg bg-black">
									<video
										src={selectedLesson.videoUrl}
										controls
										className="h-full w-full"
										poster="/video-thumbnail.png"
									/>
								</div>
							)}

							{/* Lesson Content */}
							{selectedLesson.content && (
								<div className="prose prose-sm max-w-none">
									<div
										dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
									/>
								</div>
							)}

							{/* Resources */}
							{selectedLesson.resources &&
								selectedLesson.resources.length > 0 && (
									<div>
										<h4 className="mb-3 font-semibold">Resources</h4>
										<div className="space-y-2">
											{selectedLesson.resources.map((resource, index) => (
												<a
													key={index}
													href={resource.url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 rounded border p-2 transition-colors hover:bg-muted/50"
												>
													<Badge variant="outline" className="text-xs">
														{resource.type}
													</Badge>
													<span className="text-sm">{resource.title}</span>
												</a>
											))}
										</div>
									</div>
								)}

							{/* Navigation and Completion */}
							<div className="flex items-center justify-between border-t pt-4">
								<Button
									variant="outline"
									onClick={() => {
										const prev = getPreviousLesson();
										if (prev) setSelectedLessonId(prev._id);
									}}
									disabled={!getPreviousLesson()}
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Previous
								</Button>

								<div className="flex gap-2">
									{!selectedLesson.isCompleted && (
										<Button onClick={handleMarkCompleted}>
											<CheckCircle className="mr-2 h-4 w-4" />
											Mark Complete
										</Button>
									)}

									<Button
										onClick={() => {
											const next = getNextAccessibleLesson();
											if (next) setSelectedLessonId(next._id);
										}}
										disabled={!getNextAccessibleLesson()}
									>
										Next
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Play className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								Select a lesson to start learning
							</h3>
							<p className="text-center text-muted-foreground">
								Choose a lesson from the list to begin your learning journey.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
