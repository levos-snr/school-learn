"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
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

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
};

const cardHoverVariants = {
	hover: {
		y: -8,
		scale: 1.02,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
};

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
		<motion.div
			className="min-h-screen space-y-6 bg-background p-6"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Header */}
			<motion.div
				className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
				variants={itemVariants}
			>
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-foreground">
						<BookOpen className="h-8 w-8 text-primary" />
						<span>My Courses</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
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
			</motion.div>

			{/* Stats Cards */}
			<motion.div
				className="grid grid-cols-1 gap-4 md:grid-cols-4"
				variants={containerVariants}
			>
				{[
					{
						title: "Active Courses",
						value: courses?.length || 0,
						icon: BookOpen,
						color: "text-green-600 dark:text-green-400",
						bgColor: "bg-green-50 dark:bg-green-950/50",
						iconBg: "bg-green-500",
					},
					{
						title: "Avg Progress",
						value: courses?.length
							? Math.round(
									courses.reduce((sum, course) => sum + course.progress, 0) /
										courses.length,
								) + "%"
							: "0%",
						icon: TrendingUp,
						color: "text-blue-600 dark:text-blue-400",
						bgColor: "bg-blue-50 dark:bg-blue-950/50",
						iconBg: "bg-blue-500",
					},
					{
						title: "Completed",
						value: courses?.filter((c) => c.progress === 100).length || 0,
						icon: Award,
						color: "text-purple-600 dark:text-purple-400",
						bgColor: "bg-purple-50 dark:bg-purple-950/50",
						iconBg: "bg-purple-500",
					},
					{
						title: "Study Hours",
						value: "48",
						icon: Clock,
						color: "text-orange-600 dark:text-orange-400",
						bgColor: "bg-orange-50 dark:bg-orange-950/50",
						iconBg: "bg-orange-500",
					},
				].map((stat, index) => (
					<motion.div key={stat.title} variants={itemVariants}>
						<Card className={`border-0 ${stat.bgColor} shadow-lg`}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className={`font-medium text-sm ${stat.color}`}>
											{stat.title}
										</p>
										<p className={`font-bold text-2xl ${stat.color}`}>
											{stat.value}
										</p>
									</div>
									<div
										className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
									>
										<stat.icon className="h-6 w-6 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>

			{/* Filters */}
			<motion.div variants={itemVariants}>
				<Card className="border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex flex-col gap-4 lg:flex-row">
							<div className="flex-1">
								<div className="relative">
									<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
									<Input
										placeholder="Search courses..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="border-2 pl-10 focus:border-primary"
									/>
								</div>
							</div>

							<div className="flex gap-3">
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="rounded-lg border-2 border-border bg-background px-4 py-2 text-foreground focus:border-primary"
								>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.label}
										</option>
									))}
								</select>

								<Button
									variant="outline"
									className="bg-transparent hover:bg-accent"
								>
									<Filter className="mr-2 h-4 w-4" />
									More Filters
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Courses Grid/List */}
			<motion.div
				className={
					viewMode === "grid"
						? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
						: "space-y-4"
				}
				variants={containerVariants}
			>
				{filteredCourses.map((course, index) => (
					<motion.div
						key={course.id}
						variants={itemVariants}
						whileHover="hover"
						custom={index}
					>
						<motion.div variants={cardHoverVariants}>
							<Card className="group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
								<div
									className={`h-2 bg-gradient-to-r ${course.bgGradient} rounded-t-lg`}
								/>
								<CardContent className="p-6">
									<div className="mb-4 flex items-start justify-between">
										<div className="flex-1">
											<h3 className="mb-2 font-bold text-foreground text-lg transition-colors group-hover:text-primary">
												{course.title}
											</h3>
											<p className="mb-3 text-muted-foreground text-sm">
												by {course.instructor}
											</p>

											<div className="mb-4 flex items-center space-x-4">
												<div className="flex items-center space-x-1">
													<Star className="h-4 w-4 fill-current text-yellow-400" />
													<span className="font-medium text-foreground text-sm">
														{course.rating}
													</span>
												</div>
												<div className="flex items-center space-x-1">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground text-sm">
														{course.students}
													</span>
												</div>
												<div className="flex items-center space-x-1">
													<Clock className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground text-sm">
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
												<span className="text-muted-foreground text-sm">
													Progress
												</span>
												<span className="font-medium text-foreground text-sm">
													{course.completedLessons}/{course.totalLessons}{" "}
													lessons
												</span>
											</div>
											<Progress value={course.progress} className="h-3" />
										</div>

										<div className="rounded-lg bg-muted p-3">
											<p className="mb-1 text-muted-foreground text-sm">
												Next Lesson:
											</p>
											<p className="font-medium text-foreground">
												{course.nextLesson}
											</p>
										</div>

										<div className="flex space-x-2">
											<Button
												className="flex-1 transform bg-gradient-to-r from-primary to-primary/80 transition-all hover:scale-105"
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
												className="transform bg-transparent transition-all hover:scale-105 hover:bg-accent"
											>
												<Target className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</motion.div>
				))}
			</motion.div>

			{/* Recommended Courses */}
			<motion.div variants={itemVariants}>
				<Card className="border-0 shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<Star className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-foreground">Recommended for You</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.div
							className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
							variants={containerVariants}
						>
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
								<motion.div key={index} variants={itemVariants}>
									<Card className="bg-card transition-all hover:shadow-md">
										<CardContent className="p-4">
											<h4 className="mb-2 font-bold text-foreground">
												{course.title}
											</h4>
											<p className="mb-3 text-muted-foreground text-sm">
												by {course.instructor}
											</p>
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-1">
													<Star className="h-3 w-3 fill-current text-yellow-400" />
													<span className="text-foreground text-xs">
														{course.rating}
													</span>
												</div>
												<div className="flex items-center space-x-1">
													<Users className="h-3 w-3 text-muted-foreground" />
													<span className="text-muted-foreground text-xs">
														{course.students}
													</span>
												</div>
											</div>
											<Button
												size="sm"
												className="mt-3 w-full bg-primary hover:bg-primary/90"
											>
												Enroll Now
											</Button>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>

			{filteredCourses.length === 0 && (
				<motion.div variants={itemVariants}>
					<Card className="border-0 shadow-xl">
						<CardContent className="p-12 text-center">
							<BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
							<h3 className="mb-2 font-bold text-foreground text-xl">
								No courses found
							</h3>
							<p className="mb-6 text-muted-foreground">
								Try adjusting your search criteria or explore new subjects.
							</p>
							<Button
								onClick={() => {
									setSearchTerm("");
									setSelectedCategory("all");
								}}
								className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
							>
								Clear Filters
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</motion.div>
	);
}
