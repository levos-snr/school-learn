import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
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
      .query("assignments")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
  },
})

export const getUserSubmissions = query({
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
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const submit = mutation({
  args: {
    assignmentId: v.id("assignments"),
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

    const assignment = await ctx.db.get(args.assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    const totalScore = args.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0)
    const totalPoints = assignment.totalPoints || 100

    const submissionId = await ctx.db.insert("assignmentSubmissions", {
      userId: user._id,
      assignmentId: args.assignmentId,
      answers: args.answers,
      score: totalScore,
      totalPoints,
      status: "completed",
      timeSpent: args.timeSpent,
      submittedAt: Date.now(),
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

    const xpGain = Math.round((totalScore / totalPoints) * 100)
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
        assignmentsCompleted: currentStats.assignmentsCompleted + 1,
      },
    })

    return {
      success: true,
      submissionId,
      score: totalScore,
      totalPoints,
      xpGained: xpGain,
    }
  },
})

export const getAllAssignments = query({
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

    let query = ctx.db.query("assignments").filter((q) => q.eq(q.field("isPublished"), true))

    if (args.subject && args.subject !== "all") {
      query = query.filter((q) => q.eq(q.field("subject"), args.subject))
    }

    const assignments = await query.collect()
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissions.find((s) => s.assignmentId === assignment._id)
      const now = Date.now()
      const isOverdue = assignment.dueDate < now && !submission

      let status = "pending"
      if (submission) {
        status = submission.status
      } else if (isOverdue) {
        status = "overdue"
      }

      return {
        ...assignment,
        submission,
        status,
        isOverdue,
      }
    })

    if (args.status && args.status !== "all") {
      return assignmentsWithStatus.filter((a) => a.status === args.status)
    }

    return assignmentsWithStatus
  },
})

export const submitAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
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

    const assignment = await ctx.db.get(args.assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    // Check if already submitted
    const existingSubmission = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user_assignment", (q) => q.eq("userId", user._id).eq("assignmentId", args.assignmentId))
      .unique()

    if (existingSubmission) {
      throw new Error("Assignment already submitted")
    }

    // Grade the assignment
    let totalScore = 0
    let totalPoints = 0
    const gradedAnswers = args.answers.map((userAnswer) => {
      const question = assignment.questions.find((q) => q.id === userAnswer.questionId)
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

    const now = Date.now()
    const isLate = now > assignment.dueDate
    const status = isLate ? "late" : "completed"

    // Create submission
    const submissionId = await ctx.db.insert("assignmentSubmissions", {
      userId: user._id,
      assignmentId: args.assignmentId,
      answers: gradedAnswers,
      score: totalScore,
      totalPoints,
      status,
      timeSpent: 0, // Could be tracked from frontend
      submittedAt: now,
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
    const xpGain = Math.round((totalScore / totalPoints) * 100) + (isLate ? 0 : 25)

    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
        assignmentsCompleted: currentStats.assignmentsCompleted + 1,
      },
    })

    return {
      success: true,
      submissionId,
      score: totalScore,
      totalPoints,
      percentage: Math.round((totalScore / totalPoints) * 100),
      xpGained: xpGain,
      isLate,
    }
  },
})

