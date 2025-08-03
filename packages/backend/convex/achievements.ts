import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get user's achievements
export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return []

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const achievementsWithDetails = await Promise.all(
      userAchievements.map(async (userAchievement) => {
        const achievement = await ctx.db.get(userAchievement.achievementId)
        return {
          ...userAchievement,
          achievement,
        }
      }),
    )

    return achievementsWithDetails.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? -1 : 1
      }
      return (b.completedAt || 0) - (a.completedAt || 0)
    })
  },
})

// Get all available achievements
export const getAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    const achievements = await ctx.db
      .query("achievementDefinitions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return achievements.map((a) => ({ ...a, userProgress: null }))

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return achievements.map((a) => ({ ...a, userProgress: null }))

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    return achievements.map((achievement) => {
      const userProgress = userAchievements.find((ua) => ua.achievementId === achievement._id)
      return {
        ...achievement,
        userProgress,
      }
    })
  },
})

// Initialize default achievements for new users
export const initializeUserAchievements = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievementDefinitions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    for (const achievement of achievements) {
      const existingUserAchievement = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("achievementId"), achievement._id))
        .unique()

      if (!existingUserAchievement) {
        await ctx.db.insert("userAchievements", {
          userId: args.userId,
          achievementId: achievement._id,
          progress: 0,
          maxProgress: achievement.requirements.value,
          isCompleted: false,
          notified: false,
        })
      }
    }
  },
})

// Update achievement progress
export const updateAchievementProgress = mutation({
  args: {
    type: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return

    // Find relevant achievements
    const achievements = await ctx.db
      .query("achievementDefinitions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("requirements.type"), args.type))
      .collect()

    for (const achievement of achievements) {
      const userAchievement = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("achievementId"), achievement._id))
        .unique()

      if (!userAchievement || userAchievement.isCompleted) continue

      const newProgress = Math.min(userAchievement.progress + args.value, achievement.requirements.value)
      const isCompleted = newProgress >= achievement.requirements.value

      await ctx.db.patch(userAchievement._id, {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? Date.now() : undefined,
      })

      if (isCompleted && !userAchievement.notified) {
        // Award XP points
        if (user.stats) {
          await ctx.db.patch(user._id, {
            stats: {
              ...user.stats,
              xpPoints: user.stats.xpPoints + achievement.points,
            },
          })
        }

        // Create notification
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "achievement_earned",
          title: "Achievement Unlocked!",
          message: `You've earned the "${achievement.name}" achievement!`,
          data: { achievementId: achievement._id },
          isRead: false,
          priority: "high",
          createdAt: Date.now(),
        })

        await ctx.db.patch(userAchievement._id, { notified: true })
      }
    }
  },
})

