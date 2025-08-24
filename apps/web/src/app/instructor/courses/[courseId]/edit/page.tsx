"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ComprehensiveCourseCreator } from "@/components/instructor/comprehensive-course-creator";

export default function EditCoursePage() {
	const params = useParams();
	const courseId = params.courseId as Id<"courses">;

	const course = useQuery(api.courses.getCourse, { courseId });

	if (course === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>Course not found</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6">
			<ComprehensiveCourseCreator initialCourse={course} isEditing={true} />
		</div>
	);
}
