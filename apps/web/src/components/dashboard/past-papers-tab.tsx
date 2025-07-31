"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
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
		<div className="min-h-screen space-y-6 bg-gradient-to-br from-gray-50 to-white p-6">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-gray-900">
						<Download className="h-8 w-8 text-blue-500" />
						<span>Past Papers Library</span>
					</h1>
					<p className="mt-1 text-gray-600">
						Download KCSE and school exam papers to boost your preparation!
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-blue-600 text-sm">
									Total Papers
								</p>
								<p className="font-bold text-2xl text-blue-700">
									{pastPapers?.length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
								<FileText className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-green-600 text-sm">
									KCSE Papers
								</p>
								<p className="font-bold text-2xl text-green-700">
									{pastPapers?.filter((p) => p.type === "KCSE").length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
								<Star className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-purple-600 text-sm">
									CAT Papers
								</p>
								<p className="font-bold text-2xl text-purple-700">
									{pastPapers?.filter((p) => p.type === "CAT").length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
								<BookOpen className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-orange-600 text-sm">Downloads</p>
								<p className="font-bold text-2xl text-orange-700">
									{pastPapers?.reduce(
										(sum, paper) => sum + paper.downloads,
										0,
									) || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
								<TrendingDown className="h-6 w-6 text-white" />
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
									placeholder="Search papers by title or subject..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="border-2 pl-10 focus:border-blue-300"
								/>
							</div>
						</div>

						<div className="flex gap-3">
							<select
								value={selectedSubject}
								onChange={(e) => setSelectedSubject(e.target.value)}
								className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 focus:border-blue-300"
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
								className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 focus:border-blue-300"
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

			{/* Papers Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredPapers.map((paper) => (
					<Card
						key={paper.id}
						className="hover:-translate-y-2 group transform border-0 shadow-xl transition-all duration-300 hover:shadow-2xl"
					>
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
										<h3 className="font-bold text-gray-900 transition-colors group-hover:text-blue-600">
											{paper.title}
										</h3>
										<p className="text-gray-600 text-sm">
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
									<div className="flex items-center space-x-2 text-gray-600">
										<Calendar className="h-4 w-4" />
										<span>Year: {paper.year}</span>
									</div>
									<div className="flex items-center space-x-2 text-gray-600">
										<FileText className="h-4 w-4" />
										<span>{paper.fileSize}</span>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center space-x-2 text-gray-600">
										<Users className="h-4 w-4" />
										<span>{paper.downloads} downloads</span>
									</div>
									<div className="flex items-center space-x-2 text-gray-600">
										<Clock className="h-4 w-4" />
										<span>Added {paper.uploadDate}</span>
									</div>
								</div>
							</div>

							<div className="flex space-x-2">
								<Button
									className="flex-1 transform bg-gradient-to-r from-blue-500 to-purple-500 transition-all hover:scale-105 hover:from-blue-600 hover:to-purple-600"
									onClick={() => {
										// Handle download
										console.log(`Downloading ${paper.title}`);
									}}
								>
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="transform bg-transparent transition-all hover:scale-105 hover:bg-gray-50"
								>
									<Eye className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="transform bg-transparent transition-all hover:scale-105 hover:bg-red-50 hover:text-red-600"
								>
									<Heart className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Popular Papers */}
			<Card className="border-0 shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
							<Star className="h-5 w-5 text-white" />
						</div>
						<span>Most Downloaded This Week</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{pastPapers?.slice(0, 4).map((paper, index) => (
							<div
								key={paper.id}
								className="flex items-center space-x-3 rounded-lg border bg-gradient-to-r from-gray-50 to-white p-3 transition-all hover:shadow-md"
							>
								<div className="flex-shrink-0">
									<div
										className={`h-10 w-10 bg-gradient-to-r ${getSubjectColor(paper.subject)} flex items-center justify-center rounded-lg font-bold text-white`}
									>
										#{index + 1}
									</div>
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-gray-900 text-sm">
										{paper.title}
									</p>
									<p className="text-gray-500 text-xs">
										{paper.downloads} downloads
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{filteredPapers.length === 0 && (
				<Card className="border-0 shadow-xl">
					<CardContent className="p-12 text-center">
						<FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-bold text-gray-900 text-xl">
							No papers found
						</h3>
						<p className="mb-6 text-gray-600">
							Try adjusting your search criteria or filters.
						</p>
						<Button
							onClick={() => {
								setSearchTerm("");
								setSelectedSubject("all");
								setSelectedYear("all");
							}}
							className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
						>
							Clear Filters
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
