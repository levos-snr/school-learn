import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get user's events
export const getUserEvents = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("assignment_due"),
        v.literal("test_due"),
        v.literal("class_session"),
        v.literal("study_group"),
        v.literal("deadline"),
        v.literal("personal"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return []

    let query = ctx.db.query("events").withIndex("by_creator", (q) => q.eq("createdBy", user._id))

    if (args.startDate && args.endDate) {
      query = ctx.db
        .query("events")
        .withIndex("by_date")
        .filter((q) => q.and(q.gte(q.field("startDate"), args.startDate!), q.lte(q.field("startDate"), args.endDate!)))
        .filter((q) => q.or(q.eq(q.field("createdBy"), user._id), q.eq(q.field("participants"), user._id)))
    }

    let events = await query.collect()

    if (args.type) {
      events = events.filter((event) => event.type === args.type)
    }

    // Get related data for each event
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        let relatedData = {}

        if (event.courseId) {
          const course = await ctx.db.get(event.courseId)
          relatedData = { ...relatedData, course }
        }

        if (event.assignmentId) {
          const assignment = await ctx.db.get(event.assignmentId)
          relatedData = { ...relatedData, assignment }
        }

        if (event.testId) {
          const test = await ctx.db.get(event.testId)
          relatedData = { ...relatedData, test }
        }

        if (event.groupId) {
          const group = await ctx.db.get(event.groupId)
          relatedData = { ...relatedData, group }
        }

        return {
          ...event,
          ...relatedData,
        }
      }),
    )

    return eventsWithDetails.sort((a, b) => a.startDate - b.startDate)
  },
})

// Create personal event
export const createPersonalEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isAllDay: v.boolean(),
    location: v.optional(v.string()),
    reminder: v.optional(
      v.object({
        enabled: v.boolean(),
        minutes: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) throw new Error("User not found")

    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      type: "personal",
      startDate: args.startDate,
      endDate: args.endDate,
      isAllDay: args.isAllDay,
      location: args.location,
      createdBy: user._id,
      participants: [user._id],
      reminder: args.reminder,
      status: "scheduled",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { success: true, eventId }
  },
})

// Get upcoming deadlines
export const getUpcomingDeadlines = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return []

    const now = Date.now()
    const daysAhead = args.days || 7
    const endDate = now + daysAhead * 24 * 60 * 60 * 1000

    // Get user's enrolled courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const courseIds = enrollments.map((e) => e.courseId)

    // Get assignments due soon
    const assignments = []
    for (const courseId of courseIds) {
      const courseAssignments = await ctx.db
        .query("assignments")
        .withIndex("by_course", (q) => q.eq("courseId", courseId))
        .filter((q) =>
          q.and(q.gte(q.field("dueDate"), now), q.lte(q.field("dueDate"), endDate), q.eq(q.field("isPublished"), true)),
        )
        .collect()
      assignments.push(...courseAssignments)
    }

    // Get tests due soon
    const tests = []
    for (const courseId of courseIds) {
      const courseTests = await ctx.db
        .query("tests")
        .withIndex("by_course", (q) => q.eq("courseId", courseId))
        .filter((q) =>
          q.and(q.gte(q.field("dueDate"), now), q.lte(q.field("dueDate"), endDate), q.eq(q.field("isPublished"), true)),
        )
        .collect()
      tests.push(...courseTests)
    }

    // Combine and format deadlines
    const deadlines = [
      ...assignments.map((a) => ({
        id: a._id,
        title: a.title,
        type: "assignment" as const,
        dueDate: a.dueDate,
        courseId: a.courseId,
      })),
      ...tests.map((t) => ({
        id: t._id,
        title: t.title,
        type: "test" as const,
        dueDate: t.dueDate,
        courseId: t.courseId,
      })),
    ]

    // Get course details
    const deadlinesWithCourses = await Promise.all(
      deadlines.map(async (deadline) => {
        const course = await ctx.db.get(deadline.courseId)
        return {
          ...deadline,
          course,
        }
      }),
    )

    return deadlinesWithCourses.sort((a, b) => a.dueDate - b.dueDate)
  },
})

// Auto-create events for assignments and tests
export const createDeadlineEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) return

    // Get user's enrolled courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const courseIds = enrollments.map((e) => e.courseId)

    // Create events for assignments
    for (const courseId of courseIds) {
      const assignments = await ctx.db
        .query("assignments")
        .withIndex("by_course", (q) => q.eq("courseId", courseId))
        .filter((q) => q.eq(q.field("isPublished"), true))
        .collect()

      for (const assignment of assignments) {
        const existingEvent = await ctx.db
          .query("events")
          .filter((q) => q.and(q.eq(q.field("assignmentId"), assignment._id), q.eq(q.field("createdBy"), user._id)))
          .unique()

        if (!existingEvent) {
          await ctx.db.insert("events", {
            title: `Assignment Due: ${assignment.title}`,
            description: assignment.description,
            type: "assignment_due",
            startDate: assignment.dueDate,
            isAllDay: false,
            createdBy: user._id,
            participants: [user._id],
            courseId,
            assignmentId: assignment._id,
            reminder: {
              enabled: true,
              minutes: 24 * 60, // 1 day before
            },
            status: "scheduled",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
      }

      // Create events for tests
      const tests = await ctx.db
        .query("tests")
        .withIndex("by_course", (q) => q.eq("courseId", courseId))
        .filter((q) => q.eq(q.field("isPublished"), true))
        .collect()

      for (const test of tests) {
        const existingEvent = await ctx.db
          .query("events")
          .filter((q) => q.and(q.eq(q.field("testId"), test._id), q.eq(q.field("createdBy"), user._id)))
          .unique()

        if (!existingEvent) {
          await ctx.db.insert("events", {
            title: `Test: ${test.title}`,
            description: test.description,
            type: "test_due",
            startDate: test.dueDate,
            isAllDay: false,
            createdBy: user._id,
            participants: [user._id],
            courseId,
            testId: test._id,
            reminder: {
              enabled: true,
              minutes: 24 * 60, // 1 day before
            },
            status: "scheduled",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
      }
    }
  },
})

