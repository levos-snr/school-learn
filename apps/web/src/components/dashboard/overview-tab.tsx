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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface OverviewTabProps {
	onTabChange: (tab: string) => void;
}

export function OverviewTab({ onTabChange }: OverviewTabProps) {
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
			color: "bg-blue-500",
		},
		{ label: "Hours Studied", value: "48", icon: Clock, color: "bg-green-500" },
		{
			label: "Assignments Due",
			value: "5",
			icon: Target,
			color: "bg-orange-500",
		},
		{
			label: "Achievements",
			value: "23",
			icon: Trophy,
			color: "bg-purple-500",
		},
	];

	const recentCourses = [
		{
			id: 1,
			title: "Mathematics Form 4",
			progress: 75,
			nextLesson: "Calculus Basics",
			color: "bg-blue-100 text-blue-800",
		},
		{
			id: 2,
			title: "Physics Form 3",
			progress: 60,
			nextLesson: "Wave Motion",
			color: "bg-green-100 text-green-800",
		},
		{
			id: 3,
			title: "Chemistry Form 4",
			progress: 85,
			nextLesson: "Organic Chemistry",
			color: "bg-purple-100 text-purple-800",
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
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="rounded-xl bg-gradient-to-r from-kenya-green to-kenya-red p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-2xl">
							{getGreeting()}, {user?.firstName}! 🌟
						</h1>
						<p className="text-white/90">
							Ready to continue your learning journey?
						</p>
					</div>
					<div className="text-right">
						<p className="text-sm text-white/90">Today</p>
						<p className="font-semibold text-xl">
							{currentTime.toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<Card key={index} className="transition-shadow hover:shadow-md">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-gray-600 text-sm">{stat.label}</p>
										<p className="font-bold text-2xl text-gray-900">
											{stat.value}
										</p>
									</div>
									<div
										className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}
									>
										<Icon className="h-6 w-6 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Study Timer */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Clock className="h-5 w-5" />
							<span>Study Timer</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<div className="mb-6">
							<div className="mb-2 font-bold text-4xl text-kenya-green">
								{formatTime(studyTime)}
							</div>
							<p className="text-gray-600 text-sm">Today's Study Time</p>
						</div>
						<div className="flex justify-center space-x-2">
							<Button
								onClick={() => setIsStudying(!isStudying)}
								className={
									isStudying
										? "bg-red-500 hover:bg-red-600"
										: "bg-kenya-green hover:bg-kenya-green/90"
								}
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
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Recent Courses */}
				<Card className="lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Continue Learning</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onTabChange("courses")}
						>
							View All <ChevronRight className="ml-1 h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentCourses.map((course) => (
								<div
									key={course.id}
									className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
								>
									<div className="flex-1">
										<div className="mb-2 flex items-center justify-between">
											<h4 className="font-medium text-gray-900">
												{course.title}
											</h4>
											<span
												className={`rounded-full px-2 py-1 font-medium text-xs ${course.color}`}
											>
												{course.progress}%
											</span>
										</div>
										<p className="mb-2 text-gray-600 text-sm">
											Next: {course.nextLesson}
										</p>
										<Progress value={course.progress} className="h-2" />
									</div>
									<Button size="sm" className="ml-4">
										Continue
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Upcoming Deadlines */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center space-x-2">
						<Calendar className="h-5 w-5" />
						<span>Upcoming Deadlines</span>
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onTabChange("assignments")}
					>
						View All <ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{upcomingDeadlines.map((deadline) => (
							<div
								key={deadline.id}
								className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
							>
								<div className="flex items-center space-x-3">
									<div
										className={`h-3 w-3 rounded-full ${
											deadline.priority === "high"
												? "bg-red-500"
												: deadline.priority === "medium"
													? "bg-orange-500"
													: "bg-green-500"
										}`}
									/>
									<div>
										<h4 className="font-medium text-gray-900">
											{deadline.title}
										</h4>
										<p className="text-gray-600 text-sm">{deadline.subject}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-medium text-gray-900 text-sm">
										Due {deadline.dueDate}
									</p>
									<p
										className={`text-xs ${
											deadline.priority === "high"
												? "text-red-600"
												: deadline.priority === "medium"
													? "text-orange-600"
													: "text-green-600"
										}`}
									>
										{deadline.priority.toUpperCase()} PRIORITY
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card
					className="cursor-pointer transition-shadow hover:shadow-md"
					onClick={() => onTabChange("courses")}
				>
					<CardContent className="p-6 text-center">
						<BookOpen className="mx-auto mb-3 h-8 w-8 text-kenya-green" />
						<h3 className="mb-2 font-semibold text-gray-900">
							Explore Courses
						</h3>
						<p className="text-gray-600 text-sm">
							Discover new subjects and topics
						</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer transition-shadow hover:shadow-md"
					onClick={() => onTabChange("assignments")}
				>
					<CardContent className="p-6 text-center">
						<Target className="mx-auto mb-3 h-8 w-8 text-kenya-red" />
						<h3 className="mb-2 font-semibold text-gray-900">
							Complete Assignments
						</h3>
						<p className="text-gray-600 text-sm">Stay on top of your tasks</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer transition-shadow hover:shadow-md"
					onClick={() => onTabChange("community")}
				>
					<CardContent className="p-6 text-center">
						<TrendingUp className="mx-auto mb-3 h-8 w-8 text-purple-500" />
						<h3 className="mb-2 font-semibold text-gray-900">Track Progress</h3>
						<p className="text-gray-600 text-sm">
							Monitor your learning journey
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
