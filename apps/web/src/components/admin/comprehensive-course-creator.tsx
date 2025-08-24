"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
	Award,
	BookOpen,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	GripVertical,
	Plus,
	Target,
	Trash2,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Define Course type based on expected structure
interface Course {
	_id: Id<"courses">;
	title: string;
	description: string;
	category: string;
	level: "beginner" | "intermediate" | "advanced";
	price: number;
	duration: string;
	maxStudents: number;
	prerequisites: string;
	learningObjectives: string[];
	isPublished: boolean;
	allowDiscussions: boolean;
	certificateEnabled: boolean;
	enrollmentDeadline?: number;
}

interface CourseCreatorProps {
	onClose?: () => void;
	userRole?: "admin" | "instructor";
	initialCourse?: Course | null;
	isEditing?: boolean;
}

interface Lesson {
	id: string;
	title: string;
	description: string;
	duration: number;
	videoUrl?: string;
	materials?: string[];
	order: number;
}

interface Assignment {
	id: string;
	title: string;
	description: string;
	dueDate: Date;
	points: number;
	type: "essay" | "quiz" | "project" | "presentation";
}

interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	date: Date;
	type: "lecture" | "assignment" | "exam" | "discussion";
}

export default function ComprehensiveCourseCreator({
	onClose,
	userRole = "instructor",
	initialCourse = null,
	isEditing = false,
}: CourseCreatorProps) {
	const createCourse = useMutation(api.courses.createCourse);
	const updateCourse = useMutation(api.courses.updateCourse);
	const [isCreating, setIsCreating] = useState(false);

	const [currentStep, setCurrentStep] = useState(1);
	const [courseData, setCourseData] = useState({
		title: "",
		description: "",
		category: "",
		level: "beginner" as "beginner" | "intermediate" | "advanced",
		price: 0,
		duration: "",
		maxStudents: 0,
		prerequisites: "",
		learningObjectives: [""],
		isPublished: false,
		allowDiscussions: true,
		certificateEnabled: true,
		enrollmentDeadline: null as Date | null,
	});

	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

	// Initialize form data when editing
	useEffect(() => {
		if (isEditing && initialCourse) {
			setCourseData({
				title: initialCourse.title || "",
				description: initialCourse.description || "",
				category: initialCourse.category || "",
				level: initialCourse.level || "beginner",
				price: initialCourse.price || 0,
				duration: initialCourse.duration || "",
				maxStudents: initialCourse.maxStudents || 0,
				prerequisites: initialCourse.prerequisites || "",
				learningObjectives:
					initialCourse.learningObjectives?.length > 0
						? initialCourse.learningObjectives
						: [""],
				isPublished: initialCourse.isPublished || false,
				allowDiscussions: initialCourse.allowDiscussions ?? true,
				certificateEnabled: initialCourse.certificateEnabled ?? true,
				enrollmentDeadline: initialCourse.enrollmentDeadline
					? new Date(initialCourse.enrollmentDeadline)
					: null,
			});
		}
	}, [isEditing, initialCourse]);

	const addLesson = () => {
		const newLesson: Lesson = {
			id: `lesson-${Date.now()}`,
			title: "",
			description: "",
			duration: 30,
			order: lessons.length + 1,
		};
		setLessons([...lessons, newLesson]);
	};

	const updateLesson = (id: string, updates: Partial<Lesson>) => {
		setLessons(
			lessons.map((lesson) =>
				lesson.id === id ? { ...lesson, ...updates } : lesson,
			),
		);
	};

	const removeLesson = (id: string) => {
		setLessons(lessons.filter((lesson) => lesson.id !== id));
	};

	const addAssignment = () => {
		const newAssignment: Assignment = {
			id: `assignment-${Date.now()}`,
			title: "",
			description: "",
			dueDate: new Date(),
			points: 100,
			type: "essay",
		};
		setAssignments([...assignments, newAssignment]);
	};

	const updateAssignment = (id: string, updates: Partial<Assignment>) => {
		setAssignments(
			assignments.map((assignment) =>
				assignment.id === id ? { ...assignment, ...updates } : assignment,
			),
		);
	};

	const removeAssignment = (id: string) => {
		setAssignments(assignments.filter((assignment) => assignment.id !== id));
	};

	const addCalendarEvent = () => {
		const newEvent: CalendarEvent = {
			id: `event-${Date.now()}`,
			title: "",
			description: "",
			date: new Date(),
			type: "lecture",
		};
		setCalendarEvents([...calendarEvents, newEvent]);
	};

	const handleSubmit = async () => {
		if (!courseData.title || !courseData.description || !courseData.category) {
			toast.error(
				"Please fill in all required fields (title, description, category)",
			);
			return;
		}

		setIsCreating(true);
		try {
			if (isEditing && initialCourse) {
				console.log("[v0] Updating course with data:", {
					courseData,
					lessons,
					assignments,
					calendarEvents,
				});

				await updateCourse({
					courseId: initialCourse._id,
					title: courseData.title,
					description: courseData.description,
					category: courseData.category,
					level: courseData.level,
					price: courseData.price,
					duration: courseData.duration,
					maxStudents: courseData.maxStudents,
					prerequisites: courseData.prerequisites,
					learningObjectives: courseData.learningObjectives.filter(
						(obj) => obj.trim() !== "",
					),
					isPublished: courseData.isPublished,
					allowDiscussions: courseData.allowDiscussions,
					certificateEnabled: courseData.certificateEnabled,
					enrollmentDeadline: courseData.enrollmentDeadline?.getTime(),
				});

				console.log("[v0] Course updated successfully");
				toast.success("Course updated successfully!");
			} else {
				console.log("[v0] Creating course with data:", {
					courseData,
					lessons,
					assignments,
					calendarEvents,
				});

				const courseId = await createCourse({
					title: courseData.title,
					description: courseData.description,
					category: courseData.category,
					level: courseData.level,
					price: courseData.price,
					duration: courseData.duration,
					maxStudents: courseData.maxStudents,
					prerequisites: courseData.prerequisites,
					learningObjectives: courseData.learningObjectives.filter(
						(obj) => obj.trim() !== "",
					),
					isPublished: courseData.isPublished,
					allowDiscussions: courseData.allowDiscussions,
					certificateEnabled: courseData.certificateEnabled,
					enrollmentDeadline: courseData.enrollmentDeadline?.getTime(),
				});

				console.log("[v0] Course created successfully with ID:", courseId);
				toast.success("Course created successfully!");
			}

			if (onClose) onClose();
		} catch (error) {
			console.error(
				`[v0] Failed to ${isEditing ? "update" : "create"} course:`,
				error,
			);
			toast.error(
				`Failed to ${isEditing ? "update" : "create"} course. Please try again.`,
			);
		} finally {
			setIsCreating(false);
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && onClose) {
			onClose();
		}
	};

	const steps = [
		{ id: 1, title: "Basic Info", icon: BookOpen },
		{ id: 2, title: "Curriculum", icon: FileText },
		{ id: 3, title: "Assessments", icon: Target },
		{ id: 4, title: "Schedule", icon: Calendar },
		{ id: 5, title: "Settings", icon: Users },
		{ id: 6, title: "Review", icon: Award },
	];

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onClick={handleBackdropClick}
		>
			<div className="max-h-[95vh] w-full max-w-7xl overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background via-card to-muted/20 shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 border-border border-b bg-card/95 p-6 backdrop-blur-md">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-fun shadow-lg">
								<BookOpen className="h-6 w-6 text-primary-foreground" />
							</div>
							<div>
								<h1 className="font-bold text-2xl text-foreground">
									{isEditing ? "Edit Course" : "Create New Course"}
								</h1>
								<p className="text-muted-foreground">
									{userRole === "admin"
										? "Admin Panel"
										: "Instructor Dashboard"}
								</p>
							</div>
						</div>
						{onClose && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onClose}
								className="h-10 w-10 transition-colors hover:bg-destructive/10 hover:text-destructive"
							>
								<X className="h-5 w-5" />
							</Button>
						)}
					</div>
				</div>

				{/* Content */}
				<div className="flex h-full max-h-[calc(95vh-100px)] overflow-hidden">
					{/* Sidebar Navigation */}
					<div className="w-80 overflow-y-auto border-border border-r bg-card/50 p-6 backdrop-blur-sm">
						<div className="space-y-6">
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-lg">
									{isEditing ? "Edit Course" : "Course Setup"}
								</h3>
								<p className="text-muted-foreground text-sm">
									Step {currentStep} of {steps.length}
								</p>
							</div>

							<div className="space-y-2">
								{steps.map((step) => (
									<Button
										key={step.id}
										variant={currentStep === step.id ? "default" : "ghost"}
										className={`h-12 w-full justify-start gap-3 transition-all ${
											currentStep === step.id
												? "bg-primary text-primary-foreground shadow-md"
												: "hover:bg-accent hover:text-accent-foreground"
										}`}
										onClick={() => setCurrentStep(step.id)}
									>
										<step.icon className="h-5 w-5" />
										<div className="text-left">
											<div className="font-medium">{step.title}</div>
											{currentStep > step.id && (
												<div className="text-success text-xs">✓ Completed</div>
											)}
										</div>
									</Button>
								))}
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1 overflow-y-auto">
						<div className="p-6">
							{/* Step 1: Basic Information */}
							{currentStep === 1 && (
								<div className="space-y-6">
									<div>
										<h2 className="mb-2 font-bold text-2xl text-foreground">
											Course Information
										</h2>
										<p className="mb-6 text-muted-foreground">
											Basic details about your course
										</p>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="title">Course Title *</Label>
											<Input
												id="title"
												placeholder="e.g., Advanced React Development"
												value={courseData.title}
												onChange={(e) =>
													setCourseData({
														...courseData,
														title: e.target.value,
													})
												}
												className="h-12"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="category">Category *</Label>
											<select
												value={courseData.category}
												onChange={(e) =>
													setCourseData({
														...courseData,
														category: e.target.value,
													})
												}
												className="h-12 w-full rounded-md border border-border bg-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
											>
												<option value="">Select category</option>
												<option value="Computer Science">
													Computer Science
												</option>
												<option value="Mathematics">Mathematics</option>
												<option value="Science">Science</option>
												<option value="English">English</option>
												<option value="History">History</option>
												<option value="Business">Business</option>
											</select>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description *</Label>
										<Textarea
											id="description"
											placeholder="Describe what students will learn in this course..."
											value={courseData.description}
											onChange={(e) =>
												setCourseData({
													...courseData,
													description: e.target.value,
												})
											}
											rows={4}
											className="resize-none"
										/>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<div className="space-y-2">
											<Label htmlFor="level">Difficulty Level</Label>
											<select
												value={courseData.level}
												onChange={(e) =>
													setCourseData({
														...courseData,
														level: e.target.value as any,
													})
												}
												className="h-12 w-full rounded-md border border-border bg-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
											>
												<option value="beginner">Beginner</option>
												<option value="intermediate">Intermediate</option>
												<option value="advanced">Advanced</option>
											</select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="duration">Duration</Label>
											<Input
												id="duration"
												placeholder="e.g., 8 weeks"
												value={courseData.duration}
												onChange={(e) =>
													setCourseData({
														...courseData,
														duration: e.target.value,
													})
												}
												className="h-12"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="maxStudents">Max Students</Label>
											<Input
												id="maxStudents"
												type="number"
												placeholder="0 for unlimited"
												value={courseData.maxStudents}
												onChange={(e) =>
													setCourseData({
														...courseData,
														maxStudents: Number.parseInt(e.target.value) || 0,
													})
												}
												className="h-12"
											/>
										</div>
									</div>

									<div className="space-y-4">
										<Label>Learning Objectives</Label>
										{courseData.learningObjectives.map((objective, index) => (
											<div key={index} className="flex gap-2">
												<Input
													placeholder={`Learning objective ${index + 1}`}
													value={objective}
													onChange={(e) => {
														const newObjectives = [
															...courseData.learningObjectives,
														];
														newObjectives[index] = e.target.value;
														setCourseData({
															...courseData,
															learningObjectives: newObjectives,
														});
													}}
													className="h-12"
												/>
												{index === courseData.learningObjectives.length - 1 && (
													<Button
														type="button"
														variant="outline"
														size="icon"
														onClick={() =>
															setCourseData({
																...courseData,
																learningObjectives: [
																	...courseData.learningObjectives,
																	"",
																],
															})
														}
														className="h-12 w-12"
													>
														<Plus className="h-4 w-4" />
													</Button>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Step 2: Curriculum */}
							{currentStep === 2 && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="mb-2 font-bold text-2xl text-foreground">
												Course Curriculum
											</h2>
											<p className="text-muted-foreground">
												Add and organize lessons sequentially
											</p>
										</div>
										<Button onClick={addLesson} className="fun-button gap-2">
											<Plus className="h-4 w-4" />
											Add Lesson
										</Button>
									</div>

									<div className="space-y-4">
										{lessons.map((lesson, index) => (
											<div
												key={lesson.id}
												className="learning-card space-y-4 p-6"
											>
												<div className="flex items-center gap-3">
													<GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
													<Badge variant="outline" className="px-3 py-1">
														Lesson {lesson.order}
													</Badge>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => removeLesson(lesson.id)}
														className="ml-auto hover:bg-destructive/10 hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>

												<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
													<Input
														placeholder="Lesson title"
														value={lesson.title}
														onChange={(e) =>
															updateLesson(lesson.id, { title: e.target.value })
														}
														className="h-12"
													/>
													<div className="flex items-center gap-2">
														<Clock className="h-5 w-5 text-muted-foreground" />
														<Input
															type="number"
															placeholder="Duration (minutes)"
															value={lesson.duration}
															onChange={(e) =>
																updateLesson(lesson.id, {
																	duration:
																		Number.parseInt(e.target.value) || 0,
																})
															}
															className="h-12"
														/>
													</div>
												</div>

												<Textarea
													placeholder="Lesson description"
													value={lesson.description}
													onChange={(e) =>
														updateLesson(lesson.id, {
															description: e.target.value,
														})
													}
													rows={3}
													className="resize-none"
												/>

												<Input
													placeholder="Video URL (optional)"
													value={lesson.videoUrl || ""}
													onChange={(e) =>
														updateLesson(lesson.id, {
															videoUrl: e.target.value,
														})
													}
													className="h-12"
												/>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Step 3: Assessments */}
							{currentStep === 3 && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="mb-2 font-bold text-2xl text-foreground">
												Assessments & Assignments
											</h2>
											<p className="text-muted-foreground">
												Create assignments, quizzes, and projects
											</p>
										</div>
										<Button
											onClick={addAssignment}
											className="fun-button gap-2"
										>
											<Plus className="h-4 w-4" />
											Add Assignment
										</Button>
									</div>

									<div className="space-y-6">
										{assignments.map((assignment) => (
											<div
												key={assignment.id}
												className="learning-card space-y-6 p-6"
											>
												<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
													<Input
														placeholder="Assignment title"
														value={assignment.title}
														onChange={(e) =>
															updateAssignment(assignment.id, {
																title: e.target.value,
															})
														}
														className="h-12"
													/>
													<select
														value={assignment.type}
														onChange={(e) =>
															updateAssignment(assignment.id, {
																type: e.target.value as any,
															})
														}
														className="h-12 rounded-md border border-border bg-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
													>
														<option value="essay">Essay</option>
														<option value="quiz">Quiz</option>
														<option value="project">Project</option>
														<option value="presentation">Presentation</option>
													</select>
												</div>

												<Textarea
													placeholder="Assignment description"
													value={assignment.description}
													onChange={(e) =>
														updateAssignment(assignment.id, {
															description: e.target.value,
														})
													}
													rows={4}
													className="resize-none"
												/>

												<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
													<div className="space-y-2">
														<Label>Due Date</Label>
														<Input
															type="date"
															value={
																assignment.dueDate.toISOString().split("T")[0]
															}
															onChange={(e) =>
																updateAssignment(assignment.id, {
																	dueDate: new Date(e.target.value),
																})
															}
															className="h-12"
														/>
													</div>
													<div className="space-y-2">
														<Label>Points</Label>
														<Input
															type="number"
															value={assignment.points}
															onChange={(e) =>
																updateAssignment(assignment.id, {
																	points: Number.parseInt(e.target.value) || 0,
																})
															}
															className="h-12"
														/>
													</div>
												</div>

												<Button
													variant="outline"
													size="sm"
													onClick={() => removeAssignment(assignment.id)}
													className="text-destructive hover:bg-destructive/10 hover:text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Remove Assignment
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Step 4: Schedule */}
							{currentStep === 4 && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="mb-2 font-bold text-2xl text-foreground">
												Course Schedule
											</h2>
											<p className="text-muted-foreground">
												Set up important dates and events
											</p>
										</div>
										<Button
											onClick={addCalendarEvent}
											className="fun-button gap-2"
										>
											<Plus className="h-4 w-4" />
											Add Event
										</Button>
									</div>

									<div className="space-y-4">
										{calendarEvents.map((event) => (
											<div
												key={event.id}
												className="learning-card space-y-4 p-6"
											>
												<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
													<Input
														placeholder="Event title"
														value={event.title}
														onChange={(e) => {
															setCalendarEvents(
																calendarEvents.map((e) =>
																	e.id === event.id
																		? { ...e, title: e.target.value }
																		: e,
																),
															);
														}}
														className="h-12"
													/>
													<select
														value={event.type}
														onChange={(e) => {
															setCalendarEvents(
																calendarEvents.map((ev) =>
																	ev.id === event.id
																		? { ...ev, type: e.target.value as any }
																		: ev,
																),
															);
														}}
														className="h-12 rounded-md border border-border bg-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
													>
														<option value="lecture">Lecture</option>
														<option value="assignment">Assignment</option>
														<option value="exam">Exam</option>
														<option value="discussion">Discussion</option>
													</select>
												</div>
												<Input
													type="date"
													value={event.date.toISOString().split("T")[0]}
													onChange={(e) => {
														setCalendarEvents(
															calendarEvents.map((ev) =>
																ev.id === event.id
																	? { ...ev, date: new Date(e.target.value) }
																	: ev,
															),
														);
													}}
													className="h-12"
												/>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Step 5: Settings */}
							{currentStep === 5 && (
								<div className="space-y-6">
									<div>
										<h2 className="mb-2 font-bold text-2xl text-foreground">
											Course Settings
										</h2>
										<p className="text-muted-foreground">
											Configure advanced options
										</p>
									</div>

									<div className="space-y-6">
										<div className="flex items-center justify-between">
											<div>
												<Label className="font-medium text-base">
													Allow Discussions
												</Label>
												<p className="text-muted-foreground text-sm">
													Enable student discussions and forums
												</p>
											</div>
											<Switch
												checked={courseData.allowDiscussions}
												onCheckedChange={(checked) =>
													setCourseData({
														...courseData,
														allowDiscussions: checked,
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<div>
												<Label className="font-medium text-base">
													Certificate Enabled
												</Label>
												<p className="text-muted-foreground text-sm">
													Provide completion certificates
												</p>
											</div>
											<Switch
												checked={courseData.certificateEnabled}
												onCheckedChange={(checked) =>
													setCourseData({
														...courseData,
														certificateEnabled: checked,
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<div>
												<Label className="font-medium text-base">
													Publish Course
												</Label>
												<p className="text-muted-foreground text-sm">
													Make course visible to students
												</p>
											</div>
											<Switch
												checked={courseData.isPublished}
												onCheckedChange={(checked) =>
													setCourseData({ ...courseData, isPublished: checked })
												}
											/>
										</div>

										<div className="space-y-2">
											<Label>Prerequisites</Label>
											<Textarea
												placeholder="List any prerequisites for this course..."
												value={courseData.prerequisites}
												onChange={(e) =>
													setCourseData({
														...courseData,
														prerequisites: e.target.value,
													})
												}
												rows={3}
												className="resize-none"
											/>
										</div>
									</div>
								</div>
							)}

							{/* Step 6: Review */}
							{currentStep === 6 && (
								<div className="space-y-6">
									<div>
										<h2 className="mb-2 font-bold text-2xl text-foreground">
											Review & {isEditing ? "Update" : "Create"}
										</h2>
										<p className="text-muted-foreground">
											Review your course details before{" "}
											{isEditing ? "updating" : "creating"}
										</p>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<Card className="learning-card">
											<CardHeader>
												<CardTitle className="text-lg">
													Course Overview
												</CardTitle>
											</CardHeader>
											<CardContent className="space-y-2">
												<div>
													<strong>Title:</strong>{" "}
													{courseData.title || "Not specified"}
												</div>
												<div>
													<strong>Category:</strong>{" "}
													{courseData.category || "Not specified"}
												</div>
												<div>
													<strong>Level:</strong> {courseData.level}
												</div>
												<div>
													<strong>Duration:</strong>{" "}
													{courseData.duration || "Not specified"}
												</div>
												<div>
													<strong>Max Students:</strong>{" "}
													{courseData.maxStudents === 0
														? "Unlimited"
														: courseData.maxStudents}
												</div>
											</CardContent>
										</Card>

										<Card className="learning-card">
											<CardHeader>
												<CardTitle className="text-lg">
													Content Summary
												</CardTitle>
											</CardHeader>
											<CardContent className="space-y-2">
												<div>
													<strong>Lessons:</strong> {lessons.length}
												</div>
												<div>
													<strong>Assignments:</strong> {assignments.length}
												</div>
												<div>
													<strong>Calendar Events:</strong>{" "}
													{calendarEvents.length}
												</div>
												<div>
													<strong>Status:</strong>{" "}
													{courseData.isPublished ? "Published" : "Draft"}
												</div>
											</CardContent>
										</Card>
									</div>

									{courseData.description && (
										<Card className="learning-card">
											<CardHeader>
												<CardTitle className="text-lg">Description</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-muted-foreground">
													{courseData.description}
												</p>
											</CardContent>
										</Card>
									)}
								</div>
							)}

							{/* Navigation */}
							<div className="sticky bottom-0 mt-8 bg-gradient-to-t from-card via-card/95 to-transparent pt-8">
								<div className="flex items-center justify-between border-border border-t pt-6">
									<Button
										variant="outline"
										onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
										disabled={currentStep === 1}
										className="gap-2"
									>
										<ChevronLeft className="h-4 w-4" />
										Previous
									</Button>

									<div className="flex gap-2">
										{steps.map((step) => (
											<div
												key={step.id}
												className={`h-3 w-3 rounded-full transition-all ${
													step.id === currentStep
														? "scale-110 bg-primary shadow-md shadow-primary/25"
														: step.id < currentStep
															? "bg-success"
															: "bg-muted"
												}`}
											/>
										))}
									</div>

									<Button
										onClick={() => {
											if (currentStep === 6) {
												handleSubmit();
											} else {
												setCurrentStep(Math.min(6, currentStep + 1));
											}
										}}
										disabled={isCreating}
										className="fun-button cursor-pointer gap-2"
									>
										{currentStep === 6 ? (
											isCreating ? (
												`${isEditing ? "Updating" : "Creating"} Course...`
											) : (
												`${isEditing ? "Update" : "Create"} Course`
											)
										) : (
											<>
												Next
												<ChevronRight className="h-4 w-4" />
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
