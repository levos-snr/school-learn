// convex/tests.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tests for the current user
export const list = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) return [];

		// Get user's enrollments to find their courses
		const enrollments = await ctx.db
			.query("enrollments")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		const courseIds = enrollments.map((e) => e.courseId);

		// Get tests for user's courses
		const allTests = await Promise.all(
			courseIds.map(async (courseId) => {
				return await ctx.db
					.query("tests")
					.withIndex("by_course", (q) => q.eq("courseId", courseId))
					.collect();
			}),
		);

		const tests = allTests.flat();

		// Get user's test attempts
		const testAttempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		const attemptMap = new Map();
		testAttempts.forEach((attempt) => {
			const existing = attemptMap.get(attempt.testId);
			if (!existing || attempt.score > existing.score) {
				attemptMap.set(attempt.testId, attempt);
			}
		});

		// Format tests with attempt info
		const formattedTests = await Promise.all(
			tests.map(async (test) => {
				const course = await ctx.db.get(test.courseId);
				const bestAttempt = attemptMap.get(test._id);

				return {
					_id: test._id,
					title: test.title,
					description: test.description,
					timeLimit: test.timeLimit,
					maxAttempts: test.maxAttempts,
					passingScore: test.passingScore,
					courseTitle: course?.title || "Unknown Course",
					bestScore: bestAttempt?.score || null,
					status: bestAttempt
						? "completed"
						: test.isPublished
							? "available"
							: "upcoming",
					attemptsUsed: testAttempts.filter((a) => a.testId === test._id)
						.length,
				};
			}),
		);

		return formattedTests;
	},
});

// Get tests for a course
export const getCourseTests = query({
	args: { courseId: v.id("courses") },
	handler: async (ctx, args) => {
		const tests = await ctx.db
			.query("tests")
			.withIndex("by_course", (q) => q.eq("courseId", args.courseId))
			.collect();

		return tests;
	},
});

// Get test by ID
export const getTestById = query({
	args: { testId: v.id("tests") },
	handler: async (ctx, args) => {
		const test = await ctx.db.get(args.testId);
		if (!test) return null;

		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return test;

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) return test;

		// Get user's attempts
		const attempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_test_user", (q) =>
				q.eq("testId", args.testId).eq("userId", user._id),
			)
			.collect();

		return {
			...test,
			userAttempts: attempts,
			attemptsRemaining: test.maxAttempts
				? test.maxAttempts - attempts.length
				: null,
		};
	},
});

