"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	BookOpen,
	CheckCircle,
	Edit,
	Eye,
	Plus,
	Search,
	Trash2,
	Users,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import ComprehensiveCourseCreator from "./comprehensive-course-creator";

export function CoursesManagementTab() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [showCourseCreator, setShowCourseCreator] = useState(false);
	const router = useRouter();

	const coursesData = useQuery(api.admin.getAdminCourses, {
		search: searchQuery || undefined,
		category: selectedCategory === "all" ? undefined : selectedCategory,
		limit: 50,
	});

	const updateCourse = useMutation(api.admin.updateAdminCourse);
	const deleteCourse = useMutation(api.admin.deleteAdminCourse);

	const courses = coursesData?.courses || [];

	const handleTogglePublish = async (
		courseId: string,
		isPublished: boolean,
	) => {
		try {
			await updateCourse({
				courseId: courseId as any,
				isPublished: !isPublished,
			});
			toast.success(
				`Course ${!isPublished ? "published" : "unpublished"} successfully`,
			);
		} catch (error) {
			toast.error("Failed to update course status");
		}
	};

	const handleDeleteCourse = async (courseId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this course? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			await deleteCourse({ courseId: courseId as any });
			toast.success("Course deleted successfully");
		} catch (error) {
			toast.error("Failed to delete course");
		}
	};

	const handleEditCourse = (courseId: string) => {
		router.push(`/admin/courses/${courseId}/edit`);
	};

	const filteredCourses = courses.filter((course) => {
		if (selectedStatus === "published" && !course.isPublished) return false;
		if (selectedStatus === "draft" && course.isPublished) return false;
		return true;
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Course Management</CardTitle>
							<CardDescription>
								Manage all courses on the platform
							</CardDescription>
						</div>
						<Button
							onClick={() => setShowCourseCreator(true)}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Create Course
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Filters */}
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								placeholder="Search courses..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}
						>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="Mathematics">Mathematics</SelectItem>
								<SelectItem value="Science">Science</SelectItem>
								<SelectItem value="English">English</SelectItem>
								<SelectItem value="History">History</SelectItem>
								<SelectItem value="Computer Science">
									Computer Science
								</SelectItem>
							</SelectContent>
						</Select>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="published">Published</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-blue-500" />
									<div>
										<p className="text-muted-foreground text-sm">
											Total Courses
										</p>
										<p className="font-bold text-2xl">{courses.length}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<div>
										<p className="text-muted-foreground text-sm">Published</p>
										<p className="font-bold text-2xl">
											{courses.filter((c) => c.isPublished).length}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<Edit className="h-4 w-4 text-yellow-500" />
									<div>
										<p className="text-muted-foreground text-sm">Drafts</p>
										<p className="font-bold text-2xl">
											{courses.filter((c) => !c.isPublished).length}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-purple-500" />
									<div>
										<p className="text-muted-foreground text-sm">
											Total Students
										</p>
										<p className="font-bold text-2xl">
											{courses.reduce((sum, c) => sum + (c.students || 0), 0)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Courses Table */}
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Course</TableHead>
									<TableHead>Instructor</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Students</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCourses.map((course) => (
									<TableRow key={course._id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
													{course.title.charAt(0)}
												</div>
												<div>
													<p className="font-medium">{course.title}</p>
													<p className="line-clamp-1 text-muted-foreground text-sm">
														{course.description}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs">
													{course.instructorName?.charAt(0)}
												</div>
												<span className="text-sm">{course.instructorName}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{course.category}</Badge>
										</TableCell>
										<TableCell>{course.students || 0}</TableCell>
										<TableCell>
											<Badge
												variant={course.isPublished ? "default" : "secondary"}
											>
												{course.isPublished ? "Published" : "Draft"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<span className="text-sm">⭐</span>
												<span className="text-sm">
													{course.rating?.toFixed(1) || "N/A"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													className="cursor-pointer bg-transparent"
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="cursor-pointer bg-transparent"
													onClick={() => handleEditCourse(course._id)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="cursor-pointer bg-transparent"
													onClick={() =>
														handleTogglePublish(course._id, course.isPublished)
													}
												>
													{course.isPublished ? (
														<XCircle className="h-4 w-4" />
													) : (
														<CheckCircle className="h-4 w-4" />
													)}
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="cursor-pointer bg-transparent"
													onClick={() => handleDeleteCourse(course._id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{filteredCourses.length === 0 && (
						<div className="py-8 text-center">
							<BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="font-medium text-lg">No courses found</h3>
							<p className="text-muted-foreground">
								Try adjusting your search criteria
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Course Creator Modal */}
			{showCourseCreator && (
				<ComprehensiveCourseCreator
					onClose={() => setShowCourseCreator(false)}
					userRole="admin"
				/>
			)}
		</div>
	);
}
