"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	AlertCircle,
	Award,
	BookOpen,
	Brain,
	Calendar,
	CheckCircle,
	Clock,
	Play,
	Star,
	Target,
	TestTube,
	Trophy,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TestsTab() {
	const [selectedTab, setSelectedTab] = useState("available");
	const tests = useQuery(api.dashboard.getTests);

	const tabs = [
		{
			id: "available",
			label: "Available",
			count: tests?.filter((t) => t.status === "pending").length || 0,
		},
		{
			id: "completed",
			label: "Completed",
			count: tests?.filter((t) => t.status === "completed").length || 0,
		},
		{
			id: "results",
			label: "Results",
			count: tests?.filter((t) => t.bestScore !== null).length || 0,
		},
	];

	const filteredTests =
		tests?.filter((test) => {
			if (selectedTab === "available") return test.status === "pending";
			if (selectedTab === "completed") return test.status === "completed";
			if (selectedTab === "results") return test.bestScore !== null;
			return true;
		}) || [];

	const getTestTypeColor = (type: string) => {
		switch (type) {
			case "quiz":
				return "from-blue-400 to-blue-600";
			case "test":
				return "from-green-400 to-green-600";
			case "assessment":
				return "from-purple-400 to-purple-600";
			default:
				return "from-gray-400 to-gray-600";
		}
	};

	const getTestTypeIcon = (type: string) => {
		switch (type) {
			case "quiz":
				return Brain;
			case "test":
				return TestTube;
			case "assessment":
				return Award;
			default:
				return TestTube;
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600";
		if (score >= 80) return "text-blue-600";
		if (score >= 70) return "text-yellow-600";
		if (score >= 60) return "text-orange-600";
		return "text-red-600";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
		if (score >= 80) return { label: "Good", color: "bg-blue-500" };
		if (score >= 70) return { label: "Average", color: "bg-yellow-500" };
		if (score >= 60) return { label: "Fair", color: "bg-orange-500" };
		return { label: "Needs Improvement", color: "bg-red-500" };
	};

	return (
		<div className="min-h-screen space-y-6 bg-gradient-to-br from-gray-50 to-white p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-gray-900">
						<TestTube className="h-8 w-8 text-purple-500" />
						<span>Tests & Quizzes</span>
					</h1>
					<p className="mt-1 text-gray-600">
						Test your knowledge and track your progress!
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-purple-600 text-sm">
									Total Tests
								</p>
								<p className="font-bold text-2xl text-purple-700">
									{tests?.length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
								<TestTube className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-green-600 text-sm">Completed</p>
								<p className="font-bold text-2xl text-green-700">
									{tests?.filter((t) => t.status === "completed").length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
								<CheckCircle className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-blue-600 text-sm">
									Average Score
								</p>
								<p className="font-bold text-2xl text-blue-700">
									{tests?.filter((t) => t.bestScore).length > 0
										? Math.round(
												tests
													.filter((t) => t.bestScore)
													.reduce((sum, t) => sum + (t.bestScore || 0), 0) /
													tests.filter((t) => t.bestScore).length,
											)
										: 0}
									%
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
								<Target className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm text-yellow-600">Pending</p>
								<p className="font-bold text-2xl text-yellow-700">
									{tests?.filter((t) => t.status === "pending").length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500">
								<Clock className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<div className="flex w-fit space-x-1 rounded-xl bg-gray-100 p-1">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant={selectedTab === tab.id ? "default" : "ghost"}
						size="sm"
						onClick={() => setSelectedTab(tab.id)}
						className={`${selectedTab === tab.id ? "bg-white shadow-md" : ""} relative rounded-lg px-6 py-2 transition-all`}
					>
						{tab.label}
						{tab.count > 0 && (
							<Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
								{tab.count}
							</Badge>
						)}
					</Button>
				))}
			</div>

			{/* Tests Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredTests.map((test) => {
					const TypeIcon = getTestTypeIcon(test.type);
					const isOverdue =
						new Date(test.dueDate) < new Date() && test.status === "pending";

					return (
						<Card
							key={test.id}
							className="hover:-translate-y-1 group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl"
						>
							<div
								className={`h-2 bg-gradient-to-r ${getTestTypeColor(test.type)} rounded-t-lg`}
							/>
							<CardContent className="p-6">
								<div className="mb-4 flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<div
											className={`h-12 w-12 bg-gradient-to-r ${getTestTypeColor(test.type)} flex items-center justify-center rounded-xl`}
										>
											<TypeIcon className="h-6 w-6 text-white" />
										</div>
										<div>
											<h3 className="font-bold text-gray-900 transition-colors group-hover:text-purple-600">
												{test.title}
											</h3>
											<p className="text-gray-600 text-sm">{test.course}</p>
										</div>
									</div>
									<Badge
										className={`${getTestTypeColor(test.type).replace("from-", "bg-").replace(" to-", "").split("-")[0]}-500 text-white`}
									>
										{test.type.toUpperCase()}
									</Badge>
								</div>

								<div className="mb-4 space-y-3">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center space-x-2 text-gray-600">
											<Brain className="h-4 w-4" />
											<span>{test.questions} questions</span>
										</div>
										<div className="flex items-center space-x-2 text-gray-600">
											<Clock className="h-4 w-4" />
											<span>{test.duration} mins</span>
										</div>
									</div>

									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center space-x-2 text-gray-600">
											<Calendar className="h-4 w-4" />
											<span>
												Due: {new Date(test.dueDate).toLocaleDateString()}
											</span>
										</div>
										{isOverdue && (
											<Badge className="bg-red-100 text-red-800">
												<AlertCircle className="mr-1 h-3 w-3" />
												Overdue
											</Badge>
										)}
									</div>

									{test.bestScore !== null && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-gray-600 text-sm">
													Best Score
												</span>
												<span
													className={`font-bold text-lg ${getScoreColor(test.bestScore)}`}
												>
													{test.bestScore}%
												</span>
											</div>
											<Progress value={test.bestScore} className="h-2" />
											<div className="flex items-center justify-between">
												<Badge
													className={`${getScoreBadge(test.bestScore).color} text-white text-xs`}
												>
													{getScoreBadge(test.bestScore).label}
												</Badge>
												<span className="text-gray-500 text-xs">
													Attempts: {test.attempts}
												</span>
											</div>
										</div>
									)}
								</div>

								<div className="flex space-x-2">
									{test.status === "pending" ? (
										<Button
											className="flex-1 transform bg-gradient-to-r from-purple-500 to-pink-500 transition-all hover:scale-105 hover:from-purple-600 hover:to-pink-600"
											onClick={() => {
												console.log(`Starting test: ${test.title}`);
											}}
										>
											<Play className="mr-2 h-4 w-4" />
											Start Test
										</Button>
									) : (
										<Button
											variant="outline"
											className="flex-1 transform bg-transparent transition-all hover:scale-105 hover:bg-gray-50"
											onClick={() => {
												console.log(`Viewing results: ${test.title}`);
											}}
										>
											<Trophy className="mr-2 h-4 w-4" />
											View Results
										</Button>
									)}

									{test.attempts > 0 && test.status === "pending" && (
										<Button
											variant="outline"
											size="sm"
											className="transform bg-transparent transition-all hover:scale-105 hover:bg-blue-50 hover:text-blue-600"
										>
											<Zap className="h-4 w-4" />
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Quick Stats */}
			<Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
							<Star className="h-5 w-5 text-white" />
						</div>
						<span>Performance Overview</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-indigo-600">
								{tests?.filter((t) => t.bestScore && t.bestScore >= 90)
									.length || 0}
							</div>
							<p className="text-gray-600 text-sm">Excellent Scores (90%+)</p>
							<div className="mt-2 flex justify-center">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className="h-4 w-4 fill-current text-yellow-400"
									/>
								))}
							</div>
						</div>

						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-green-600">
								{Math.round(
									((tests?.filter((t) => t.status === "completed").length ||
										0) /
										(tests?.length || 1)) *
										100,
								)}
								%
							</div>
							<p className="text-gray-600 text-sm">Completion Rate</p>
							<Progress
								value={
									((tests?.filter((t) => t.status === "completed").length ||
										0) /
										(tests?.length || 1)) *
									100
								}
								className="mt-2"
							/>
						</div>

						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-purple-600">
								{tests?.reduce((sum, test) => sum + test.attempts, 0) || 0}
							</div>
							<p className="text-gray-600 text-sm">Total Attempts</p>
							<Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
								<Zap className="mr-1 h-3 w-3" />
								Keep Going!
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{filteredTests.length === 0 && (
				<Card className="border-0 shadow-xl">
					<CardContent className="p-12 text-center">
						<TestTube className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-bold text-gray-900 text-xl">
							No tests found
						</h3>
						<p className="mb-6 text-gray-600">
							{selectedTab === "available" &&
								"No tests available at the moment."}
							{selectedTab === "completed" &&
								"You haven't completed any tests yet."}
							{selectedTab === "results" && "No test results available."}
						</p>
						<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
							<BookOpen className="mr-2 h-4 w-4" />
							Explore Courses
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
