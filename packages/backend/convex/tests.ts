import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tests")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
  },
})

export const getUserAttempts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    return await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const startAttempt = mutation({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const test = await ctx.db.get(args.testId)
    if (!test || !test.isPublished) throw new Error("Test not found")

    // Check for existing in-progress attempt
    const existingAttempt = await ctx.db
      .query("testAttempts")
      .withIndex("by_user_test", (q) => q.eq("userId", user._id).eq("testId", args.testId))
      .filter((q) => q.eq(q.field("status"), "in-progress"))
      .unique()

    if (existingAttempt) {
      return { success: true, attemptId: existingAttempt._id }
    }

    // Create new attempt
    const attemptId = await ctx.db.insert("testAttempts", {
      userId: user._id,
      testId: args.testId,
      answers: [],
      score: 0,
      totalPoints: 0,
      percentage: 0,
      timeSpent: 0,
      status: "in-progress",
      startedAt: Date.now(),
    })

    return { success: true, attemptId }
  },
})

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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const test = await ctx.db.get(args.testId)
    if (!test) throw new Error("Test not found")

    const totalScore = args.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0)
    const totalPoints = test.totalPoints || 100
    const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0

    const attemptId = await ctx.db.insert("testAttempts", {
      userId: user._id,
      testId: args.testId,
      answers: args.answers,
      score: totalScore,
      totalPoints,
      percentage,
      timeSpent: args.timeSpent,
      status: "completed",
      startedAt: Date.now() - args.timeSpent * 1000,
      completedAt: Date.now(),
    })

    // Update user stats
    const currentStats = user.stats || {
      xpPoints: 0,
      level: 1,
      studyStreak: 0,
      coursesCompleted: 0,
      assignmentsCompleted: 0,
      testsCompleted: 0,
      totalStudyTime: 0,
      currentStreak: 0,
    }

    const xpGain = Math.round(percentage * 2) + (percentage >= test.passingScore ? 50 : 0)
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
        testsCompleted: currentStats.testsCompleted + 1,
      },
    })

    return {
      success: true,
      attemptId,
      score: totalScore,
      totalPoints,
      percentage,
      passed: percentage >= test.passingScore,
      xpGained: xpGain,
    }
  },
})

export const getAllTests = query({
  args: {
    subject: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    let query = ctx.db.query("tests").filter((q) => q.eq(q.field("isPublished"), true))

    if (args.subject && args.subject !== "all") {
      query = query.filter((q) => q.eq(q.field("subject"), args.subject))
    }

    const tests = await query.collect()
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const testsWithStatus = tests.map((test) => {
      const userAttempts = attempts.filter((a) => a.testId === test._id)
      const completedAttempts = userAttempts.filter((a) => a.status === "completed")
      const bestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.percentage)) : null

      let status = "pending"
      if (completedAttempts.length > 0) {
        status = "completed"
      } else if (userAttempts.some((a) => a.status === "in-progress")) {
        status = "in-progress"
      }

      return {
        ...test,
        attempts: userAttempts.length,
        bestScore,
        status,
      }
    })

    if (args.status && args.status !== "all") {
      return testsWithStatus.filter((t) => t.status === args.status)
    }

    return testsWithStatus
  },
})

export const startTest = mutation({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const test = await ctx.db.get(args.testId)
    if (!test || !test.isPublished) throw new Error("Test not found")

    // Check for existing in-progress attempt
    const existingAttempt = await ctx.db
      .query("testAttempts")
      .withIndex("by_user_test", (q) => q.eq("userId", user._id).eq("testId", args.testId))
      .filter((q) => q.eq(q.field("status"), "in-progress"))
      .unique()

    if (existingAttempt) {
      return { success: true, attemptId: existingAttempt._id }
    }

    // Create new attempt
    const attemptId = await ctx.db.insert("testAttempts", {
      userId: user._id,
      testId: args.testId,
      answers: [],
      score: 0,
      totalPoints: 0,
      percentage: 0,
      timeSpent: 0,
      status: "in-progress",
      startedAt: Date.now(),
    })

    return { success: true, attemptId }
  },
})

export const submitTest = mutation({
  args: {
    testId: v.id("tests"),
    attemptId: v.id("testAttempts"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const test = await ctx.db.get(args.testId)
    const attempt = await ctx.db.get(args.attemptId)

    if (!test || !attempt) throw new Error("Test or attempt not found")
    if (attempt.userId !== user._id) throw new Error("Unauthorized")
    if (attempt.status !== "in-progress") throw new Error("Test already submitted")

    // Grade the test
    let totalScore = 0
    let totalPoints = 0
    const gradedAnswers = args.answers.map((userAnswer) => {
      const question = test.questions.find((q) => q.id === userAnswer.questionId)
      if (!question) return { ...userAnswer, isCorrect: false, pointsEarned: 0 }

      const isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.answer.toLowerCase().trim()
      const pointsEarned = isCorrect ? question.points : 0

      totalScore += pointsEarned
      totalPoints += question.points

      return {
        ...userAnswer,
        isCorrect,
        pointsEarned,
      }
    })

    const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0
    const timeSpent = Math.round((Date.now() - attempt.startedAt) / (1000 * 60)) // minutes

    // Update attempt
    await ctx.db.patch(args.attemptId, {
      answers: gradedAnswers,
      score: totalScore,
      totalPoints,
      percentage,
      timeSpent,
      status: "completed",
      completedAt: Date.now(),
    })

    // Update user stats
    const currentStats = user.stats || {
      xpPoints: 0,
      level: 1,
      studyStreak: 0,
      coursesCompleted: 0,
      assignmentsCompleted: 0,
      testsCompleted: 0,
      totalStudyTime: 0,
      currentStreak: 0,
    }
    const xpGain = Math.round(percentage * 2) + (percentage >= test.passingScore ? 50 : 0)

    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
        testsCompleted: currentStats.testsCompleted + 1,
      },
    })

    return {
      success: true,
      score: totalScore,
      totalPoints,
      percentage,
      passed: percentage >= test.passingScore,
      xpGained: xpGain,
    }
  },
})

