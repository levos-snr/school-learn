"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type {
	Doc,
	Id,
} from "@school-learn/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import {
	Award,
	BookOpen,
	CalendarIcon,
	Eye,
	FileText,
	Plus,
	Save,
	Send,
	Trash2,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Lesson {
	id: string;
	title: string;
	description: string;
	content: string;
	videoUrl?: string;
	duration: number;
	order: number;
	isPreview: boolean;
	resources: Array<{
		title: string;
		url: string;
		type: "pdf" | "link" | "video";
	}>;
}

interface Assignment {
	id: string;
	title: string;
	description: string;
	dueDate?: Date;
	maxPoints: number;
	instructions: string;
}

interface Test {
	id: string;
	title: string;
	description: string;
	timeLimit: number;
	questions: Array<{
		question: string;
		type: "multiple-choice" | "essay" | "true-false";
		options?: string[];
		correctAnswer?: string;
	}>;
}

interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	date: Date;
	type: "lecture" | "assignment" | "exam" | "discussion";
}

interface CourseCreatorProps {
	initialCourse?: Doc<"courses">;
	isEditing?: boolean;
}

export function ComprehensiveCourseCreator({
	initialCourse,
	isEditing,
}: CourseCreatorProps) {
	const router = useRouter();
	const [activeStep, setActiveStep] = useState(0);
	const [courseData, setCourseData] = useState({
		// Basic Info
		title: "",
		description: "",
		category: "",
		level: "beginner" as "beginner" | "intermediate" | "advanced",
		duration: "",
		price: 0,
		thumbnail: "",
		tags: [] as string[],
		requirements: [] as string[],
		whatYouWillLearn: [] as string[],

		// Advanced Settings
		startDate: undefined as Date | undefined,
		endDate: undefined as Date | undefined,
		maxStudents: 0,
		isPublic: true,
		allowDiscussions: true,
		certificateEnabled: true,

		// Content
		lessons: [] as Lesson[],
		assignments: [] as Assignment[],
		tests: [] as Test[],
		calendarEvents: [] as CalendarEvent[],

		// Resources
		pastPapers: [] as Array<{ title: string; url: string; year: string }>,
		achievements: [] as Array<{
			title: string;
			description: string;
			criteria: string;
		}>,
	});

	const createCourse = useMutation(api.courses.createCourse);
	const updateCourse = useMutation(api.courses.updateCourse);
	const createLesson = useMutation(api.lessons.createLesson);

	// Initialize form data from initialCourse when provided
	useEffect(() => {
		if (!initialCourse) return;

		setCourseData((prev) => ({
			...prev,
			title: initialCourse.title ?? prev.title,
			description: initialCourse.description ?? prev.description,
			category: initialCourse.category ?? prev.category,
			level: (initialCourse.level as any) ?? prev.level,
			duration: (initialCourse.duration as any) ?? prev.duration,
			price: (initialCourse.price as any) ?? prev.price,
			thumbnail: (initialCourse.thumbnail as any) ?? prev.thumbnail,
			tags: (initialCourse.tags as any) ?? prev.tags,
			requirements: (initialCourse.requirements as any) ?? prev.requirements,
			whatYouWillLearn:
				(initialCourse.whatYouWillLearn as any) ?? prev.whatYouWillLearn,
			startDate: (initialCourse.startDate as any)
				? new Date(initialCourse.startDate as any)
				: prev.startDate,
			endDate: (initialCourse.endDate as any)
				? new Date(initialCourse.endDate as any)
				: prev.endDate,
			maxStudents: (initialCourse.maxStudents as any) ?? prev.maxStudents,
			isPublic: (initialCourse.isPublic as any) ?? prev.isPublic,
			allowDiscussions:
				(initialCourse.allowDiscussions as any) ?? prev.allowDiscussions,
			certificateEnabled:
				(initialCourse.certificateEnabled as any) ?? prev.certificateEnabled,
		}));

		// TODO: prefill lessons/assessments/events if available from API
	}, [initialCourse]);

	const steps = [
		{ id: 0, title: "Basic Information", icon: BookOpen },
		{ id: 1, title: "Course Content", icon: FileText },
		{ id: 2, title: "Assessments", icon: Award },
		{ id: 3, title: "Schedule & Events", icon: CalendarIcon },
		{ id: 4, title: "Settings & Resources", icon: Users },
		{ id: 5, title: "Review & Publish", icon: Eye },
	];

	const addLesson = () => {
		const newLesson: Lesson = {
			id: `lesson-${Date.now()}`,
			title: "",
			description: "",
			content: "",
			duration: 30,
			order: courseData.lessons.length + 1,
			isPreview: false,
			resources: [],
		};
		setCourseData((prev) => ({
			...prev,
			lessons: [...prev.lessons, newLesson],
		}));
	};

	const updateLesson = (id: string, updates: Partial<Lesson>) => {
		setCourseData((prev) => ({
			...prev,
			lessons: prev.lessons.map((lesson) =>
				lesson.id === id ? { ...lesson, ...updates } : lesson,
			),
		}));
	};

	const removeLesson = (id: string) => {
		setCourseData((prev) => ({
			...prev,
			lessons: prev.lessons.filter((lesson) => lesson.id !== id),
		}));
	};

	const addAssignment = () => {
		const newAssignment: Assignment = {
			id: `assignment-${Date.now()}`,
			title: "",
			description: "",
			maxPoints: 100,
			instructions: "",
		};
		setCourseData((prev) => ({
			...prev,
			assignments: [...prev.assignments, newAssignment],
		}));
	};

	const addTest = () => {
		const newTest: Test = {
			id: `test-${Date.now()}`,
			title: "",
			description: "",
			timeLimit: 60,
			questions: [],
		};
		setCourseData((prev) => ({
			...prev,
			tests: [...prev.tests, newTest],
		}));
	};

	const addCalendarEvent = () => {
		const newEvent: CalendarEvent = {
			id: `event-${Date.now()}`,
			title: "",
			description: "",
			date: new Date(),
			type: "lecture",
		};
		setCourseData((prev) => ({
			...prev,
			calendarEvents: [...prev.calendarEvents, newEvent],
		}));
	};

	const handleCreateCourse = async () => {
		if (!courseData.title.trim() || !courseData.description.trim()) {
			toast.error("Please fill in required fields");
			return;
		}

		try {
			const upsertPayload = {
				title: courseData.title,
				description: courseData.description,
				category: courseData.category,
				level: courseData.level,
				duration: courseData.duration,
				price: courseData.price,
				thumbnail: courseData.thumbnail,
				tags: courseData.tags,
				requirements: courseData.requirements,
				whatYouWillLearn: courseData.whatYouWillLearn,
			} as const;

			const courseId: Id<"courses"> =
				isEditing && initialCourse?._id
					? await updateCourse({
							courseId: initialCourse._id,
							...upsertPayload,
						})
					: await createCourse(upsertPayload);

			// Create lessons sequentially (only for new courses or if lessons were added)
			if (!isEditing) {
				for (const lesson of courseData.lessons) {
					await createLesson({
						courseId,
						title: lesson.title,
						description: lesson.description,
						content: lesson.content,
						videoUrl: lesson.videoUrl,
						duration: lesson.duration,
						order: lesson.order,
						isPreview: lesson.isPreview,
						resources: lesson.resources,
					});
				}
			}

			toast.success(
				isEditing
					? "Course updated successfully!"
					: "Course created successfully with all content!",
			);

			// Redirect to course page after successful creation/update
			router.push(`/courses/${courseId}`);
		} catch (error) {
			toast.error(
				isEditing ? "Failed to update course" : "Failed to create course",
			);
			console.error(error);
		}
	};

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label htmlFor="title">Course Title *</Label>
								<Input
									id="title"
									value={courseData.title}
									onChange={(e) =>
										setCourseData((prev) => ({
											...prev,
											title: e.target.value,
										}))
									}
									placeholder="e.g., Advanced Mathematics for Form 4"
								/>
							</div>
							<div>
								<Label htmlFor="category">Category *</Label>
								<Select
									value={courseData.category}
									onValueChange={(value) =>
										setCourseData((prev) => ({ ...prev, category: value }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Mathematics">Mathematics</SelectItem>
										<SelectItem value="Science">Science</SelectItem>
										<SelectItem value="English">English</SelectItem>
										<SelectItem value="History">History</SelectItem>
										<SelectItem value="Computer Science">
											Computer Science
										</SelectItem>
										<SelectItem value="Art">Art</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="description">Course Description *</Label>
							<Textarea
								id="description"
								value={courseData.description}
								onChange={(e) =>
									setCourseData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Provide a comprehensive description of your course..."
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div>
								<Label htmlFor="level">Difficulty Level</Label>
								<Select
									value={courseData.level}
									onValueChange={(
										value: "beginner" | "intermediate" | "advanced",
									) => setCourseData((prev) => ({ ...prev, level: value }))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="beginner">Beginner</SelectItem>
										<SelectItem value="intermediate">Intermediate</SelectItem>
										<SelectItem value="advanced">Advanced</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="duration">Duration</Label>
								<Input
									id="duration"
									value={courseData.duration}
									onChange={(e) =>
										setCourseData((prev) => ({
											...prev,
											duration: e.target.value,
										}))
									}
									placeholder="e.g., 12 weeks"
								/>
							</div>
							<div>
								<Label htmlFor="price">Price (KES)</Label>
								<Input
									id="price"
									type="number"
									value={courseData.price}
									onChange={(e) =>
										setCourseData((prev) => ({
											...prev,
											price: Number(e.target.value),
										}))
									}
									placeholder="0"
								/>
							</div>
						</div>

						<div>
							<Label>Course Tags</Label>
							<div className="mt-2 flex flex-wrap gap-2">
								{courseData.tags.map((tag, index) => (
									<Badge
										key={index}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{tag}
										<button
											onClick={() =>
												setCourseData((prev) => ({
													...prev,
													tags: prev.tags.filter((_, i) => i !== index),
												}))
											}
											className="ml-1 text-xs"
										>
											×
										</button>
									</Badge>
								))}
							</div>
							<Input
								className="mt-2"
								placeholder="Add tags (press Enter)"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										const value = e.currentTarget.value.trim();
										if (value && !courseData.tags.includes(value)) {
											setCourseData((prev) => ({
												...prev,
												tags: [...prev.tags, value],
											}));
											e.currentTarget.value = "";
										}
									}
								}}
							/>
						</div>
					</div>
				);

			case 1:
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-lg">Course Lessons</h3>
							<Button onClick={addLesson}>
								<Plus className="mr-2 h-4 w-4" />
								Add Lesson
							</Button>
						</div>

						<div className="space-y-4">
							{courseData.lessons.map((lesson, index) => (
								<Card key={lesson.id}>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<CardTitle className="text-sm">
												Lesson {index + 1}
											</CardTitle>
											<Button
												variant="outline"
												size="sm"
												onClick={() => removeLesson(lesson.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Lesson Title</Label>
												<Input
													value={lesson.title}
													onChange={(e) =>
														updateLesson(lesson.id, { title: e.target.value })
													}
													placeholder="e.g., Introduction to Quadratic Equations"
												/>
											</div>
											<div>
												<Label>Duration (minutes)</Label>
												<Input
													type="number"
													value={lesson.duration}
													onChange={(e) =>
														updateLesson(lesson.id, {
															duration: Number(e.target.value),
														})
													}
												/>
											</div>
										</div>

										<div>
											<Label>Description</Label>
											<Textarea
												value={lesson.description}
												onChange={(e) =>
													updateLesson(lesson.id, {
														description: e.target.value,
													})
												}
												placeholder="Brief description of the lesson"
												rows={2}
											/>
										</div>

										<div>
											<Label>Lesson Content</Label>
											<Textarea
												value={lesson.content}
												onChange={(e) =>
													updateLesson(lesson.id, { content: e.target.value })
												}
												placeholder="Detailed lesson content, notes, and materials"
												rows={4}
											/>
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Video URL (optional)</Label>
												<Input
													value={lesson.videoUrl || ""}
													onChange={(e) =>
														updateLesson(lesson.id, {
															videoUrl: e.target.value,
														})
													}
													placeholder="https://youtube.com/watch?v=..."
												/>
											</div>
											<div className="flex items-center space-x-2">
												<Switch
													checked={lesson.isPreview}
													onCheckedChange={(checked) =>
														updateLesson(lesson.id, { isPreview: checked })
													}
												/>
												<Label>Free Preview</Label>
											</div>
										</div>
									</CardContent>
								</Card>
							))}

							{courseData.lessons.length === 0 && (
								<Card>
									<CardContent className="py-12 text-center">
										<BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
										<h3 className="mb-2 font-medium text-lg">No lessons yet</h3>
										<p className="mb-4 text-muted-foreground">
											Add your first lesson to get started
										</p>
										<Button onClick={addLesson}>
											<Plus className="mr-2 h-4 w-4" />
											Add First Lesson
										</Button>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<Tabs defaultValue="assignments" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="assignments">Assignments</TabsTrigger>
								<TabsTrigger value="tests">Tests & Quizzes</TabsTrigger>
							</TabsList>

							<TabsContent value="assignments" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-lg">Course Assignments</h3>
									<Button onClick={addAssignment}>
										<Plus className="mr-2 h-4 w-4" />
										Add Assignment
									</Button>
								</div>

								{courseData.assignments.map((assignment, index) => (
									<Card key={assignment.id}>
										<CardHeader>
											<CardTitle className="text-sm">
												Assignment {index + 1}
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div>
													<Label>Assignment Title</Label>
													<Input
														value={assignment.title}
														onChange={(e) =>
															setCourseData((prev) => ({
																...prev,
																assignments: prev.assignments.map((a) =>
																	a.id === assignment.id
																		? { ...a, title: e.target.value }
																		: a,
																),
															}))
														}
														placeholder="e.g., Solve Quadratic Equations Worksheet"
													/>
												</div>
												<div>
													<Label>Max Points</Label>
													<Input
														type="number"
														value={assignment.maxPoints}
														onChange={(e) =>
															setCourseData((prev) => ({
																...prev,
																assignments: prev.assignments.map((a) =>
																	a.id === assignment.id
																		? {
																				...a,
																				maxPoints: Number(e.target.value),
																			}
																		: a,
																),
															}))
														}
													/>
												</div>
											</div>

											<div>
												<Label>Description</Label>
												<Textarea
													value={assignment.description}
													onChange={(e) =>
														setCourseData((prev) => ({
															...prev,
															assignments: prev.assignments.map((a) =>
																a.id === assignment.id
																	? { ...a, description: e.target.value }
																	: a,
															),
														}))
													}
													placeholder="Assignment description and objectives"
													rows={3}
												/>
											</div>

											<div>
												<Label>Instructions</Label>
												<Textarea
													value={assignment.instructions}
													onChange={(e) =>
														setCourseData((prev) => ({
															...prev,
															assignments: prev.assignments.map((a) =>
																a.id === assignment.id
																	? { ...a, instructions: e.target.value }
																	: a,
															),
														}))
													}
													placeholder="Detailed instructions for students"
													rows={4}
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</TabsContent>

							<TabsContent value="tests" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-lg">Tests & Quizzes</h3>
									<Button onClick={addTest}>
										<Plus className="mr-2 h-4 w-4" />
										Add Test
									</Button>
								</div>

								{courseData.tests.map((test, index) => (
									<Card key={test.id}>
										<CardHeader>
											<CardTitle className="text-sm">
												Test {index + 1}
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div>
													<Label>Test Title</Label>
													<Input
														value={test.title}
														onChange={(e) =>
															setCourseData((prev) => ({
																...prev,
																tests: prev.tests.map((t) =>
																	t.id === test.id
																		? { ...t, title: e.target.value }
																		: t,
																),
															}))
														}
														placeholder="e.g., Mid-term Mathematics Test"
													/>
												</div>
												<div>
													<Label>Time Limit (minutes)</Label>
													<Input
														type="number"
														value={test.timeLimit}
														onChange={(e) =>
															setCourseData((prev) => ({
																...prev,
																tests: prev.tests.map((t) =>
																	t.id === test.id
																		? {
																				...t,
																				timeLimit: Number(e.target.value),
																			}
																		: t,
																),
															}))
														}
													/>
												</div>
											</div>

											<div>
												<Label>Description</Label>
												<Textarea
													value={test.description}
													onChange={(e) =>
														setCourseData((prev) => ({
															...prev,
															tests: prev.tests.map((t) =>
																t.id === test.id
																	? { ...t, description: e.target.value }
																	: t,
															),
														}))
													}
													placeholder="Test description and coverage"
													rows={3}
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</TabsContent>
						</Tabs>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Course Schedule</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Start Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!courseData.startDate && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{courseData.startDate
														? format(courseData.startDate, "PPP")
														: "Pick a date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={courseData.startDate}
													onSelect={(date) =>
														setCourseData((prev) => ({
															...prev,
															startDate: date,
														}))
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div>
										<Label>End Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!courseData.endDate && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{courseData.endDate
														? format(courseData.endDate, "PPP")
														: "Pick a date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={courseData.endDate}
													onSelect={(date) =>
														setCourseData((prev) => ({
															...prev,
															endDate: date,
														}))
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm">Calendar Events</CardTitle>
										<Button size="sm" onClick={addCalendarEvent}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{courseData.calendarEvents.map((event, index) => (
											<div
												key={event.id}
												className="flex items-center justify-between rounded border p-2"
											>
												<div>
													<p className="font-medium text-sm">
														{event.title || `Event ${index + 1}`}
													</p>
													<p className="text-muted-foreground text-xs">
														{format(event.date, "PPP")}
													</p>
												</div>
												<Badge variant="outline">{event.type}</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Course Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div>
										<Label>Maximum Students</Label>
										<Input
											type="number"
											value={courseData.maxStudents}
											onChange={(e) =>
												setCourseData((prev) => ({
													...prev,
													maxStudents: Number(e.target.value),
												}))
											}
											placeholder="0 for unlimited"
										/>
									</div>
									<div className="space-y-4">
										<div className="flex items-center space-x-2">
											<Switch
												checked={courseData.isPublic}
												onCheckedChange={(checked) =>
													setCourseData((prev) => ({
														...prev,
														isPublic: checked,
													}))
												}
											/>
											<Label>Public Course</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Switch
												checked={courseData.allowDiscussions}
												onCheckedChange={(checked) =>
													setCourseData((prev) => ({
														...prev,
														allowDiscussions: checked,
													}))
												}
											/>
											<Label>Allow Discussions</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Switch
												checked={courseData.certificateEnabled}
												onCheckedChange={(checked) =>
													setCourseData((prev) => ({
														...prev,
														certificateEnabled: checked,
													}))
												}
											/>
											<Label>Issue Certificates</Label>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Additional Resources</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label>Past Papers</Label>
									<Button
										variant="outline"
										className="mt-2 w-full bg-transparent"
										onClick={() => {
											const newPaper = {
												title: "",
												url: "",
												year: new Date().getFullYear().toString(),
											};
											setCourseData((prev) => ({
												...prev,
												pastPapers: [...prev.pastPapers, newPaper],
											}));
										}}
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Past Paper
									</Button>
								</div>

								<div>
									<Label>Achievements & Badges</Label>
									<Button
										variant="outline"
										className="mt-2 w-full bg-transparent"
										onClick={() => {
											const newAchievement = {
												title: "",
												description: "",
												criteria: "",
											};
											setCourseData((prev) => ({
												...prev,
												achievements: [...prev.achievements, newAchievement],
											}));
										}}
									>
										<Award className="mr-2 h-4 w-4" />
										Add Achievement
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case 5:
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Course Summary</CardTitle>
								<CardDescription>
									Review your course before publishing
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div>
										<h4 className="font-semibold">Basic Information</h4>
										<p className="text-muted-foreground text-sm">
											Title: {courseData.title}
										</p>
										<p className="text-muted-foreground text-sm">
											Category: {courseData.category}
										</p>
										<p className="text-muted-foreground text-sm">
											Level: {courseData.level}
										</p>
										<p className="text-muted-foreground text-sm">
											Duration: {courseData.duration}
										</p>
										<p className="text-muted-foreground text-sm">
											Price: KES {courseData.price}
										</p>
									</div>
									<div>
										<h4 className="font-semibold">Content Overview</h4>
										<p className="text-muted-foreground text-sm">
											Lessons: {courseData.lessons.length}
										</p>
										<p className="text-muted-foreground text-sm">
											Assignments: {courseData.assignments.length}
										</p>
										<p className="text-muted-foreground text-sm">
											Tests: {courseData.tests.length}
										</p>
										<p className="text-muted-foreground text-sm">
											Calendar Events: {courseData.calendarEvents.length}
										</p>
									</div>
								</div>

								<div>
									<h4 className="font-semibold">Course Description</h4>
									<p className="text-muted-foreground text-sm">
										{courseData.description}
									</p>
								</div>

								{courseData.tags.length > 0 && (
									<div>
										<h4 className="font-semibold">Tags</h4>
										<div className="mt-2 flex flex-wrap gap-2">
											{courseData.tags.map((tag, index) => (
												<Badge key={index} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<div className="flex justify-center space-x-4">
							<Button variant="outline" size="lg">
								<Save className="mr-2 h-4 w-4" />
								Save as Draft
							</Button>
							<Button size="lg" onClick={handleCreateCourse}>
								<Send className="mr-2 h-4 w-4" />
								{isEditing ? "Save Changes" : "Create & Publish Course"}
							</Button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="mx-auto max-w-6xl p-6">
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl">
					{isEditing ? "Edit Course" : "Create Comprehensive Course"}
				</h1>
				<p className="text-muted-foreground">
					{isEditing
						? "Update your course with new content and settings"
						: "Build a complete learning experience with lessons, assessments, and resources"}
				</p>
			</div>

			{/* Step Navigation */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => (
						<div key={step.id} className="flex items-center">
							<div
								className={cn(
									"flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2",
									activeStep === step.id
										? "border-primary bg-primary text-primary-foreground"
										: activeStep > step.id
											? "border-green-600 bg-green-600 text-white"
											: "border-muted-foreground text-muted-foreground",
								)}
								onClick={() => setActiveStep(step.id)}
							>
								<step.icon className="h-5 w-5" />
							</div>
							{index < steps.length - 1 && (
								<div
									className={cn(
										"mx-2 h-0.5 w-16",
										activeStep > step.id ? "bg-green-600" : "bg-muted",
									)}
								/>
							)}
						</div>
					))}
				</div>
				<div className="mt-4 text-center">
					<h2 className="font-semibold text-xl">{steps[activeStep].title}</h2>
				</div>
			</div>

			{/* Step Content */}
			<Card className="min-h-[600px]">
				<CardContent className="p-6">{renderStepContent()}</CardContent>
			</Card>

			{/* Navigation Buttons */}
			<div className="mt-6 flex justify-between">
				<Button
					variant="outline"
					onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
					disabled={activeStep === 0}
				>
					Previous
				</Button>
				<Button
					onClick={() =>
						setActiveStep(Math.min(steps.length - 1, activeStep + 1))
					}
					disabled={activeStep === steps.length - 1}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
