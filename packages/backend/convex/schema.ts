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
	}).index("by_token", ["tokenIdentifier"]),
});