// Create test
export const createTest = mutation({
	args: {
		courseId: v.id("courses"),
		title: v.string(),
		description: v.string(),
		timeLimit: v.number(),
		maxAttempts: v.number(),
		passingScore: v.number(),
		questions: v.array(
			v.object({
				question: v.string(),
				type: v.union(
					v.literal("multiple_choice"),
					v.literal("true_false"),
					v.literal("short_answer"),
				),
				options: v.optional(v.array(v.string())),
				correctAnswer: v.string(),
				points: v.number(),
				explanation: v.optional(v.string()),
			}),
		),
		isPublished: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		// Check if user is instructor or admin
		if (user.role !== "instructor" && user.role !== "admin") {
			throw new Error(
				"Unauthorized - Only instructors and admins can create tests",
			);
		}

		const testId = await ctx.db.insert("tests", {
			...args,
			isPublished: args.isPublished ?? false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		return testId;
	},
});

// Update test
export const updateTest = mutation({
	args: {
		testId: v.id("tests"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		timeLimit: v.optional(v.number()),
		maxAttempts: v.optional(v.number()),
		passingScore: v.optional(v.number()),
		questions: v.optional(
			v.array(
				v.object({
					question: v.string(),
					type: v.union(
						v.literal("multiple_choice"),
						v.literal("true_false"),
						v.literal("short_answer"),
					),
					options: v.optional(v.array(v.string())),
					correctAnswer: v.string(),
					points: v.number(),
					explanation: v.optional(v.string()),
				}),
			),
		),
		isPublished: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		const test = await ctx.db.get(args.testId);
		if (!test) throw new Error("Test not found");

		// Check authorization
		if (user.role !== "admin") {
			const course = await ctx.db.get(test.courseId);
			if (!course || course.instructorId !== user._id) {
				throw new Error("Unauthorized");
			}
		}

		const { testId, ...updateData } = args;
		await ctx.db.patch(args.testId, {
			...updateData,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

// Delete test
export const deleteTest = mutation({
	args: {
		testId: v.id("tests"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		const test = await ctx.db.get(args.testId);
		if (!test) throw new Error("Test not found");

		// Check authorization
		if (user.role !== "admin") {
			const course = await ctx.db.get(test.courseId);
			if (!course || course.instructorId !== user._id) {
				throw new Error("Unauthorized");
			}
		}

		await ctx.db.delete(args.testId);
		return { success: true };
	},
});

// Submit test attempt
export const submitTestAttempt = mutation({
	args: {
		testId: v.id("tests"),
		answers: v.array(
			v.object({
				questionIndex: v.number(),
				answer: v.string(),
			}),
		),
		timeSpent: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		const test = await ctx.db.get(args.testId);
		if (!test) throw new Error("Test not found");

		// Check if user has attempts remaining
		const existingAttempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_test_user", (q) =>
				q.eq("testId", args.testId).eq("userId", user._id),
			)
			.collect();

		if (test.maxAttempts && existingAttempts.length >= test.maxAttempts) {
			throw new Error("Maximum attempts exceeded");
		}

		// Calculate score
		let totalPoints = 0;
		let earnedPoints = 0;

		test.questions.forEach((question, index) => {
			totalPoints += question.points;
			const userAnswer = args.answers.find((a) => a.questionIndex === index);
			if (userAnswer && userAnswer.answer === question.correctAnswer) {
				earnedPoints += question.points;
			}
		});

		const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

		const attemptId = await ctx.db.insert("testAttempts", {
			testId: args.testId,
			userId: user._id,
			answers: args.answers,
			score,
			startedAt: Date.now() - args.timeSpent * 1000,
			completedAt: Date.now(),
			timeSpent: args.timeSpent,
		});

		return {
			attemptId,
			score,
			passed: score >= test.passingScore,
		};
	},
});

// Get user's test attempts
export const getUserAttempts = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) return [];

		const testAttempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Get test details for each attempt
		const attemptsWithDetails = await Promise.all(
			testAttempts.map(async (attempt) => {
				const test = await ctx.db.get(attempt.testId);
				const course = test ? await ctx.db.get(test.courseId) : null;

				return {
					_id: attempt._id,
					testId: attempt.testId,
					testTitle: test?.title || "Unknown Test",
					courseTitle: course?.title || "Unknown Course",
					subject: course?.category || "General",
					score: attempt.score,
					percentage: attempt.score,
					totalPoints: test
						? test.questions.reduce((sum, q) => sum + q.points, 0)
						: 0,
					timeSpent: attempt.timeSpent,
					completedAt: attempt.completedAt,
					startedAt: attempt.startedAt,
					status: attempt.completedAt ? "completed" : "in_progress",
					passed: test ? attempt.score >= test.passingScore : false,
				};
			}),
		);

		return attemptsWithDetails;
	},
});

// Start a test attempt
export const startAttempt = mutation({
	args: {
		testId: v.id("tests"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		const test = await ctx.db.get(args.testId);
		if (!test) throw new Error("Test not found");

		if (!test.isPublished) {
			throw new Error("Test is not yet published");
		}

		// Check if user has attempts remaining
		const existingAttempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_test_user", (q) =>
				q.eq("testId", args.testId).eq("userId", user._id),
			)
			.collect();

		if (test.maxAttempts && existingAttempts.length >= test.maxAttempts) {
			throw new Error("Maximum attempts exceeded");
		}

		// Check if user has an incomplete attempt
		const incompleteAttempt = existingAttempts.find((a) => !a.completedAt);
		if (incompleteAttempt) {
			return {
				attemptId: incompleteAttempt._id,
				message: "Resuming existing attempt",
			};
		}

		// Create new attempt
		const attemptId = await ctx.db.insert("testAttempts", {
			testId: args.testId,
			userId: user._id,
			answers: [],
			score: 0,
			startedAt: Date.now(),
			timeSpent: 0,
		});

		return {
			attemptId,
			message: "Test attempt started successfully",
		};
	},
});

// Submit test attempt (alternative name for compatibility)
export const submitAttempt = mutation({
	args: {
		testId: v.id("tests"),
		answers: v.array(
			v.object({
				questionId: v.string(),
				answer: v.string(),
				isCorrect: v.boolean(),
				pointsEarned: v.number(),
			}),
		),
		timeSpent: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) throw new Error("User not found");

		const test = await ctx.db.get(args.testId);
		if (!test) throw new Error("Test not found");

		// Check if user has attempts remaining
		const existingAttempts = await ctx.db
			.query("testAttempts")
			.withIndex("by_test_user", (q) =>
				q.eq("testId", args.testId).eq("userId", user._id),
			)
			.collect();

		if (test.maxAttempts && existingAttempts.length >= test.maxAttempts) {
			throw new Error("Maximum attempts exceeded");
		}

		// Calculate total points and score
		const totalPoints = args.answers.reduce(
			(sum, answer) => sum + answer.pointsEarned,
			0,
		);
		const maxPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
		const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

		// Convert answers to the format expected by the database
		const dbAnswers = args.answers.map((answer, index) => ({
			questionIndex: index,
			answer: answer.answer,
		}));

		const attemptId = await ctx.db.insert("testAttempts", {
			testId: args.testId,
			userId: user._id,
			answers: dbAnswers,
			score,
			startedAt: Date.now() - args.timeSpent * 1000,
			completedAt: Date.now(),
			timeSpent: args.timeSpent,
		});

		// Award XP to user
		const xpAwarded = Math.floor(score / 10) * 5; // 5 XP per 10% score
		if (xpAwarded > 0) {
			const currentStats = user.stats;
			await ctx.db.patch(user._id, {
				stats: {
					...currentStats,
					totalXP: currentStats.totalXP + xpAwarded,
					level: Math.floor((currentStats.totalXP + xpAwarded) / 1000) + 1,
					testsCompleted: (currentStats.testsCompleted || 0) + 1,
				},
				updatedAt: Date.now(),
			});
		}

		return {
			attemptId,
			score,
			totalPoints,
			maxPoints,
			passed: score >= test.passingScore,
			xpAwarded,
		};
	},
});
