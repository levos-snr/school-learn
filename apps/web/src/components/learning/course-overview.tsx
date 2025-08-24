"use client";

import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { Award, BookOpen, Clock, Play, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Lesson {
	_id: Id<"lessons">;
	title: string;
	description: string;
	duration: number;
	isCompleted: boolean;
	canAccess: boolean;
	isPreview: boolean;
}

interface Course {
	title: string;
	description: string;
	category: string;
	level: string;
	duration: string;
}

interface CourseOverviewProps {
	course: Course;
	lessons: Lesson[];
	isEnrolled: boolean;
	progressPercentage: number;
	completedLessons: number;
	totalLessons: number;
	onLessonSelect: (lessonId: Id<"lessons">) => void;
}

export function CourseOverview({
	course,
	lessons,
	isEnrolled,
	progressPercentage,
	completedLessons,
	totalLessons,
	onLessonSelect,
}: CourseOverviewProps) {
	return (
		<div className="space-y-6">
			{/* Course Overview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl">{course.title}</CardTitle>
							<CardDescription className="mt-2">
								{course.description}
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline">{course.category}</Badge>
							<Badge variant="outline">{course.level}</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<div className="flex items-center gap-2">
							<BookOpen className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{totalLessons} lessons</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{course.duration}</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">0 students</span>
						</div>
						<div className="flex items-center gap-2">
							<Award className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">Certificate</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Progress Card */}
			{isEnrolled && (
				<Card>
					<CardHeader>
						<CardTitle>Your Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<div className="mb-2 flex justify-between text-sm">
									<span>Course Completion</span>
									<span>{Math.round(progressPercentage)}%</span>
								</div>
								<Progress value={progressPercentage} className="h-3" />
							</div>
							<div className="text-muted-foreground text-sm">
								{completedLessons} of {totalLessons} lessons completed
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Lessons Grid */}
			<Card>
				<CardHeader>
					<CardTitle>Course Lessons</CardTitle>
					<CardDescription>
						Click on any lesson to start learning
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{lessons.map((lesson, index) => (
							<Card
								key={lesson._id}
								className={`cursor-pointer transition-all hover:shadow-md ${
									!lesson.canAccess ? "opacity-50" : ""
								}`}
								onClick={() => {
									if (lesson.canAccess) {
										onLessonSelect(lesson._id);
									}
								}}
							>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
												{lesson.isCompleted ? (
													<Award className="h-4 w-4 text-green-500" />
												) : lesson.canAccess ? (
													<Play className="h-4 w-4 text-primary" />
												) : (
													<BookOpen className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
											<div>
												<h4 className="font-medium">
													Lesson {index + 1}: {lesson.title}
												</h4>
												<p className="text-muted-foreground text-sm">
													{lesson.description}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												{lesson.duration}m
											</Badge>
											{lesson.isCompleted && (
												<Badge
													variant="default"
													className="bg-green-500 text-xs"
												>
													Completed
												</Badge>
											)}
											{lesson.isPreview && (
												<Badge variant="secondary" className="text-xs">
													Preview
												</Badge>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
