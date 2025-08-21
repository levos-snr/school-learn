import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all assignments for the current user
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

    // Get user's enrollments to find their courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const courseIds = enrollments.map((e) => e.courseId)

    // Get assignments for user's courses
    const allAssignments = await Promise.all(
      courseIds.map(async (courseId) => {
        return await ctx.db
          .query("assignments")
          .withIndex("by_course", (q) => q.eq("courseId", courseId))
          .collect()
      }),
    )

    const assignments = allAssignments.flat()

    // Get user's submissions to check completion status
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]))

    // Format assignments with status and course info
    const formattedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId)
        const submission = submissionMap.get(assignment._id)

        const now = Date.now()
        const dueDate = assignment.dueDate || now + 7 * 24 * 60 * 60 * 1000
        const isOverdue = dueDate < now && !submission

        return {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          instructions: assignment.instructions,
          dueDate: assignment.dueDate,
          maxPoints: assignment.maxPoints,
          type: assignment.type,
          courseTitle: course?.title || "Unknown Course",
          status: submission ? "completed" : isOverdue ? "overdue" : "pending",
          grade: submission?.grade || null,
          feedback: submission?.feedback || null,
          submittedAt: submission?.submittedAt || null,
        }
      }),
    )

    return formattedAssignments.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate
      }
      return 0
    })
  },
})

// Get assignments for a course
export const getCourseAssignments = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect()

    return assignments
  },
})

export const getAssignmentsByCourse = getCourseAssignments

// Get assignment by ID
export const getAssignmentById = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId)
    if (!assignment) return null

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return assignment

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return assignment

    // Get user's submission if exists
    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_assignment_user", (q) => q.eq("assignmentId", args.assignmentId).eq("userId", user._id))
      .unique()

    return {
      ...assignment,
      userSubmission: submission,
    }
  },
})

// Create assignment
export const createAssignment = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    instructions: v.string(),
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    dueDate: v.optional(v.number()),
    maxPoints: v.number(),
    type: v.union(v.literal("essay"), v.literal("multiple_choice"), v.literal("coding"), v.literal("project")),
    questions: v.optional(
      v.array(
        v.object({
          question: v.string(),
          type: v.union(v.literal("text"), v.literal("multiple_choice"), v.literal("code")),
          options: v.optional(v.array(v.string())),
          correctAnswer: v.optional(v.string()),
          points: v.number(),
        }),
      ),
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
    if (user.role !== "instructor" && user.role !== "admin") {
      throw new Error("Only instructors can create assignments")
    }

    const assignmentId = await ctx.db.insert("assignments", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { success: true, assignmentId }
  },
})

// Submit assignment
export const submitAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
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

    // Check if already submitted
    const existingSubmission = await ctx.db
      .query("submissions")
      .withIndex("by_assignment_user", (q) => q.eq("assignmentId", args.assignmentId).eq("userId", user._id))
      .unique()

    if (existingSubmission) {
      throw new Error("Assignment already submitted")
    }

    const submissionId = await ctx.db.insert("submissions", {
      assignmentId: args.assignmentId,
      userId: user._id,
      answers: args.answers,
      submittedAt: Date.now(),
    })

    return { success: true, submissionId }
  },
})

// Get user's assignment submissions
export const getUserSubmissions = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const submissionsWithAssignments = await Promise.all(
      submissions.map(async (submission) => {
        const assignment = await ctx.db.get(submission.assignmentId)
        return {
          ...submission,
          assignmentTitle: assignment?.title || "Unknown",
          assignmentDueDate: assignment?.dueDate,
          maxPoints: assignment?.maxPoints || 0,
        }
      }),
    )

    // Filter by course if provided
    if (args.courseId) {
      const courseSubmissions = []
      for (const submission of submissionsWithAssignments) {
        const assignment = await ctx.db.get(submission.assignmentId)
        if (assignment && assignment.courseId === args.courseId) {
          courseSubmissions.push(submission)
        }
      }
      return courseSubmissions
    }

    return submissionsWithAssignments
  },
})
