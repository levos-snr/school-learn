"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Clock, Plus, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CourseCatalog } from "@/components/learning/course-catalog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CoursesTab() {
	const [activeTab, setActiveTab] = useState("browse");
	const [searchQuery, setSearchQuery] = useState("");

	const enrolledCourses = useQuery(api.courses.getEnrolledCourses);
	const user = useQuery(api.users.current);

	const filteredEnrolledCourses = enrolledCourses?.filter((course) =>
		course.title?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Courses</h2>
					<p className="text-muted-foreground">
						Discover and learn from our comprehensive course catalog
					</p>
				</div>
				{user?.role === "instructor" && (
					<Link href="/instructor">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Create Course
						</Button>
					</Link>
				)}
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="browse">Browse Courses</TabsTrigger>
					<TabsTrigger value="enrolled">My Courses</TabsTrigger>
					<TabsTrigger value="progress">Progress</TabsTrigger>
				</TabsList>

				<TabsContent value="browse" className="space-y-6">
					<CourseCatalog />
				</TabsContent>

				<TabsContent value="enrolled" className="space-y-6">
					<div className="flex items-center space-x-4">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								placeholder="Search your courses..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{enrolledCourses === undefined ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[...Array(6)].map((_, i) => (
								<Card key={i} className="animate-pulse">
									<div className="h-32 rounded-t-lg bg-gray-200" />
									<CardHeader>
										<div className="h-4 w-3/4 rounded bg-gray-200" />
										<div className="h-3 w-1/2 rounded bg-gray-200" />
									</CardHeader>
									<CardContent>
										<div className="mb-2 h-2 rounded bg-gray-200" />
										<div className="h-3 w-1/4 rounded bg-gray-200" />
									</CardContent>
								</Card>
							))}
						</div>
					) : filteredEnrolledCourses && filteredEnrolledCourses.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{filteredEnrolledCourses.map((course) => (
								<Card
									key={course._id}
									className="overflow-hidden transition-shadow hover:shadow-lg"
								>
									<div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
										{course.thumbnail ? (
											<img
												src={course.thumbnail || "/placeholder.svg"}
												alt={course.title}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center font-bold text-white text-xl">
												{course.title?.charAt(0)}
											</div>
										)}
									</div>

									<CardHeader className="pb-3">
										<CardTitle className="line-clamp-2">
											{course.title}
										</CardTitle>
										<div className="flex items-center space-x-2">
											<Avatar className="h-5 w-5">
												<AvatarImage src="/placeholder.svg" />
												<AvatarFallback>
													{course.instructorName?.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<span className="text-gray-600 text-sm">
												{course.instructorName}
											</span>
										</div>
									</CardHeader>

									<CardContent className="space-y-4">
										<div>
											<div className="mb-2 flex items-center justify-between text-sm">
												<span className="text-gray-600">Progress</span>
												<span className="font-medium">
													{Math.round(course.progress || 0)}%
												</span>
											</div>
											<Progress value={course.progress || 0} className="h-2" />
										</div>

										<div className="flex items-center justify-between text-gray-500 text-sm">
											<div className="flex items-center space-x-1">
												<Clock className="h-4 w-4" />
												<span>
													Last accessed{" "}
													{new Date(course.lastAccessedAt).toLocaleDateString()}
												</span>
											</div>
										</div>

										<Link href={`/courses/${course._id}`}>
											<Button className="w-full">
												{course.progress === 100
													? "Review Course"
													: "Continue Learning"}
											</Button>
										</Link>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<h3 className="mb-2 font-medium text-gray-900 text-lg">
									No enrolled courses
								</h3>
								<p className="mb-4 text-gray-500">
									Start learning by enrolling in a course
								</p>
								<Button onClick={() => setActiveTab("browse")}>
									Browse Courses
								</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="progress" className="space-y-6">
					{enrolledCourses === undefined ? (
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<Card key={i} className="animate-pulse">
									<CardHeader>
										<div className="h-4 w-1/2 rounded bg-gray-200" />
									</CardHeader>
									<CardContent>
										<div className="mb-4 h-2 rounded bg-gray-200" />
										<div className="h-3 w-1/4 rounded bg-gray-200" />
									</CardContent>
								</Card>
							))}
						</div>
					) : enrolledCourses && enrolledCourses.length > 0 ? (
						<div className="space-y-6">
							{/* Progress Overview */}
							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total Courses
										</CardTitle>
										<BookOpen className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{enrolledCourses.length}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Completed
										</CardTitle>
										<TrendingUp className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{enrolledCourses.filter((c) => c.progress === 100).length}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											In Progress
										</CardTitle>
										<Clock className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{
												enrolledCourses.filter(
													(c) => c.progress > 0 && c.progress < 100,
												).length
											}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Detailed Progress */}
							<Card>
								<CardHeader>
									<CardTitle>Course Progress</CardTitle>
									<CardDescription>
										Track your learning progress across all courses
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{enrolledCourses.map((course) => (
										<div key={course._id} className="space-y-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src="/placeholder.svg" />
														<AvatarFallback>
															{course.instructorName?.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{course.title}</p>
														<p className="text-gray-500 text-sm">
															by {course.instructorName}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-medium">
														{Math.round(course.progress || 0)}%
													</p>
													<p className="text-gray-500 text-sm">
														{course.progress === 100
															? "Completed"
															: "In Progress"}
													</p>
												</div>
											</div>
											<Progress value={course.progress || 0} className="h-2" />
										</div>
									))}
								</CardContent>
							</Card>
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<h3 className="mb-2 font-medium text-gray-900 text-lg">
									No progress to show
								</h3>
								<p className="mb-4 text-gray-500">
									Enroll in courses to track your progress
								</p>
								<Button onClick={() => setActiveTab("browse")}>
									Browse Courses
								</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
