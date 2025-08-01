"use client";

import {
	AlertCircle,
	Award,
	BookOpen,
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	Filter,
	Plus,
	Search,
	Target,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function AssignmentsTab() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");

	// Mock assignments data
	const assignments = [
		{
			id: "1",
			title: "Calculus Problem Set 3",
			subject: "Mathematics",
			course: "Advanced Mathematics Form 4",
			dueDate: "2024-02-25",
			status: "pending",
			priority: "high",
			progress: 0,
			totalQuestions: 15,
			completedQuestions: 0,
			estimatedTime: "2 hours",
		},
		{
			id: "2",
			title: "Wave Motion Lab Report",
			subject: "Physics",
			course: "Physics Form 3",
			dueDate: "2024-02-28",
			status: "in-progress",
			priority: "medium",
			progress: 60,
			totalQuestions: 8,
			completedQuestions: 5,
			estimatedTime: "3 hours",
		},
		{
			id: "3",
			title: "Organic Chemistry Essay",
			subject: "Chemistry",
			course: "Chemistry Form 4",
			dueDate: "2024-03-05",
			status: "completed",
			priority: "low",
			progress: 100,
			totalQuestions: 5,
			completedQuestions: 5,
			estimatedTime: "4 hours",
		},
		{
			id: "4",
			title: "Cell Biology Diagram",
			subject: "Biology",
			course: "Biology Form 3",
			dueDate: "2024-02-22",
			status: "overdue",
			priority: "high",
			progress: 25,
			totalQuestions: 10,
			completedQuestions: 3,
			estimatedTime: "1.5 hours",
		},
	];

	const statusOptions = [
		{ id: "all", label: "All Assignments" },
		{ id: "pending", label: "Pending" },
		{ id: "in-progress", label: "In Progress" },
		{ id: "completed", label: "Completed" },
		{ id: "overdue", label: "Overdue" },
	];

	const filteredAssignments = assignments.filter((assignment) => {
		const matchesSearch =
			assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			selectedStatus === "all" || assignment.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "in-progress":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "overdue":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-500";
			case "medium":
				return "bg-yellow-500";
			case "low":
				return "bg-green-500";
			default:
				return "bg-muted";
		}
	};

	const getSubjectColor = (subject: string) => {
		const colors = {
			Mathematics: "from-blue-400 to-blue-600",
			Physics: "from-green-400 to-green-600",
			Chemistry: "from-purple-400 to-purple-600",
			Biology: "from-emerald-400 to-emerald-600",
		};
		return (
			colors[subject as keyof typeof colors] || "from-muted to-muted-foreground"
		);
	};

	const pendingCount = assignments.filter((a) => a.status === "pending").length;
	const inProgressCount = assignments.filter(
		(a) => a.status === "in-progress",
	).length;
	const completedCount = assignments.filter(
		(a) => a.status === "completed",
	).length;
	const overdueCount = assignments.filter((a) => a.status === "overdue").length;

	return (
		<div className="min-h-screen space-y-6 bg-background p-6">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-foreground">
						<FileText className="h-8 w-8 text-orange-500" />
						<span>Assignments</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Stay on top of your assignments and never miss a deadline!
					</p>
				</div>
				<Button className="transform bg-gradient-to-r from-orange-500 to-red-500 text-white transition-all hover:scale-105 hover:from-orange-600 hover:to-red-600">
					<Plus className="mr-2 h-4 w-4" />
					New Assignment
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg dark:from-yellow-950 dark:to-orange-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm text-yellow-600 dark:text-yellow-400">
									Pending
								</p>
								<p className="font-bold text-2xl text-yellow-700 dark:text-yellow-300">
									{pendingCount}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500">
								<Clock className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg dark:from-blue-950 dark:to-cyan-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-blue-600 text-sm dark:text-blue-400">
									In Progress
								</p>
								<p className="font-bold text-2xl text-blue-700 dark:text-blue-300">
									{inProgressCount}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
								<TrendingUp className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg dark:from-green-950 dark:to-emerald-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-green-600 text-sm dark:text-green-400">
									Completed
								</p>
								<p className="font-bold text-2xl text-green-700 dark:text-green-300">
									{completedCount}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
								<CheckCircle className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg dark:from-red-950 dark:to-pink-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-red-600 text-sm dark:text-red-400">
									Overdue
								</p>
								<p className="font-bold text-2xl text-red-700 dark:text-red-300">
									{overdueCount}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
								<AlertCircle className="h-6 w-6 text-white" />
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
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
								<Input
									placeholder="Search assignments..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="border-2 pl-10 focus:border-orange-300"
								/>
							</div>
						</div>

						<div className="flex gap-3">
							<select
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="rounded-lg border-2 border-border bg-background px-4 py-2 text-foreground focus:border-orange-300"
							>
								{statusOptions.map((status) => (
									<option key={status.id} value={status.id}>
										{status.label}
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

			{/* Assignments List */}
			<div className="space-y-4">
				{filteredAssignments.map((assignment) => (
					<Card
						key={assignment.id}
						className="hover:-translate-y-1 transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl"
					>
						<div
							className={`h-2 bg-gradient-to-r ${getSubjectColor(assignment.subject)} rounded-t-lg`}
						/>
						<CardContent className="p-6">
							<div className="mb-4 flex items-start justify-between">
								<div className="flex-1">
									<div className="mb-2 flex items-center space-x-3">
										<div
											className={`h-3 w-3 rounded-full ${getPriorityColor(assignment.priority)}`}
										/>
										<h3 className="font-bold text-foreground text-lg">
											{assignment.title}
										</h3>
										<Badge className={getStatusColor(assignment.status)}>
											{assignment.status}
										</Badge>
									</div>
									<p className="mb-2 text-muted-foreground text-sm">
										{assignment.course}
									</p>
									<div className="flex items-center space-x-4 text-muted-foreground text-sm">
										<div className="flex items-center space-x-1">
											<Calendar className="h-4 w-4" />
											<span>
												Due: {new Date(assignment.dueDate).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center space-x-1">
											<Clock className="h-4 w-4" />
											<span>{assignment.estimatedTime}</span>
										</div>
										<div className="flex items-center space-x-1">
											<Target className="h-4 w-4" />
											<span>
												{assignment.completedQuestions}/
												{assignment.totalQuestions} questions
											</span>
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="mb-1 font-bold text-2xl text-foreground">
										{assignment.progress}%
									</div>
									<p className="text-muted-foreground text-xs">Complete</p>
								</div>
							</div>

							<div className="mb-4">
								<Progress value={assignment.progress} className="h-3" />
							</div>

							<div className="flex items-center justify-between">
								<div className="flex space-x-2">
									{assignment.status === "completed" ? (
										<Button
											variant="outline"
											className="transform bg-transparent transition-all hover:scale-105 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950"
										>
											<CheckCircle className="mr-2 h-4 w-4" />
											View Results
										</Button>
									) : (
										<Button
											className="transform bg-gradient-to-r from-orange-500 to-red-500 text-white transition-all hover:scale-105 hover:from-orange-600 hover:to-red-600"
											onClick={() => {
												console.log(`Starting assignment: ${assignment.title}`);
											}}
										>
											<BookOpen className="mr-2 h-4 w-4" />
											{assignment.status === "pending"
												? "Start Assignment"
												: "Continue"}
										</Button>
									)}
									<Button
										variant="outline"
										className="transform bg-transparent transition-all hover:scale-105 hover:bg-accent"
									>
										<FileText className="mr-2 h-4 w-4" />
										Details
									</Button>
								</div>

								{assignment.status === "overdue" && (
									<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
										<AlertCircle className="mr-1 h-3 w-3" />
										Overdue
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Stats */}
			<Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl dark:from-indigo-950 dark:to-purple-950">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
							<Award className="h-5 w-5 text-white" />
						</div>
						<span>Assignment Performance</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-indigo-600 dark:text-indigo-400">
								{Math.round((completedCount / assignments.length) * 100)}%
							</div>
							<p className="text-muted-foreground text-sm">Completion Rate</p>
							<Progress
								value={(completedCount / assignments.length) * 100}
								className="mt-2"
							/>
						</div>

						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-green-600 dark:text-green-400">
								{assignments.filter((a) => a.status === "completed").length}
							</div>
							<p className="text-muted-foreground text-sm">
								Assignments Completed
							</p>
							<Badge className="mt-2 bg-green-500 text-white">
								Great Progress!
							</Badge>
						</div>

						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-orange-600 dark:text-orange-400">
								{Math.round(
									assignments.reduce((sum, a) => sum + a.progress, 0) /
										assignments.length,
								)}
								%
							</div>
							<p className="text-muted-foreground text-sm">Average Progress</p>
							<Badge className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
								<Target className="mr-1 h-3 w-3" />
								Keep Going!
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{filteredAssignments.length === 0 && (
				<Card className="border-0 shadow-xl">
					<CardContent className="p-12 text-center">
						<FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
						<h3 className="mb-2 font-bold text-foreground text-xl">
							No assignments found
						</h3>
						<p className="mb-6 text-muted-foreground">
							Try adjusting your search criteria or check back later for new
							assignments.
						</p>
						<Button
							onClick={() => {
								setSearchTerm("");
								setSelectedStatus("all");
							}}
							className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
						>
							Clear Filters
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
