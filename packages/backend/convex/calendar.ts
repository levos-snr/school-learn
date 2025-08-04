// Create a new file: convex/calendar.ts

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getUserEvents = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lte(q.field("startTime"), args.endDate)
        )
      )
      .collect()
  },
})

export const getUpcomingEvents = query({
  args: {
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const now = Date.now()
    const endTime = now + (args.days * 24 * 60 * 60 * 1000)

    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), now),
          q.lte(q.field("startTime"), endTime)
        )
      )
      .order("asc")
      .collect()
  },
})

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("assignment"),
      v.literal("test"),
      v.literal("study-session"),
      v.literal("reminder"),
      v.literal("deadline"),
      v.literal("personal")
    ),
    startTime: v.number(),
    endTime: v.number(),
    relatedId: v.optional(v.string()),
    color: v.optional(v.string()),
    reminder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const eventId = await ctx.db.insert("calendarEvents", {
      userId: user._id,
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return eventId
  },
})

export const updateEvent = mutation({
  args: {
    eventId: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    color: v.optional(v.string()),
    reminder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get(args.eventId)
    if (!event || event.userId !== user._id) {
      throw new Error("Event not found or unauthorized")
    }

    const { eventId, ...updateData } = args
    await ctx.db.patch(args.eventId, {
      ...updateData,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const deleteEvent = mutation({
  args: {
    eventId: v.id("calendarEvents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get(args.eventId)
    if (!event || event.userId !== user._id) {
      throw new Error("Event not found or unauthorized")
    }

    await ctx.db.delete(args.eventId)
    return { success: true }
  },
})
