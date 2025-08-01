"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
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
		if (score >= 90) return "text-green-600 dark:text-green-400";
		if (score >= 80) return "text-blue-600 dark:text-blue-400";
		if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
		if (score >= 60) return "text-orange-600 dark:text-orange-400";
		return "text-red-600 dark:text-red-400";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
		if (score >= 80) return { label: "Good", color: "bg-blue-500" };
		if (score >= 70) return { label: "Average", color: "bg-yellow-500" };
		if (score >= 60) return { label: "Fair", color: "bg-orange-500" };
		return { label: "Needs Improvement", color: "bg-red-500" };
	};

	return (
		<motion.div
			className="min-h-screen space-y-6 bg-background p-6"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Header */}
			<motion.div
				className="flex items-center justify-between"
				variants={itemVariants}
			>
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-foreground">
						<TestTube className="h-8 w-8 text-primary" />
						<span>Tests & Quizzes</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Test your knowledge and track your progress!
					</p>
				</div>
			</motion.div>

			{/* Stats Cards */}
			<motion.div
				className="grid grid-cols-1 gap-4 md:grid-cols-4"
				variants={containerVariants}
			>
				{[
					{
						title: "Total Tests",
						value: tests?.length || 0,
						icon: TestTube,
						color: "text-purple-600 dark:text-purple-400",
						bgColor: "bg-purple-50 dark:bg-purple-950/50",
						iconBg: "bg-purple-500",
					},
					{
						title: "Completed",
						value: tests?.filter((t) => t.status === "completed").length || 0,
						icon: CheckCircle,
						color: "text-green-600 dark:text-green-400",
						bgColor: "bg-green-50 dark:bg-green-950/50",
						iconBg: "bg-green-500",
					},
					{
						title: "Average Score",
						value:
							(tests?.filter((t) => t.bestScore)?.length || 0) > 0
								? Math.round(
										(tests
											?.filter((t) => t.bestScore)
											?.reduce((sum, t) => sum + (t.bestScore || 0), 0) || 0) /
											(tests?.filter((t) => t.bestScore)?.length || 1),
									) + "%"
								: "0%",
						icon: Target,
						color: "text-blue-600 dark:text-blue-400",
						bgColor: "bg-blue-50 dark:bg-blue-950/50",
						iconBg: "bg-blue-500",
					},
					{
						title: "Pending",
						value: tests?.filter((t) => t.status === "pending").length || 0,
						icon: Clock,
						color: "text-yellow-600 dark:text-yellow-400",
						bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
						iconBg: "bg-yellow-500",
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

			{/* Tabs */}
			<motion.div
				className="flex w-fit space-x-1 rounded-xl bg-muted p-1"
				variants={itemVariants}
			>
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant={selectedTab === tab.id ? "default" : "ghost"}
						size="sm"
						onClick={() => setSelectedTab(tab.id)}
						className={`${selectedTab === tab.id ? "bg-background shadow-md" : ""} relative rounded-lg px-6 py-2 transition-all`}
					>
						{tab.label}
						{tab.count > 0 && (
							<Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
								{tab.count}
							</Badge>
						)}
					</Button>
				))}
			</motion.div>

			{/* Tests Grid */}
			<motion.div
				className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
				variants={containerVariants}
			>
				{filteredTests.map((test, index) => {
					const TypeIcon = getTestTypeIcon(test.type);
					const isOverdue =
						new Date(test.dueDate) < new Date() && test.status === "pending";

					return (
						<motion.div
							key={test.id}
							variants={itemVariants}
							whileHover="hover"
							custom={index}
						>
							<motion.div variants={cardHoverVariants}>
								<Card className="group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
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
													<h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
														{test.title}
													</h3>
													<p className="text-muted-foreground text-sm">
														{test.course}
													</p>
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
												<div className="flex items-center space-x-2 text-muted-foreground">
													<Brain className="h-4 w-4" />
													<span>{test.questions} questions</span>
												</div>
												<div className="flex items-center space-x-2 text-muted-foreground">
													<Clock className="h-4 w-4" />
													<span>{test.duration} mins</span>
												</div>
											</div>

											<div className="flex items-center justify-between text-sm">
												<div className="flex items-center space-x-2 text-muted-foreground">
													<Calendar className="h-4 w-4" />
													<span>
														Due: {new Date(test.dueDate).toLocaleDateString()}
													</span>
												</div>
												{isOverdue && (
													<Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400">
														<AlertCircle className="mr-1 h-3 w-3" />
														Overdue
													</Badge>
												)}
											</div>

											{test.bestScore !== null && (
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground text-sm">
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
														<span className="text-muted-foreground text-xs">
															Attempts: {test.attempts}
														</span>
													</div>
												</div>
											)}
										</div>

										<div className="flex space-x-2">
											{test.status === "pending" ? (
												<Button
													className="flex-1 transform bg-gradient-to-r from-primary to-primary/80 transition-all hover:scale-105"
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
													className="flex-1 transform bg-transparent transition-all hover:scale-105 hover:bg-accent"
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
													className="transform bg-transparent transition-all hover:scale-105 hover:bg-accent hover:text-primary"
												>
													<Zap className="h-4 w-4" />
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</motion.div>
					);
				})}
			</motion.div>

			{/* Performance Overview */}
			<motion.div variants={itemVariants}>
				<Card className="border-0 bg-gradient-to-r from-muted/50 to-muted/30 shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<Star className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-foreground">Performance Overview</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.div
							className="grid grid-cols-1 gap-6 md:grid-cols-3"
							variants={containerVariants}
						>
							<motion.div className="text-center" variants={itemVariants}>
								<div className="mb-2 font-bold text-3xl text-primary">
									{tests?.filter((t) => t.bestScore && t.bestScore >= 90)
										.length || 0}
								</div>
								<p className="text-muted-foreground text-sm">
									Excellent Scores (90%+)
								</p>
								<div className="mt-2 flex justify-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className="h-4 w-4 fill-current text-yellow-400"
										/>
									))}
								</div>
							</motion.div>

							<motion.div className="text-center" variants={itemVariants}>
								<div className="mb-2 font-bold text-3xl text-primary">
									{Math.round(
										((tests?.filter((t) => t.status === "completed").length ||
											0) /
											(tests?.length || 1)) *
											100,
									)}
									%
								</div>
								<p className="text-muted-foreground text-sm">Completion Rate</p>
								<Progress
									value={
										((tests?.filter((t) => t.status === "completed").length ||
											0) /
											(tests?.length || 1)) *
										100
									}
									className="mt-2"
								/>
							</motion.div>

							<motion.div className="text-center" variants={itemVariants}>
								<div className="mb-2 font-bold text-3xl text-primary">
									{tests?.reduce((sum, test) => sum + test.attempts, 0) || 0}
								</div>
								<p className="text-muted-foreground text-sm">Total Attempts</p>
								<Badge className="mt-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
									<Zap className="mr-1 h-3 w-3" />
									Keep Going!
								</Badge>
							</motion.div>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>

			{filteredTests.length === 0 && (
				<motion.div variants={itemVariants}>
					<Card className="border-0 shadow-xl">
						<CardContent className="p-12 text-center">
							<TestTube className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
							<h3 className="mb-2 font-bold text-foreground text-xl">
								No tests found
							</h3>
							<p className="mb-6 text-muted-foreground">
								{selectedTab === "available" &&
									"No tests available at the moment."}
								{selectedTab === "completed" &&
									"You haven't completed any tests yet."}
								{selectedTab === "results" && "No test results available."}
							</p>
							<Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
								<BookOpen className="mr-2 h-4 w-4" />
								Explore Courses
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</motion.div>
	);
}
