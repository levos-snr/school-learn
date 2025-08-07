// convex/achievements.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getAvailableAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    // Get all achievements
    const allAchievements = await ctx.db.query("achievements").collect()
    
    // Get user's current achievements
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Filter out achievements the user already has
    const availableAchievements = allAchievements.filter(
      (achievement) => !userAchievements.some((ua) => ua.achievementId === achievement._id)
    )

    return availableAchievements
  },
})

export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get achievement details
    const achievementsWithDetails = await Promise.all(
      userAchievements.map(async (userAchievement) => {
        const achievement = await ctx.db.get(userAchievement.achievementId)
        return {
          ...userAchievement,
          achievement,
        }
      }),
    )

    return achievementsWithDetails
  },
})

export const getAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect()
  },
})

export const getAchievementById = query({
  args: { achievementId: v.id("achievements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.achievementId)
  },
})

export const createAchievement = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    points: v.number(),
    requirements: v.object({
      type: v.string(),
      target: v.number(),
      metric: v.string(),
    }),
    rarity: v.union(v.literal("common"), v.literal("rare"), v.literal("epic"), v.literal("legendary")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required")
    }

    const achievementId = await ctx.db.insert("achievements", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return achievementId
  },
})

export const updateAchievement = mutation({
  args: {
    achievementId: v.id("achievements"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    points: v.optional(v.number()),
    requirements: v.optional(v.object({
      type: v.string(),
      target: v.number(),
      metric: v.string(),
    })),
    rarity: v.optional(v.union(v.literal("common"), v.literal("rare"), v.literal("epic"), v.literal("legendary"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required")
    }

    const { achievementId, ...updateData } = args
    await ctx.db.patch(args.achievementId, {
      ...updateData,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const deleteAchievement = mutation({
  args: {
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required")
    }

    // Delete associated user achievements first
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_achievement", (q) => q.eq("achievementId", args.achievementId))
      .collect()

    await Promise.all(
      userAchievements.map(ua => ctx.db.delete(ua._id))
    )

    // Delete the achievement
    await ctx.db.delete(args.achievementId)
    return { success: true }
  },
})

export const unlockAchievement = mutation({
  args: {
    userId: v.id("users"),
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    // Check if already unlocked
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", (q) => q.eq("userId", args.userId).eq("achievementId", args.achievementId))
      .unique()

    if (existing) return { success: false, message: "Achievement already unlocked" }

    const achievement = await ctx.db.get(args.achievementId)
    if (!achievement) throw new Error("Achievement not found")

    // Unlock the achievement
    await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      unlockedAt: Date.now(),
      progress: 100,
    })

    // Award points to user
    const user = await ctx.db.get(args.userId)
    if (user) {
      const currentStats = user.stats
      await ctx.db.patch(args.userId, {
        stats: {
          ...currentStats,
          totalXP: currentStats.totalXP + achievement.points,
          level: Math.floor((currentStats.totalXP + achievement.points) / 1000) + 1,
        },
        updatedAt: Date.now(),
      })
    }

    return { success: true, pointsAwarded: achievement.points }
  },
})

export const checkAchievementProgress = mutation({
  args: {
    userId: v.id("users"),
    metric: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all achievements that match the metric
    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("requirements.metric"), args.metric))
      .collect()

    const unlockedAchievements = []

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existing = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_achievement", (q) => q.eq("userId", args.userId).eq("achievementId", achievement._id))
        .unique()

      if (!existing && args.value >= achievement.requirements.target) {
        // Unlock the achievement
        await ctx.db.insert("userAchievements", {
          userId: args.userId,
          achievementId: achievement._id,
          unlockedAt: Date.now(),
          progress: 100,
        })

        // Award points to user
        const user = await ctx.db.get(args.userId)
        if (user) {
          const currentStats = user.stats
          await ctx.db.patch(args.userId, {
            stats: {
              ...currentStats,
              totalXP: currentStats.totalXP + achievement.points,
              level: Math.floor((currentStats.totalXP + achievement.points) / 1000) + 1,
            },
            updatedAt: Date.now(),
          })
        }

        unlockedAchievements.push({
          achievement,
          pointsAwarded: achievement.points,
        })
      }
    }

    return { unlockedAchievements }
  },
})
