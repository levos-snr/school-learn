import { api } from "@school-learn/backend/convex/_generated/api";
import type { Id } from "@school-learn/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCourseLearning(courseId: Id<"courses">) {
	const course = useQuery(api.courses.getCourseById, { courseId });
	const lessons = useQuery(api.lessons.getLessonsSequential, { courseId });
	const isEnrolled = useQuery(api.courses.isEnrolled, { courseId });
	const user = useQuery(api.users.current);

	const completedLessons = lessons?.filter((l) => l.isCompleted).length ?? 0;
	const totalLessons = lessons?.length ?? 0;
	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

	const isLoading = !course || !lessons || isEnrolled === undefined;

	return {
		course,
		lessons,
		isEnrolled,
		user,
		completedLessons,
		totalLessons,
		progressPercentage,
		isLoading,
	};
}
