import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		tokenIdentifier: v.string(),
		email: v.string(),
		pictureUrl: v.optional(v.string()), // Added this field
		createdAt: v.number(), // Added this field
		onboardingCompleted: v.boolean(),
		preferences: v.optional(
			v.object({
				subjects: v.array(v.string()),
				goals: v.array(v.string()),
				studyTime: v.string(),
				schedule: v.array(v.string()),
				level: v.string(),
			}),
		),
		profile: v.optional(
			v.object({
				avatar: v.optional(v.string()),
				bio: v.optional(v.string()),
				grade: v.optional(v.string()),
				school: v.optional(v.string()),
			}),
		),
		stats: v.optional(
			v.object({
				totalStudyTime: v.number(),
				coursesCompleted: v.number(),
				assignmentsCompleted: v.number(),
				testsCompleted: v.number(),
				currentStreak: v.number(),
			}),
		),
	}).index("by_token", ["tokenIdentifier"]),

	todos: defineTable({
		text: v.string(),
		isCompleted: v.boolean(),
		userId: v.id("users"),
	}).index("by_user", ["userId"]),

	courses: defineTable({
		title: v.string(),
		description: v.string(),
		instructor: v.string(),
		category: v.string(),
		level: v.string(),
		duration: v.string(),
		totalLessons: v.number(),
		rating: v.number(),
		students: v.number(),
		thumbnail: v.optional(v.string()),
		tags: v.array(v.string()),
		isPublished: v.boolean(),
		createdAt: v.number(),
	}),

	enrollments: defineTable({
		userId: v.id("users"),
		courseId: v.id("courses"),
		progress: v.number(),
		completedLessons: v.array(v.string()),
		enrolledAt: v.number(),
		lastAccessedAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_course", ["courseId"]),

	assignments: defineTable({
		title: v.string(),
		description: v.string(),
		courseId: v.id("courses"),
		dueDate: v.number(),
		totalPoints: v.number(),
		instructions: v.string(),
		attachments: v.optional(v.array(v.string())),
		isPublished: v.boolean(),
		createdAt: v.number(),
	}).index("by_course", ["courseId"]),

	submissions: defineTable({
		userId: v.id("users"),
		assignmentId: v.id("assignments"),
		content: v.string(),
		attachments: v.optional(v.array(v.string())),
		submittedAt: v.number(),
		grade: v.optional(v.number()),
		feedback: v.optional(v.string()),
		status: v.string(), // "submitted", "graded", "returned"
	})
		.index("by_user", ["userId"])
		.index("by_assignment", ["assignmentId"]),

	tests: defineTable({
		title: v.string(),
		description: v.string(),
		courseId: v.id("courses"),
		questions: v.array(
			v.object({
				id: v.string(),
				question: v.string(),
				type: v.string(), // "multiple-choice", "true-false", "short-answer"
				options: v.optional(v.array(v.string())),
				correctAnswer: v.string(),
				points: v.number(),
			}),
		),
		duration: v.number(), // in minutes
		totalPoints: v.number(),
		dueDate: v.number(),
		isPublished: v.boolean(),
		createdAt: v.number(),
	}).index("by_course", ["courseId"]),

	testAttempts: defineTable({
		userId: v.id("users"),
		testId: v.id("tests"),
		answers: v.array(
			v.object({
				questionId: v.string(),
				answer: v.string(),
			}),
		),
		score: v.number(),
		totalPoints: v.number(),
		timeSpent: v.number(), // in seconds
		submittedAt: v.number(),
		isCompleted: v.boolean(),
	})
		.index("by_user", ["userId"])
		.index("by_test", ["testId"]),

	pastPapers: defineTable({
		title: v.string(),
		subject: v.string(),
		form: v.string(),
		year: v.number(),
		type: v.string(), // "KCSE", "CAT", "Mock"
		fileUrl: v.string(),
		fileSize: v.string(),
		downloads: v.number(),
		uploadedBy: v.id("users"),
		uploadedAt: v.number(),
		tags: v.array(v.string()),
	})
		.index("by_subject", ["subject"])
		.index("by_year", ["year"]),

	friends: defineTable({
		userId: v.id("users"),
		friendId: v.id("users"),
		status: v.string(), // "pending", "accepted", "blocked"
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_friend", ["friendId"]),

	studySessions: defineTable({
		userId: v.id("users"),
		courseId: v.optional(v.id("courses")),
		duration: v.number(), // in seconds
		startTime: v.number(),
		endTime: v.number(),
		notes: v.optional(v.string()),
		goals: v.optional(v.array(v.string())),
	}).index("by_user", ["userId"]),

	achievements: defineTable({
		userId: v.id("users"),
		type: v.string(), // "course_completion", "study_streak", "test_score", etc.
		title: v.string(),
		description: v.string(),
		icon: v.string(),
		points: v.number(),
		unlockedAt: v.number(),
	}).index("by_user", ["userId"]),

	notifications: defineTable({
		userId: v.id("users"),
		title: v.string(),
		message: v.string(),
		type: v.string(), // "assignment", "test", "achievement", "friend", etc.
		isRead: v.boolean(),
		actionUrl: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_user", ["userId"]),
});
