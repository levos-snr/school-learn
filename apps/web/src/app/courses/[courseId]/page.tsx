"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	Award,
	BookOpen,
	CheckCircle,
	Clock,
	Play,
	Star,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoursePage() {
	const params = useParams();
	const courseId = params.courseId as string;

	const course = useQuery(api.courses.getCourseById, {
		courseId: courseId as any,
	});
	const lessons = useQuery(api.courses.getLessonsByCourse, {
		courseId: courseId as any,
	});
	const isEnrolled = useQuery(api.courses.isEnrolled, {
		courseId: courseId as any,
	});
	const user = useQuery(api.users.current);
	const discussions = useQuery(api.discussions.getCourseDiscussions, {
		courseId: courseId as any,
	});

	const enrollInCourse = useMutation(api.courses.enrollInCourse);

	const handleEnroll = async () => {
		try {
			const result = await enrollInCourse({ courseId: courseId as any });
			if (result.message === "Already enrolled in this course") {
				toast.info("You're already enrolled in this course!");
			} else {
				toast.success("Successfully enrolled in course!");
			}
		} catch (error) {
			toast.error("Failed to enroll in course");
		}
	};

	if (!course) {
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
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Course Header */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Badge variant="outline">{course.category}</Badge>
							<Badge variant="secondary">{course.level}</Badge>
						</div>

						<h1 className="font-bold text-3xl">{course.title}</h1>

						<p className="text-lg text-muted-foreground">
							{course.description}
						</p>

						<div className="flex items-center gap-6 text-muted-foreground text-sm">
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>{course.duration}</span>
							</div>
							<div className="flex items-center gap-1">
								<BookOpen className="h-4 w-4" />
								<span>{course.totalLessons} lessons</span>
							</div>
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								<span>0 students</span>
							</div>
							<div className="flex items-center gap-1">
								<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
								<span>4.5 (0 reviews)</span>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10">
								<AvatarImage src="/placeholder.svg" />
								<AvatarFallback>IN</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">Instructor Name</p>
								<p className="text-muted-foreground text-sm">
									Course Instructor
								</p>
							</div>
						</div>
					</div>

					{/* Course Content Tabs */}
					<Tabs defaultValue="overview" className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="curriculum">Curriculum</TabsTrigger>
							<TabsTrigger value="discussions">Discussions</TabsTrigger>
							<TabsTrigger value="reviews">Reviews</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>What you'll learn</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{course.whatYouWillLearn.map((item, index) => (
											<li key={index} className="flex items-start gap-2">
												<CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
												<span>{item}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Requirements</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{course.requirements.map((requirement, index) => (
											<li key={index} className="flex items-start gap-2">
												<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-muted-foreground" />
												<span>{requirement}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="curriculum" className="space-y-4">
							{lessons?.map((lesson, index) => (
								<Card key={lesson._id}>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
													<span className="font-medium text-sm">
														{index + 1}
													</span>
												</div>
												<div>
													<h4 className="font-medium">{lesson.title}</h4>
													<p className="text-muted-foreground text-sm">
														{lesson.description}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground text-sm">
													{lesson.duration} min
												</span>
												{lesson.isPreview ? (
													<Button variant="outline" size="sm">
														<Play className="mr-1 h-4 w-4" />
														Preview
													</Button>
												) : isEnrolled ? (
													<Button variant="outline" size="sm">
														<Play className="mr-1 h-4 w-4" />
														Start
													</Button>
												) : (
													<Button variant="outline" size="sm" disabled>
														<Play className="mr-1 h-4 w-4" />
														Locked
													</Button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value="discussions" className="space-y-4">
							{discussions?.map((discussion) => (
								<Card key={discussion._id}>
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage
													src={discussion.userImage || "/placeholder.svg"}
												/>
												<AvatarFallback>
													{discussion.userName.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="mb-1 flex items-center gap-2">
													<span className="font-medium">
														{discussion.userName}
													</span>
													<Badge variant="outline" className="text-xs">
														{discussion.type}
													</Badge>
													{discussion.isPinned && (
														<Badge variant="secondary" className="text-xs">
															Pinned
														</Badge>
													)}
												</div>
												<h4 className="mb-1 font-medium">{discussion.title}</h4>
												<p className="mb-2 text-muted-foreground text-sm">
													{discussion.content}
												</p>
												<div className="flex items-center gap-4 text-muted-foreground text-xs">
													<span>
														{new Date(
															discussion.createdAt,
														).toLocaleDateString()}
													</span>
													<span>{discussion.replyCount} replies</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value="reviews">
							<Card>
								<CardContent className="p-8 text-center">
									<Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
									<h3 className="mb-2 font-medium text-lg">No reviews yet</h3>
									<p className="text-muted-foreground">
										Be the first to review this course
									</p>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Enrollment Card */}
					<Card>
						<CardContent className="p-6">
							<div className="space-y-4">
								<div className="text-center">
									{course.price > 0 ? (
										<div className="font-bold text-3xl">${course.price}</div>
									) : (
										<div className="font-bold text-3xl text-green-600">
											Free
										</div>
									)}
								</div>

								{isEnrolled ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between text-sm">
											<span>Progress</span>
											<span>0%</span>
										</div>
										<Progress value={0} className="h-2" />
										<Link href={`/courses/${courseId}/learn`}>
											<Button className="w-full cursor-pointer">
												Continue Learning
											</Button>
										</Link>
									</div>
								) : (
									<Button
										className="w-full cursor-pointer"
										onClick={handleEnroll}
									>
										Enroll Now
									</Button>
								)}

								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span>Duration</span>
										<span>{course.duration}</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Lessons</span>
										<span>{course.totalLessons}</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Level</span>
										<span className="capitalize">{course.level}</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Certificate</span>
										<Award className="h-4 w-4" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Course Tags */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Tags</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{course.tags.map((tag) => (
									<Badge key={tag} variant="outline">
										{tag}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
