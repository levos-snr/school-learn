"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	Award,
	BookOpen,
	Clock,
	Filter,
	Grid3X3,
	List,
	Play,
	Search,
	Star,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function CoursesTab() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [viewMode, setViewMode] = useState("grid");
	const courses = useQuery(api.dashboard.getCourses);

	const categories = [
		{ id: "all", label: "All Courses" },
		{ id: "mathematics", label: "Mathematics" },
		{ id: "sciences", label: "Sciences" },
		{ id: "languages", label: "Languages" },
		{ id: "humanities", label: "Humanities" },
	];

	const filteredCourses =
		courses?.filter((course) => {
			const matchesSearch = course.title
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || course.category === selectedCategory;
			return matchesSearch && matchesCategory;
		}) || [];

	return (
		<div className="min-h-screen space-y-6 bg-gradient-to-br from-gray-50 to-white p-6">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-gray-900">
						<BookOpen className="h-8 w-8 text-green-500" />
						<span>My Courses</span>
					</h1>
					<p className="mt-1 text-gray-600">
						Continue your learning journey with expert-led courses!
					</p>
				</div>
				<div className="flex items-center space-x-3">
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("grid")}
					>
						<Grid3X3 className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-green-600 text-sm">
									Active Courses
								</p>
								<p className="font-bold text-2xl text-green-700">
									{courses?.length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
								<BookOpen className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-blue-600 text-sm">
									Avg Progress
								</p>
								<p className="font-bold text-2xl text-blue-700">
									{courses?.length
										? Math.round(
												courses.reduce(
													(sum, course) => sum + course.progress,
													0,
												) / courses.length,
											)
										: 0}
									%
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
								<TrendingUp className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-purple-600 text-sm">Completed</p>
								<p className="font-bold text-2xl text-purple-700">
									{courses?.filter((c) => c.progress === 100).length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
								<Award className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-orange-600 text-sm">
									Study Hours
								</p>
								<p className="font-bold text-2xl text-orange-700">48</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
								<Clock className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card className="border-0 shadow-lg">
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 lg:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
								<Input
									placeholder="Search courses..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="border-2 pl-10 focus:border-green-300"
								/>
							</div>
						</div>

						<div className="flex gap-3">
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 focus:border-green-300"
							>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.label}
									</option>
								))}
							</select>

							<Button
								variant="outline"
								className="bg-transparent hover:bg-gray-50"
							>
								<Filter className="mr-2 h-4 w-4" />
								More Filters
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Courses Grid/List */}
			<div
				className={
					viewMode === "grid"
						? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
						: "space-y-4"
				}
			>
				{filteredCourses.map((course) => (
					<Card
						key={course.id}
						className="hover:-translate-y-1 group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl"
					>
						<div
							className={`h-2 bg-gradient-to-r ${course.bgGradient} rounded-t-lg`}
						/>
						<CardContent className="p-6">
							<div className="mb-4 flex items-start justify-between">
								<div className="flex-1">
									<h3 className="mb-2 font-bold text-gray-900 text-lg transition-colors group-hover:text-green-600">
										{course.title}
									</h3>
									<p className="mb-3 text-gray-600 text-sm">
										by {course.instructor}
									</p>

									<div className="mb-4 flex items-center space-x-4">
										<div className="flex items-center space-x-1">
											<Star className="h-4 w-4 fill-current text-yellow-400" />
											<span className="font-medium text-sm">
												{course.rating}
											</span>
										</div>
										<div className="flex items-center space-x-1">
											<Users className="h-4 w-4 text-gray-400" />
											<span className="text-gray-600 text-sm">
												{course.students}
											</span>
										</div>
										<div className="flex items-center space-x-1">
											<Clock className="h-4 w-4 text-gray-400" />
											<span className="text-gray-600 text-sm">
												{course.duration}
											</span>
										</div>
									</div>
								</div>
								<Badge
									className={`bg-gradient-to-r ${course.bgGradient} text-white`}
								>
									{course.progress}%
								</Badge>
							</div>

							<div className="space-y-4">
								<div>
									<div className="mb-2 flex items-center justify-between">
										<span className="text-gray-600 text-sm">Progress</span>
										<span className="font-medium text-sm">
											{course.completedLessons}/{course.totalLessons} lessons
										</span>
									</div>
									<Progress value={course.progress} className="h-3" />
								</div>

								<div className="rounded-lg bg-gray-50 p-3">
									<p className="mb-1 text-gray-600 text-sm">Next Lesson:</p>
									<p className="font-medium text-gray-900">
										{course.nextLesson}
									</p>
								</div>

								<div className="flex space-x-2">
									<Button
										className="flex-1 transform bg-gradient-to-r from-green-500 to-blue-500 transition-all hover:scale-105 hover:from-green-600 hover:to-blue-600"
										onClick={() => {
											console.log(`Continuing course: ${course.title}`);
										}}
									>
										<Play className="mr-2 h-4 w-4" />
										Continue Learning
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="transform bg-transparent transition-all hover:scale-105 hover:bg-gray-50"
									>
										<Target className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recommended Courses */}
			<Card className="border-0 shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
							<Star className="h-5 w-5 text-white" />
						</div>
						<span>Recommended for You</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[
							{
								title: "Biology Form 3",
								instructor: "Dr. Mary Wanjiku",
								rating: 4.6,
								students: 890,
							},
							{
								title: "English Literature",
								instructor: "Prof. James Omondi",
								rating: 4.8,
								students: 1200,
							},
							{
								title: "Geography Form 4",
								instructor: "Ms. Grace Mutua",
								rating: 4.5,
								students: 750,
							},
							{
								title: "Computer Studies",
								instructor: "Mr. David Kiprotich",
								rating: 4.9,
								students: 950,
							},
						].map((course, index) => (
							<Card
								key={index}
								className="bg-gradient-to-br from-gray-50 to-white transition-all hover:shadow-md"
							>
								<CardContent className="p-4">
									<h4 className="mb-2 font-bold text-gray-900">
										{course.title}
									</h4>
									<p className="mb-3 text-gray-600 text-sm">
										by {course.instructor}
									</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-1">
											<Star className="h-3 w-3 fill-current text-yellow-400" />
											<span className="text-xs">{course.rating}</span>
										</div>
										<div className="flex items-center space-x-1">
											<Users className="h-3 w-3 text-gray-400" />
											<span className="text-gray-600 text-xs">
												{course.students}
											</span>
										</div>
									</div>
									<Button
										size="sm"
										className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600"
									>
										Enroll Now
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{filteredCourses.length === 0 && (
				<Card className="border-0 shadow-xl">
					<CardContent className="p-12 text-center">
						<BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-bold text-gray-900 text-xl">
							No courses found
						</h3>
						<p className="mb-6 text-gray-600">
							Try adjusting your search criteria or explore new subjects.
						</p>
						<Button
							onClick={() => {
								setSearchTerm("");
								setSelectedCategory("all");
							}}
							className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
						>
							Clear Filters
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
