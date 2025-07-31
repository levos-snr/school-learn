import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Called storeUser without authentication present");
		}

		console.log("Identity found:", identity.tokenIdentifier, identity.name);

		// Check if we've already stored this identity before
		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (user !== null) {
			console.log("Existing user found:", user._id);
			// If we've seen this identity before but the name has changed, patch the value
			if (user.name !== identity.name) {
				await ctx.db.patch(user._id, { name: identity.name });
			}
			return user._id;
		}

		console.log("Creating new user...");
		// If it's a new identity, create a new `User`
		const userId = await ctx.db.insert("users", {
			name: identity.name ?? "Anonymous",
			email: identity.email ?? "",
			tokenIdentifier: identity.tokenIdentifier,
			pictureUrl: identity.pictureUrl ?? undefined,
			createdAt: Date.now(),
			onboardingCompleted: false,
			preferences: {
				subjects: [],
				goals: [],
				studyTime: "30",
				schedule: [],
				level: "beginner",
			},
			profile: {
				avatar: identity.pictureUrl ?? undefined,
				bio: "",
				grade: "",
				school: "",
			},
			stats: {
				totalStudyTime: 0,
				coursesCompleted: 0,
				assignmentsCompleted: 0,
				testsCompleted: 0,
				currentStreak: 0,
			},
		});

		console.log("New user created:", userId);
		return userId;
	},
});

export const current = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			console.log("No identity found in current query");
			return null;
		}

		console.log("Looking for user with token:", identity.tokenIdentifier);
		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		console.log("User found:", user ? user._id : "none");
		return user;
	},
});

export const getById = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});

export const updatePreferences = mutation({
	args: {
		preferences: v.object({
			subjects: v.optional(v.array(v.string())),
			goals: v.optional(v.array(v.string())),
			studyTime: v.optional(v.string()),
			schedule: v.optional(v.array(v.string())),
			level: v.optional(v.string()),
		}),
		onboardingCompleted: v.optional(v.boolean()),
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

		// Update preferences and onboardingCompleted
		const updateData: any = {};

		if (args.preferences) {
			updateData.preferences = {
				...user.preferences,
				...args.preferences,
			};
		}

		if (args.onboardingCompleted !== undefined) {
			updateData.onboardingCompleted = args.onboardingCompleted;
		}

		await ctx.db.patch(user._id, updateData);
		return { success: true };
	},
});

export const completeOnboarding = mutation({
	args: {
		goal: v.optional(v.string()),
		focus: v.optional(v.string()),
		subject: v.optional(v.string()),
		level: v.optional(v.string()),
		timeCommitment: v.optional(v.string()),
		schedule: v.optional(v.string()),
		recommendation: v.optional(v.string()),
		age: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		console.log("Completing onboarding for:", identity.tokenIdentifier);

		// Get the existing user
		let user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!user) {
			console.log("User not found, creating new user...");
			// Create user if doesn't exist
			const userId = await ctx.db.insert("users", {
				name: identity.name ?? "Anonymous",
				email: identity.email ?? "",
				tokenIdentifier: identity.tokenIdentifier,
				pictureUrl: identity.pictureUrl ?? undefined,
				createdAt: Date.now(),
				onboardingCompleted: false,
				preferences: {
					subjects: args.subject ? [args.subject] : [],
					goals: args.goal ? [args.goal] : [],
					studyTime: args.timeCommitment || "30",
					schedule: args.schedule ? [args.schedule] : [],
					level: args.level || "beginner",
				},
				profile: {
					avatar: identity.pictureUrl ?? undefined,
					bio: "",
					grade: "",
					school: "",
				},
				stats: {
					totalStudyTime: 0,
					coursesCompleted: 0,
					assignmentsCompleted: 0,
					testsCompleted: 0,
					currentStreak: 0,
				},
			});

			user = await ctx.db.get(userId);
		}

		if (!user) {
			throw new Error("Failed to create or find user");
		}

		console.log("Updating user preferences...");
		// Update with onboarding data
		await ctx.db.patch(user._id, {
			onboardingCompleted: true,
			preferences: {
				subjects: args.subject
					? [args.subject]
					: user.preferences?.subjects || [],
				goals: args.goal ? [args.goal] : user.preferences?.goals || [],
				studyTime: args.timeCommitment || user.preferences?.studyTime || "30",
				schedule: args.schedule
					? [args.schedule]
					: user.preferences?.schedule || [],
				level: args.level || user.preferences?.level || "beginner",
			},
		});

		console.log("Onboarding completed successfully");
		return { success: true, userId: user._id };
	},
});
