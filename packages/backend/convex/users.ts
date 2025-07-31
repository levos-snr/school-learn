import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Called storeUser without authentication present");
		}

		// Check if we've already stored this identity before
		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (user !== null) {
			// If we've seen this identity before but the name has changed, patch the value
			if (user.name !== identity.name) {
				await ctx.db.patch(user._id, { name: identity.name });
			}
			return user._id;
		}

		// If it's a new identity, create a new `User`
		return await ctx.db.insert("users", {
			name: identity.name ?? "Anonymous",
			email: identity.email ?? "",
			tokenIdentifier: identity.tokenIdentifier,
			pictureUrl: identity.pictureUrl,
			createdAt: Date.now(),
			onboardingCompleted: false,
			preferences: {},
		});
	},
});

export const current = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		return await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();
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
			goal: v.optional(v.string()),
			focus: v.optional(v.string()),
			subject: v.optional(v.string()),
			level: v.optional(v.string()),
			timeCommitment: v.optional(v.string()),
			schedule: v.optional(v.string()),
			recommendation: v.optional(v.string()),
			age: v.optional(v.string()),
			onboardingCompleted: v.optional(v.boolean()),
		}),
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

		// Update both preferences and onboardingCompleted at the top level
		await ctx.db.patch(user._id, {
			preferences: {
				...user.preferences,
				...args.preferences,
			},
			onboardingCompleted:
				args.preferences.onboardingCompleted ??
				user.onboardingCompleted ??
				false,
		});

		return { success: true };
	},
});
