"use client";

import { useUser } from "@clerk/nextjs";
import {
	BookOpen,
	Calendar,
	ChevronRight,
	Clock,
	Pause,
	Play,
	RotateCcw,
	Target,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface OverviewTabProps {
	onTabChange: (tab: string) => void;
}

export function FunOverviewTab({ onTabChange }: OverviewTabProps) {
	const { user } = useUser();
	const [studyTime, setStudyTime] = useState(0);
	const [isStudying, setIsStudying] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
			if (isStudying) {
				setStudyTime((prev) => prev + 1);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [isStudying]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const getGreeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return "Good Morning";
		if (hour < 17) return "Good Afternoon";
		return "Good Evening";
	};

	const stats = [
		{
			label: "Courses Enrolled",
			value: "12",
			icon: BookOpen,
			color: "text-blue-500",
			bgColor: "bg-blue-50 dark:bg-blue-950",
			change: "+2 this week",
		},
		{
			label: "Hours Studied",
			value: "48",
			icon: Clock,
			color: "text-green-500",
			bgColor: "bg-green-50 dark:bg-green-950",
			change: "+12 this week",
		},
		{
			label: "Assignments Due",
			value: "5",
			icon: Target,
			color: "text-orange-500",
			bgColor: "bg-orange-50 dark:bg-orange-950",
			change: "2 due today",
		},
		{
			label: "Achievements",
			value: "23",
			icon: Trophy,
			color: "text-purple-500",
			bgColor: "bg-purple-50 dark:bg-purple-950",
			change: "+3 this month",
		},
	];

	const recentCourses = [
		{
			id: 1,
			title: "Mathematics Form 4",
			progress: 75,
			nextLesson: "Calculus Basics",
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-50 dark:bg-blue-950",
			instructor: "Dr. Sarah Kimani",
		},
		{
			id: 2,
			title: "Physics Form 3",
			progress: 60,
			nextLesson: "Wave Motion",
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-50 dark:bg-green-950",
			instructor: "Prof. John Mwangi",
		},
		{
			id: 3,
			title: "Chemistry Form 4",
			progress: 85,
			nextLesson: "Organic Chemistry",
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-50 dark:bg-purple-950",
			instructor: "Dr. Mary Wanjiku",
		},
	];

	const upcomingDeadlines = [
		{
			id: 1,
			title: "Math Assignment",
			subject: "Mathematics",
			dueDate: "Tomorrow",
			priority: "high",
		},
		{
			id: 2,
			title: "Physics Lab Report",
			subject: "Physics",
			dueDate: "3 days",
			priority: "medium",
		},
		{
			id: 3,
			title: "Chemistry Quiz",
			subject: "Chemistry",
			dueDate: "1 week",
			priority: "low",
		},
	];

	return (
		<div className="min-h-screen space-y-6 bg-background p-6">
			{/* Welcome Section */}
			<Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 shadow-lg">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="mb-2 font-bold text-3xl text-foreground">
								{getGreeting()}, {user?.firstName}! 🌟
							</h1>
							<p className="text-lg text-muted-foreground">
								Ready to continue your learning journey?
							</p>
						</div>
						<div className="text-right">
							<p className="text-muted-foreground text-sm">Today</p>
							<p className="font-semibold text-foreground text-xl">
								{currentTime.toLocaleDateString()}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<Card
							key={index}
							className="hover:-translate-y-1 transform border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
						>
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div
										className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
									>
										<Icon className={`h-6 w-6 ${stat.color}`} />
									</div>
									<Badge
										variant="secondary"
										className="bg-muted text-muted-foreground text-xs"
									>
										{stat.change}
									</Badge>
								</div>
								<div>
									<p className="mb-1 text-muted-foreground text-sm">
										{stat.label}
									</p>
									<p className="font-bold text-3xl text-foreground">
										{stat.value}
									</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Study Timer */}
				<Card className="border-0 shadow-lg lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2 text-foreground">
							<Clock className="h-5 w-5 text-primary" />
							<span>Study Timer</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<div className="mb-6">
							<div className="mb-2 font-bold text-5xl text-primary">
								{formatTime(studyTime)}
							</div>
							<p className="text-muted-foreground text-sm">
								Today's Study Time
							</p>
						</div>
						<div className="flex justify-center space-x-3">
							<Button
								onClick={() => setIsStudying(!isStudying)}
								className={`${isStudying ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
							>
								{isStudying ? (
									<Pause className="mr-2 h-4 w-4" />
								) : (
									<Play className="mr-2 h-4 w-4" />
								)}
								{isStudying ? "Pause" : "Start"}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setStudyTime(0);
									setIsStudying(false);
								}}
								className="border-border hover:bg-accent"
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Recent Courses */}
				<Card className="border-0 shadow-lg lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-foreground">Continue Learning</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onTabChange("courses")}
							className="text-muted-foreground hover:text-foreground"
						>
							View All <ChevronRight className="ml-1 h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentCourses.map((course) => (
								<Card
									key={course.id}
									className="cursor-pointer border border-border bg-card p-4 transition-colors hover:bg-accent/50"
								>
									<div className="mb-3 flex items-center justify-between">
										<div className="flex-1">
											<h4 className="mb-1 font-semibold text-foreground">
												{course.title}
											</h4>
											<p className="text-muted-foreground text-sm">
												by {course.instructor}
											</p>
										</div>
										<Badge
											className={`${course.bgColor} ${course.color} border-current/20`}
										>
											{course.progress}%
										</Badge>
									</div>
									<p className="mb-3 text-muted-foreground text-sm">
										Next: {course.nextLesson}
									</p>
									<div className="space-y-2">
										<Progress value={course.progress} className="h-2" />
										<Button
											size="sm"
											className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
										>
											Continue Learning
										</Button>
									</div>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Upcoming Deadlines */}
			<Card className="border-0 shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center space-x-2 text-foreground">
						<Calendar className="h-5 w-5 text-primary" />
						<span>Upcoming Deadlines</span>
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onTabChange("assignments")}
						className="text-muted-foreground hover:text-foreground"
					>
						View All <ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{upcomingDeadlines.map((deadline) => (
							<Card
								key={deadline.id}
								className="border border-border p-4 transition-colors hover:bg-accent/50"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div
											className={`h-3 w-3 rounded-full ${
												deadline.priority === "high"
													? "bg-destructive"
													: deadline.priority === "medium"
														? "bg-warning"
														: "bg-success"
											}`}
										/>
										<div>
											<h4 className="font-medium text-foreground">
												{deadline.title}
											</h4>
											<p className="text-muted-foreground text-sm">
												{deadline.subject}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-medium text-foreground text-sm">
											Due {deadline.dueDate}
										</p>
										<Badge
											variant="outline"
											className={`text-xs ${
												deadline.priority === "high"
													? "border-destructive text-destructive"
													: deadline.priority === "medium"
														? "border-warning text-warning"
														: "border-success text-success"
											}`}
										>
											{deadline.priority.toUpperCase()} PRIORITY
										</Badge>
									</div>
								</div>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card
					className="hover:-translate-y-1 transform cursor-pointer border-0 shadow-md transition-all duration-300 hover:shadow-lg"
					onClick={() => onTabChange("courses")}
				>
					<CardContent className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
							<BookOpen className="h-6 w-6 text-blue-500" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground">
							Explore Courses
						</h3>
						<p className="text-muted-foreground text-sm">
							Discover new subjects and topics
						</p>
					</CardContent>
				</Card>

				<Card
					className="hover:-translate-y-1 transform cursor-pointer border-0 shadow-md transition-all duration-300 hover:shadow-lg"
					onClick={() => onTabChange("assignments")}
				>
					<CardContent className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950">
							<Target className="h-6 w-6 text-orange-500" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground">
							Complete Assignments
						</h3>
						<p className="text-muted-foreground text-sm">
							Stay on top of your tasks
						</p>
					</CardContent>
				</Card>

				<Card
					className="hover:-translate-y-1 transform cursor-pointer border-0 shadow-md transition-all duration-300 hover:shadow-lg"
					onClick={() => onTabChange("friends")}
				>
					<CardContent className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950">
							<TrendingUp className="h-6 w-6 text-purple-500" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground">
							Track Progress
						</h3>
						<p className="text-muted-foreground text-sm">
							Monitor your learning journey
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
