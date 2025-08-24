"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	Download,
	FileText,
	Search,
	Star,
	TrendingUp,
	Upload,
	Verified,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function PastPapersTab() {
	const [selectedSubject, setSelectedSubject] = useState<string>("all");
	const [selectedForm, setSelectedForm] = useState<string>("all");
	const [selectedYear, setSelectedYear] = useState<string>("all");
	const [selectedType, setSelectedType] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [uploadData, setUploadData] = useState({
		title: "",
		subject: "",
		form: "",
		year: new Date().getFullYear(),
		type: "End Term" as const,
		term: "",
		fileUrl: "",
		fileSize: "",
		tags: [] as string[],
	});

	const pastPapersQuery = useQuery(api.pastPapers.list, {
		subject: selectedSubject !== "all" ? selectedSubject : undefined,
		form: selectedForm !== "all" ? selectedForm : undefined,
		year: selectedYear !== "all" ? Number.parseInt(selectedYear) : undefined,
		type: selectedType !== "all" ? selectedType : undefined,
		search: searchQuery || undefined,
	});

	const subjects = useQuery(api.pastPapers.getSubjects);
	const forms = useQuery(api.pastPapers.getForms);
	const years = useQuery(api.pastPapers.getYears);
	const types = useQuery(api.pastPapers.getTypes);
	const stats = useQuery(api.pastPapers.getPastPaperStats);
	const popularPapers = useQuery(api.pastPapers.getPopularPapers, { limit: 5 });
	const recentPapers = useQuery(api.pastPapers.getRecentPapers, { limit: 5 });

	const downloadPaper = useMutation(api.pastPapers.downloadPastPaper);
	const uploadPaper = useMutation(api.pastPapers.uploadPastPaper);

	const handleDownload = async (paperId: string, title: string) => {
		try {
			const result = await downloadPaper({ paperId: paperId as any });

			// Create download link
			const link = document.createElement("a");
			link.href = result.fileUrl;
			link.download = result.fileName;
			link.click();

			toast.success(`Downloaded ${title}`);
		} catch (error) {
			toast.error("Failed to download paper");
		}
	};

	const handleUpload = async () => {
		if (
			!uploadData.title ||
			!uploadData.subject ||
			!uploadData.form ||
			!uploadData.fileUrl
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await uploadPaper(uploadData);
			toast.success("Past paper uploaded successfully! +50 XP");
			setUploadDialogOpen(false);
			setUploadData({
				title: "",
				subject: "",
				form: "",
				year: new Date().getFullYear(),
				type: "End Term",
				term: "",
				fileUrl: "",
				fileSize: "",
				tags: [],
			});
		} catch (error) {
			toast.error("Failed to upload paper");
		}
	};

	const pastPapers = pastPapersQuery?.papers || [];
	const totalPapers = stats?.totalPapers || 0;
	const totalDownloads = stats?.totalDownloads || 0;
	const kcsePapers = stats?.kcsePapers || 0;
	const verifiedPapers = stats?.verifiedPapers || 0;

	if (pastPapersQuery === undefined) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="pb-2">
								<div className="h-4 w-3/4 rounded bg-muted" />
								<div className="h-3 w-1/2 rounded bg-muted" />
							</CardHeader>
							<CardContent>
								<div className="h-8 w-1/4 rounded bg-muted" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Overview */}
			<StaggerContainer className="grid gap-4 md:grid-cols-4">
				<FadeIn>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Papers
							</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{totalPapers}</div>
							<p className="text-muted-foreground text-xs">
								Across all subjects
							</p>
						</CardContent>
					</Card>
				</FadeIn>

				<FadeIn>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Downloads
							</CardTitle>
							<Download className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{totalDownloads.toLocaleString()}
							</div>
							<p className="text-muted-foreground text-xs">
								Community downloads
							</p>
						</CardContent>
					</Card>
				</FadeIn>

				<FadeIn>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">KCSE Papers</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{kcsePapers}</div>
							<p className="text-muted-foreground text-xs">
								Official exam papers
							</p>
						</CardContent>
					</Card>
				</FadeIn>

				<FadeIn>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Verified Papers
							</CardTitle>
							<Verified className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{verifiedPapers}</div>
							<p className="text-muted-foreground text-xs">Quality assured</p>
						</CardContent>
					</Card>
				</FadeIn>
			</StaggerContainer>

			{/* Upload Button and Search */}
			<div className="flex items-center justify-between">
				<div className="relative max-w-md flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
					<Input
						placeholder="Search past papers..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Upload className="mr-2 h-4 w-4" />
							Upload Paper
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Upload Past Paper</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="title">Title *</Label>
								<Input
									id="title"
									value={uploadData.title}
									onChange={(e) =>
										setUploadData({ ...uploadData, title: e.target.value })
									}
									placeholder="e.g., Mathematics Form 4 End Term 1 2024"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="subject">Subject *</Label>
									<Select
										value={uploadData.subject}
										onValueChange={(value) =>
											setUploadData({ ...uploadData, subject: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select subject" />
										</SelectTrigger>
										<SelectContent>
											{subjects?.map((subject) => (
												<SelectItem key={subject.name} value={subject.name}>
													{subject.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="form">Form *</Label>
									<Select
										value={uploadData.form}
										onValueChange={(value) =>
											setUploadData({ ...uploadData, form: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select form" />
										</SelectTrigger>
										<SelectContent>
											{forms?.map((form) => (
												<SelectItem key={form} value={form}>
													{form}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="year">Year</Label>
									<Input
										id="year"
										type="number"
										value={uploadData.year}
										onChange={(e) =>
											setUploadData({
												...uploadData,
												year: Number.parseInt(e.target.value),
											})
										}
									/>
								</div>

								<div>
									<Label htmlFor="type">Type</Label>
									<Select
										value={uploadData.type}
										onValueChange={(value: any) =>
											setUploadData({ ...uploadData, type: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="End Term">End Term</SelectItem>
											<SelectItem value="Mid Term">Mid Term</SelectItem>
											<SelectItem value="KCSE">KCSE</SelectItem>
											<SelectItem value="Mock">Mock</SelectItem>
											<SelectItem value="CAT">CAT</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor="fileUrl">File URL *</Label>
								<Input
									id="fileUrl"
									value={uploadData.fileUrl}
									onChange={(e) =>
										setUploadData({ ...uploadData, fileUrl: e.target.value })
									}
									placeholder="https://example.com/paper.pdf"
								/>
							</div>

							<div>
								<Label htmlFor="fileSize">File Size</Label>
								<Input
									id="fileSize"
									value={uploadData.fileSize}
									onChange={(e) =>
										setUploadData({ ...uploadData, fileSize: e.target.value })
									}
									placeholder="e.g., 2.5 MB"
								/>
							</div>

							<Button onClick={handleUpload} className="w-full">
								Upload Paper
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Filters */}
			<div className="grid gap-4 md:grid-cols-4">
				<Select value={selectedSubject} onValueChange={setSelectedSubject}>
					<SelectTrigger>
						<SelectValue placeholder="Filter by subject" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Subjects</SelectItem>
						{subjects?.map((subject) => (
							<SelectItem key={subject.name} value={subject.name}>
								{subject.name} ({subject.count})
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={selectedForm} onValueChange={setSelectedForm}>
					<SelectTrigger>
						<SelectValue placeholder="Filter by form" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Forms</SelectItem>
						{forms?.map((form) => (
							<SelectItem key={form} value={form}>
								{form}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={selectedYear} onValueChange={setSelectedYear}>
					<SelectTrigger>
						<SelectValue placeholder="Filter by year" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Years</SelectItem>
						{years?.map((year) => (
							<SelectItem key={year} value={year.toString()}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={selectedType} onValueChange={setSelectedType}>
					<SelectTrigger>
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{types?.map((type) => (
							<SelectItem key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Papers Grid */}
			<StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{pastPapers.map((paper) => {
					const isPopular = paper.downloads > 100;
					const isRecent = paper.year >= new Date().getFullYear() - 1;
					const isVerified = paper.isVerified;

					return (
						<FadeIn key={paper._id}>
							<Card className="transition-all hover:shadow-md">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex-1 space-y-1">
											<CardTitle className="line-clamp-2 text-lg">
												{paper.title}
											</CardTitle>
											<CardDescription>
												{paper.subject} • {paper.form} • {paper.year}
											</CardDescription>
										</div>
										<div className="ml-2 flex flex-col gap-1">
											{isVerified && (
												<Badge
													variant="default"
													className="bg-green-600 text-xs"
												>
													<Verified className="mr-1 h-3 w-3" />
													Verified
												</Badge>
											)}
											{isPopular && (
												<Badge variant="secondary" className="text-xs">
													Popular
												</Badge>
											)}
											{isRecent && (
												<Badge variant="outline" className="text-xs">
													New
												</Badge>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between text-muted-foreground text-sm">
										<div className="flex items-center gap-1">
											<FileText className="h-4 w-4" />
											<span>{paper.fileSize}</span>
										</div>
										<div className="flex items-center gap-1">
											<Download className="h-4 w-4" />
											<span>{paper.downloads} downloads</span>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											{paper.type}
										</Badge>
										{paper.term && (
											<Badge variant="outline" className="text-xs">
												{paper.term}
											</Badge>
										)}
									</div>

									<div className="flex items-center justify-between">
										<div className="text-muted-foreground text-xs">
											By {paper.uploaderName}
										</div>
										<div className="text-muted-foreground text-xs">
											{new Date(paper.createdAt).toLocaleDateString()}
										</div>
									</div>

									<Button
										onClick={() => handleDownload(paper._id, paper.title)}
										className="w-full"
									>
										<Download className="mr-2 h-4 w-4" />
										Download Paper
									</Button>
								</CardContent>
							</Card>
						</FadeIn>
					);
				})}
			</StaggerContainer>

			{pastPapers.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-medium text-lg">No past papers found</h3>
						<p className="text-center text-muted-foreground">
							{searchQuery ||
							selectedSubject !== "all" ||
							selectedForm !== "all" ||
							selectedYear !== "all" ||
							selectedType !== "all"
								? "Try adjusting your search or filters to find more papers."
								: "Past papers will be added soon. Check back later!"}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Popular and Recent Papers */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<TrendingUp className="mr-2 h-5 w-5" />
							Popular Papers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{popularPapers?.slice(0, 5).map((paper) => (
								<div
									key={paper._id}
									className="flex items-center justify-between rounded border p-2"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{paper.title}
										</p>
										<p className="text-muted-foreground text-xs">
											{paper.downloads} downloads
										</p>
									</div>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleDownload(paper._id, paper.title)}
									>
										<Download className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Star className="mr-2 h-5 w-5" />
							Recent Papers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{recentPapers?.slice(0, 5).map((paper) => (
								<div
									key={paper._id}
									className="flex items-center justify-between rounded border p-2"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{paper.title}
										</p>
										<p className="text-muted-foreground text-xs">
											{new Date(paper.createdAt).toLocaleDateString()}
										</p>
									</div>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleDownload(paper._id, paper.title)}
									>
										<Download className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
