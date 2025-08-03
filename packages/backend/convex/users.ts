import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
  },
})

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication present")
    }

    // Check if we've already stored this user before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name })
      }
      return user._id
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name!,
      clerkId: identity.subject,
      email: identity.email!,
      imageUrl: identity.pictureUrl,
      onboardingCompleted: false,
      stats: {
        xpPoints: 0,
        level: 1,
        studyStreak: 0,
        coursesCompleted: 0,
        assignmentsCompleted: 0,
        testsCompleted: 0,
        totalStudyTime: 0,
        currentStreak: 0,
      },
      settings: {
        notifications: {
          email: true,
          push: true,
          assignments: true,
          deadlines: true,
          achievements: true,
          social: true,
        },
        privacy: {
          profileVisible: true,
          progressVisible: true,
          friendsVisible: true,
        },
        theme: "system",
        language: "en",
        timezone: "UTC",
      },
    })
  },
})

export const completeOnboarding = mutation({
  args: {
    age: v.string(),
    focus: v.string(),
    goal: v.string(),
    level: v.string(),
    recommendation: v.string(),
    schedule: v.string(),
    subject: v.string(),
    timeCommitment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) {
      throw new Error("User not found")
    }

    // Map onboarding data to profile structure
    const profile = {
      bio: `${args.focus} learner focused on ${args.goal}`,
      goals: [args.goal, args.focus],
      grade: args.level === "beginner" ? "Form 1" : args.level === "intermediate" ? "Form 2" : "Form 3",
      school: "Not specified",
      studySchedule: args.schedule,
      subjects: [args.subject],
      age: Number.parseInt(args.age),
      timeCommitment: args.timeCommitment,
      recommendation: args.recommendation,
    }

    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      profile,
    })

    return { success: true }
  },
})

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
  },
})

export const updateUserProfile = mutation({
  args: {
    name: v.string(),
    profile: v.object({
      bio: v.optional(v.string()),
      grade: v.optional(v.string()),
      school: v.optional(v.string()),
      avatar: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      name: args.name,
      profile: {
        ...user.profile,
        ...args.profile,
      },
    })

    return { success: true }
  },
})

export const updateUserSettings = mutation({
  args: {
    settings: v.object({
      notifications: v.object({
        email: v.boolean(),
        push: v.boolean(),
        assignments: v.boolean(),
        deadlines: v.boolean(),
        achievements: v.boolean(),
        social: v.boolean(),
      }),
      privacy: v.object({
        profileVisible: v.boolean(),
        progressVisible: v.boolean(),
        friendsVisible: v.boolean(),
      }),
      theme: v.string(),
      language: v.string(),
      timezone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      settings: args.settings,
    })

    return { success: true }
  },
})

