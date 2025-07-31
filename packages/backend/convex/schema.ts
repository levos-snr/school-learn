import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
	users: defineTable({
		name: v.string(),
		email: v.string(),
		tokenIdentifier: v.string(),
		pictureUrl: v.optional(v.string()),
		createdAt: v.number(),
		onboardingCompleted: v.optional(v.boolean()),
		preferences: v.optional(
			v.object({
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
		),
	}).index("by_token", ["tokenIdentifier"]),
});
