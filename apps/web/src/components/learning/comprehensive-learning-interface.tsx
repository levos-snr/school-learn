"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	BookOpen,
	CheckCircle,
	Clock,
	Download,
	FileText,
	Lock,
	Play,
	Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFViewer } from "./pdf-viewer";
import { VideoPlayer } from "./video-player";

interface ComprehensiveLearningInterfaceProps {
	courseId: Id<"courses">;
	lessonId?: Id<"lessons">;
}

export function ComprehensiveLearningInterface({
	courseId,
	lessonId,
}: ComprehensiveLearningInterfaceProps) {
	const [activeTab, setActiveTab] = useState("content");
	const [currentLessonId, setCurrentLessonId] = useState<Id<"lessons"> | null>(
		lessonId || null,
	);

	const course = useQuery(api.courses.getCourseById, { courseId });
	const lessons = useQuery(api.lessons.getLessonsSequential, { courseId });
	const currentLesson = useQuery(
		api.lessons.getLessonById,
		currentLessonId ? { lessonId: currentLessonId } : "skip",
	);
	const assignments = useQuery(api.assignments.getAssignmentsByCourse, {
		courseId,
	});
	const discussions = useQuery(api.discussions.getCourseDiscussions, {
		courseId: courseId as any,
	});
	const pastPapers = useQuery(api.pastPapers.getPastPapersByCourse, {
		courseId,
	});

	const markCompleted = useMutation(api.lessons.markLessonCompleted);

	const handleLessonComplete = async () => {
		if (!currentLessonId) return;

		try {
			await markCompleted({ lessonId: currentLessonId });
			toast.success("Lesson completed! Next lesson unlocked.");
		} catch (error) {
			toast.error("Failed to mark lesson as completed");
		}
	};

	const handleLessonSelect = (lessonId: Id<"lessons">, canAccess: boolean) => {
		if (!canAccess) {
			toast.error("Complete previous lessons to unlock this one");
			return;
		}
		setCurrentLessonId(lessonId);
	};

	if (!course || !lessons) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-8 w-1/3 rounded bg-gray-200" />
				<div className="h-64 rounded bg-gray-200" />
			</div>
		);
	}

	const completedLessons = lessons.filter((l) => l.isCompleted).length;
	const totalLessons = lessons.length;
	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<div className="lg:col-span-1">
				<Card className="sticky top-6">
					<CardHeader>
						<CardTitle className="text-lg">Course Progress</CardTitle>
						<div className="space-y-2">
							<Progress value={progressPercentage} className="h-2" />
							<p className="text-muted-foreground text-sm">
								{completedLessons} of {totalLessons} lessons completed
							</p>
						</div>
					</CardHeader>
					<CardContent className="max-h-96 space-y-2 overflow-y-auto">
						{lessons.map((lesson, index) => (
							<div
								key={lesson._id}
								className={`cursor-pointer rounded-lg border p-3 transition-all ${
									currentLessonId === lesson._id
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

			<div className="lg:col-span-3">
				{currentLesson ? (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{currentLesson.title}</CardTitle>
									<p className="mt-1 text-muted-foreground">
										{currentLesson.description}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										<Clock className="mr-1 h-3 w-3" />
										{currentLesson.duration}m
									</Badge>
									{currentLesson.isCompleted && (
										<Badge variant="default" className="bg-green-500">
											<CheckCircle className="mr-1 h-3 w-3" />
											Completed
										</Badge>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="grid w-full grid-cols-5">
									<TabsTrigger value="content">Content</TabsTrigger>
									<TabsTrigger value="assignments">Assignments</TabsTrigger>
									<TabsTrigger value="discussions">Discussions</TabsTrigger>
									<TabsTrigger value="resources">Resources</TabsTrigger>
									<TabsTrigger value="past-papers">Past Papers</TabsTrigger>
								</TabsList>

								<TabsContent value="content" className="space-y-6">
									{currentLesson.videoUrl && (
										<div className="space-y-4">
											<h3 className="font-semibold text-lg">Video Lesson</h3>
											<VideoPlayer
												src={currentLesson.videoUrl}
												title={currentLesson.title}
												onComplete={handleLessonComplete}
												className="aspect-video w-full"
											/>
										</div>
									)}

									{currentLesson.content && (
										<div className="space-y-4">
											<h3 className="font-semibold text-lg">Lesson Content</h3>
											<div className="prose prose-sm max-w-none">
												<div
													dangerouslySetInnerHTML={{
														__html: currentLesson.content,
													}}
												/>
											</div>
										</div>
									)}

									{currentLesson.resources
										?.filter((r) => r.type === "pdf")
										.map((resource, index) => (
											<div key={index} className="space-y-4">
												<h3 className="flex items-center gap-2 font-semibold text-lg">
													<FileText className="h-5 w-5" />
													{resource.title}
												</h3>
												<PDFViewer
													src={resource.url}
													title={resource.title}
													className="w-full"
												/>
											</div>
										))}

									{!currentLesson.isCompleted && (
										<div className="flex justify-end border-t pt-4">
											<Button
												onClick={handleLessonComplete}
												className="cursor-pointer"
											>
												<CheckCircle className="mr-2 h-4 w-4" />
												Mark as Complete
											</Button>
										</div>
									)}
								</TabsContent>

								<TabsContent value="assignments">
									<div className="space-y-4">
										{assignments?.map((assignment) => (
											<Card key={assignment._id}>
												<CardHeader>
													<CardTitle className="text-lg">
														{assignment.title}
													</CardTitle>
													<p className="text-muted-foreground">
														{assignment.description}
													</p>
												</CardHeader>
												<CardContent>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-4">
															<Badge variant="outline">{assignment.type}</Badge>
															<span className="text-muted-foreground text-sm">
																Due:{" "}
																{new Date(
																	assignment.dueDate,
																).toLocaleDateString()}
															</span>
														</div>
														<Button
															variant="outline"
															className="cursor-pointer bg-transparent"
														>
															View Assignment
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</TabsContent>

								<TabsContent value="discussions">
									<div className="space-y-4">
										{discussions?.map((discussion) => (
											<Card key={discussion._id}>
												<CardContent className="p-4">
													<div className="flex items-start gap-3">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
															<span className="font-medium text-primary text-xs">
																{discussion.userName.charAt(0)}
															</span>
														</div>
														<div className="flex-1">
															<div className="mb-1 flex items-center gap-2">
																<span className="font-medium">
																	{discussion.userName}
																</span>
																<Badge variant="outline" className="text-xs">
																	{discussion.type}
																</Badge>
															</div>
															<h4 className="mb-1 font-medium">
																{discussion.title}
															</h4>
															<p className="text-muted-foreground text-sm">
																{discussion.content}
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</TabsContent>

								<TabsContent value="resources">
									<div className="space-y-4">
										{currentLesson.resources?.map((resource, index) => (
											<Card key={index}>
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
																{resource.type === "pdf" ? (
																	<FileText className="h-5 w-5 text-primary" />
																) : resource.type === "video" ? (
																	<Video className="h-5 w-5 text-primary" />
																) : (
																	<Download className="h-5 w-5 text-primary" />
																)}
															</div>
															<div>
																<h4 className="font-medium">
																	{resource.title}
																</h4>
																<p className="text-muted-foreground text-sm capitalize">
																	{resource.type} Resource
																</p>
															</div>
														</div>
														<Button
															variant="outline"
															size="sm"
															className="cursor-pointer bg-transparent"
														>
															<Download className="mr-2 h-4 w-4" />
															Download
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</TabsContent>

								<TabsContent value="past-papers">
									<div className="space-y-4">
										{pastPapers?.map((paper) => (
											<Card key={paper._id}>
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
																<FileText className="h-5 w-5 text-blue-600" />
															</div>
															<div>
																<h4 className="font-medium">{paper.title}</h4>
																<p className="text-muted-foreground text-sm">
																	{paper.year} • {paper.examType}
																</p>
															</div>
														</div>
														<div className="flex gap-2">
															<Button
																variant="outline"
																size="sm"
																className="cursor-pointer bg-transparent"
															>
																View
															</Button>
															<Button
																variant="outline"
																size="sm"
																className="cursor-pointer bg-transparent"
															>
																<Download className="mr-2 h-4 w-4" />
																Download
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								Select a lesson to start learning
							</h3>
							<p className="text-center text-muted-foreground">
								Choose a lesson from the sidebar to begin your learning journey.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
