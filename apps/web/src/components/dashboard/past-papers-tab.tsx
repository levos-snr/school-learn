"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
	BookOpen,
	Calendar,
	Clock,
	Download,
	Eye,
	FileText,
	Heart,
	Search,
	Star,
	TrendingDown,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

export function PastPapersTab() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSubject, setSelectedSubject] = useState("all");
	const [selectedYear, setSelectedYear] = useState("all");
	const pastPapers = useQuery(api.dashboard.getPastPapers);

	const subjects = [
		{ id: "all", label: "All Subjects" },
		{ id: "Mathematics", label: "Mathematics" },
		{ id: "Physics", label: "Physics" },
		{ id: "Chemistry", label: "Chemistry" },
		{ id: "Biology", label: "Biology" },
		{ id: "English", label: "English" },
		{ id: "Kiswahili", label: "Kiswahili" },
		{ id: "History", label: "History & Government" },
	];

	const years = [
		{ id: "all", label: "All Years" },
		{ id: "2024", label: "2024" },
		{ id: "2023", label: "2023" },
		{ id: "2022", label: "2022" },
		{ id: "2021", label: "2021" },
		{ id: "2020", label: "2020" },
	];

	const filteredPapers =
		pastPapers?.filter((paper) => {
			const matchesSearch =
				paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				paper.subject.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesSubject =
				selectedSubject === "all" || paper.subject === selectedSubject;
			const matchesYear =
				selectedYear === "all" || paper.year.toString() === selectedYear;

			return matchesSearch && matchesSubject && matchesYear;
		}) || [];

	const getSubjectColor = (subject: string) => {
		const colors = {
			Mathematics: "from-blue-400 to-blue-600",
			Physics: "from-green-400 to-green-600",
			Chemistry: "from-purple-400 to-purple-600",
			Biology: "from-emerald-400 to-emerald-600",
			English: "from-pink-400 to-pink-600",
			Kiswahili: "from-orange-400 to-orange-600",
			History: "from-indigo-400 to-indigo-600",
		};
		return (
			colors[subject as keyof typeof colors] || "from-gray-400 to-gray-600"
		);
	};

	const getSubjectIcon = (subject: string) => {
		const icons = {
			Mathematics: "📐",
			Physics: "⚛️",
			Chemistry: "🧪",
			Biology: "🧬",
			English: "📚",
			Kiswahili: "🗣️",
			History: "🏛️",
		};
		return icons[subject as keyof typeof icons] || "📄";
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
				className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
				variants={itemVariants}
			>
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-foreground">
						<Download className="h-8 w-8 text-primary" />
						<span>Past Papers Library</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Download KCSE and school exam papers to boost your preparation!
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
						title: "Total Papers",
						value: pastPapers?.length || 0,
						icon: FileText,
						color: "text-blue-600 dark:text-blue-400",
						bgColor: "bg-blue-50 dark:bg-blue-950/50",
						iconBg: "bg-blue-500",
					},
					{
						title: "KCSE Papers",
						value: pastPapers?.filter((p) => p.type === "KCSE").length || 0,
						icon: Star,
						color: "text-green-600 dark:text-green-400",
						bgColor: "bg-green-50 dark:bg-green-950/50",
						iconBg: "bg-green-500",
					},
					{
						title: "CAT Papers",
						value: pastPapers?.filter((p) => p.type === "CAT").length || 0,
						icon: BookOpen,
						color: "text-purple-600 dark:text-purple-400",
						bgColor: "bg-purple-50 dark:bg-purple-950/50",
						iconBg: "bg-purple-500",
					},
					{
						title: "Downloads",
						value:
							pastPapers?.reduce((sum, paper) => sum + paper.downloads, 0) || 0,
						icon: TrendingDown,
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
										placeholder="Search papers by title or subject..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="border-2 pl-10 focus:border-primary"
									/>
								</div>
							</div>

							<div className="flex gap-3">
								<select
									value={selectedSubject}
									onChange={(e) => setSelectedSubject(e.target.value)}
									className="rounded-lg border-2 border-border bg-background px-4 py-2 text-foreground focus:border-primary"
								>
									{subjects.map((subject) => (
										<option key={subject.id} value={subject.id}>
											{subject.label}
										</option>
									))}
								</select>

								<select
									value={selectedYear}
									onChange={(e) => setSelectedYear(e.target.value)}
									className="rounded-lg border-2 border-border bg-background px-4 py-2 text-foreground focus:border-primary"
								>
									{years.map((year) => (
										<option key={year.id} value={year.id}>
											{year.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Papers Grid */}
			<motion.div
				className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
				variants={containerVariants}
			>
				{filteredPapers.map((paper, index) => (
					<motion.div
						key={paper.id}
						variants={itemVariants}
						whileHover="hover"
						custom={index}
					>
						<motion.div variants={cardHoverVariants}>
							<Card className="group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
								<div
									className={`h-2 bg-gradient-to-r ${getSubjectColor(paper.subject)} rounded-t-lg`}
								/>
								<CardContent className="p-6">
									<div className="mb-4 flex items-start justify-between">
										<div className="flex items-center space-x-3">
											<div className="text-2xl">
												{getSubjectIcon(paper.subject)}
											</div>
											<div>
												<h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
													{paper.title}
												</h3>
												<p className="text-muted-foreground text-sm">
													{paper.subject} • {paper.form}
												</p>
											</div>
										</div>
										<Badge
											className={`bg-gradient-to-r ${getSubjectColor(paper.subject)} text-white`}
										>
											{paper.type}
										</Badge>
									</div>

									<div className="mb-4 space-y-3">
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2 text-muted-foreground">
												<Calendar className="h-4 w-4" />
												<span>Year: {paper.year}</span>
											</div>
											<div className="flex items-center space-x-2 text-muted-foreground">
												<FileText className="h-4 w-4" />
												<span>{paper.fileSize}</span>
											</div>
										</div>

										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2 text-muted-foreground">
												<Users className="h-4 w-4" />
												<span>{paper.downloads} downloads</span>
											</div>
											<div className="flex items-center space-x-2 text-muted-foreground">
												<Clock className="h-4 w-4" />
												<span>Added {paper.uploadDate}</span>
											</div>
										</div>
									</div>

									<div className="flex space-x-2">
										<Button
											className="flex-1 transform bg-gradient-to-r from-primary to-primary/80 transition-all hover:scale-105"
											onClick={() => {
												console.log(`Downloading ${paper.title}`);
											}}
										>
											<Download className="mr-2 h-4 w-4" />
											Download
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="transform bg-transparent transition-all hover:scale-105 hover:bg-accent"
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="transform bg-transparent transition-all hover:scale-105 hover:bg-accent hover:text-red-600 dark:hover:text-red-400"
										>
											<Heart className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</motion.div>
				))}
			</motion.div>

			{/* Popular Papers */}
			<motion.div variants={itemVariants}>
				<Card className="border-0 shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<Star className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-foreground">Most Downloaded This Week</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.div
							className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
							variants={containerVariants}
						>
							{pastPapers?.slice(0, 4).map((paper, index) => (
								<motion.div key={paper.id} variants={itemVariants}>
									<div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-md">
										<div className="flex-shrink-0">
											<div
												className={`h-10 w-10 bg-gradient-to-r ${getSubjectColor(paper.subject)} flex items-center justify-center rounded-lg font-bold text-white`}
											>
												#{index + 1}
											</div>
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-foreground text-sm">
												{paper.title}
											</p>
											<p className="text-muted-foreground text-xs">
												{paper.downloads} downloads
											</p>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>

			{filteredPapers.length === 0 && (
				<motion.div variants={itemVariants}>
					<Card className="border-0 shadow-xl">
						<CardContent className="p-12 text-center">
							<FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
							<h3 className="mb-2 font-bold text-foreground text-xl">
								No papers found
							</h3>
							<p className="mb-6 text-muted-foreground">
								Try adjusting your search criteria or filters.
							</p>
							<Button
								onClick={() => {
									setSearchTerm("");
									setSelectedSubject("all");
									setSelectedYear("all");
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
