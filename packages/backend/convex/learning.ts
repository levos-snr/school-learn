import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Progress Tracking
export const updateProgress = mutation({
	args: {
		courseId: v.id("courses"),
		moduleId: v.optional(v.id("modules")),
		lessonId: v.optional(v.id("lessons")),
		progressType: v.union(
			v.literal("course"),
			v.literal("module"),
			v.literal("lesson"),
		),
		completionPercentage: v.number(),
		timeSpent: v.number(),
		isCompleted: v.optional(v.boolean()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Check if progress record exists
		const progressQuery = ctx.db
			.query("userProgress")
			.withIndex("by_user_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			);

		const existingProgress = await progressQuery
			.filter((q) => {
				let filter = q.eq(q.field("progressType"), args.progressType);
				if (args.moduleId) {
					filter = q.and(filter, q.eq(q.field("moduleId"), args.moduleId));
				}
				if (args.lessonId) {
					filter = q.and(filter, q.eq(q.field("lessonId"), args.lessonId));
				}
				return filter;
			})
			.unique();

		const progressData = {
			userId: user._id,
			courseId: args.courseId,
			moduleId: args.moduleId,
			lessonId: args.lessonId,
			progressType: args.progressType,
			completionPercentage: args.completionPercentage,
			timeSpent: args.timeSpent,
			lastAccessed: Date.now(),
			isCompleted: args.isCompleted || args.completionPercentage >= 100,
			notes: args.notes,
			bookmarks: existingProgress?.bookmarks || [],
		};

		if (existingProgress) {
			// Update existing progress
			await ctx.db.patch(existingProgress._id, {
				...progressData,
				timeSpent: existingProgress.timeSpent + args.timeSpent,
			});
			return existingProgress._id;
		}
		// Create new progress record
		return await ctx.db.insert("userProgress", progressData);
	},
});

export const getUserProgress = query({
	args: {
		courseId: v.id("courses"),
		moduleId: v.optional(v.id("modules")),
		lessonId: v.optional(v.id("lessons")),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			return null;
		}

		const query = ctx.db
			.query("userProgress")
			.withIndex("by_user_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			);

		if (args.lessonId) {
			const progress = await query
				.filter((q) => q.eq(q.field("lessonId"), args.lessonId))
				.unique();
			return progress;
		}

		if (args.moduleId) {
			const progress = await query
				.filter((q) => q.eq(q.field("moduleId"), args.moduleId))
				.collect();
			return progress;
		}

		// Return all progress for the course
		return await query.collect();
	},
});

export const addBookmark = mutation({
	args: {
		courseId: v.id("courses"),
		lessonId: v.id("lessons"),
		timestamp: v.number(),
		note: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Find the lesson progress record
		const progress = await ctx.db
			.query("userProgress")
			.withIndex("by_user_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.filter((q) => q.eq(q.field("lessonId"), args.lessonId))
			.unique();

		if (!progress) {
			throw new Error("Progress record not found");
		}

		const newBookmark = {
			timestamp: args.timestamp,
			note: args.note,
			createdAt: Date.now(),
		};

		const updatedBookmarks = [...(progress.bookmarks || []), newBookmark];

		await ctx.db.patch(progress._id, {
			bookmarks: updatedBookmarks,
		});

		return newBookmark;
	},
});

export const removeBookmark = mutation({
	args: {
		courseId: v.id("courses"),
		lessonId: v.id("lessons"),
		timestamp: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Find the lesson progress record
		const progress = await ctx.db
			.query("userProgress")
			.withIndex("by_user_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.filter((q) => q.eq(q.field("lessonId"), args.lessonId))
			.unique();

		if (!progress) {
			throw new Error("Progress record not found");
		}

		const updatedBookmarks = (progress.bookmarks || []).filter(
			(bookmark) => bookmark.timestamp !== args.timestamp,
		);

		await ctx.db.patch(progress._id, {
			bookmarks: updatedBookmarks,
		});

		return { success: true };
	},
});

export const getCourseProgress = query({
	args: { courseId: v.id("courses") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			return null;
		}

		// Get all progress records for this course
		const progressRecords = await ctx.db
			.query("userProgress")
			.withIndex("by_user_course", (q) =>
				q.eq("userId", user._id).eq("courseId", args.courseId),
			)
			.collect();

		// Get course details
		const course = await ctx.db.get(args.courseId);
		if (!course) {
			return null;
		}

		// Get all lessons in the course
		const lessons = await ctx.db
			.query("lessons")
			.withIndex("by_course", (q) => q.eq("courseId", args.courseId))
			.collect();

		// Calculate overall progress
		const completedLessons = progressRecords.filter(
			(p) => p.progressType === "lesson" && p.isCompleted,
		).length;

		const totalLessons = lessons.length;
		const overallProgress =
			totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

		// Calculate total time spent
		const totalTimeSpent = progressRecords.reduce(
			(total, record) => total + (record.timeSpent || 0),
			0,
		);

		return {
			courseId: args.courseId,
			overallProgress,
			completedLessons,
			totalLessons,
			totalTimeSpent,
			progressRecords,
		};
	},
});
