import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get lessons for a course with user progress
export const getLessonsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect()

    const identity = await ctx.auth.getUserIdentity()

    // If no user is authenticated, return lessons without progress
    if (!identity) {
      return lessons
        .map((lesson) => ({
          ...lesson,
          userProgress: null,
          isCompleted: false,
          watchTime: 0,
        }))
        .sort((a, b) => a.order - b.order)
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    // If user not found, return lessons without progress
    if (!user) {
      return lessons
        .map((lesson) => ({
          ...lesson,
          userProgress: null,
          isCompleted: false,
          watchTime: 0,
        }))
        .sort((a, b) => a.order - b.order)
    }

    // Get user's progress for all lessons in this course
    const progressRecords = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .collect()

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]))

    // Add progress data to each lesson
    const lessonsWithProgress = lessons.map((lesson) => {
      const progress = progressMap.get(lesson._id)
      return {
        ...lesson,
        userProgress: progress || null,
        isCompleted: progress?.isCompleted || false,
        watchTime: progress?.watchTime || 0,
      }
    })

    return lessonsWithProgress.sort((a, b) => a.order - b.order)
  },
})

// Get lesson by ID with user progress
export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) return null

    const identity = await ctx.auth.getUserIdentity()

    // Always return lesson with progress structure, even if no user
    if (!identity) {
      return {
        ...lesson,
        userProgress: null,
        isCompleted: false,
        watchTime: 0,
      }
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) {
      return {
        ...lesson,
        userProgress: null,
        isCompleted: false,
        watchTime: 0,
      }
    }

    // Get user's progress for this lesson
    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id).eq("lessonId", args.lessonId))
      .unique()

    return {
      ...lesson,
      userProgress: progress || null,
      isCompleted: progress?.isCompleted || false,
      watchTime: progress?.watchTime || 0,
    }
  },
})

// Create lesson
export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    duration: v.number(),
    order: v.number(),
    isPreview: v.boolean(),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video"), v.literal("document")),
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

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    // Check if user is instructor or admin
    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to create lessons for this course")
    }

    const lessonId = await ctx.db.insert("lessons", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update course total lessons and duration
    await ctx.db.patch(args.courseId, {
      totalLessons: course.totalLessons + 1,
      totalDuration: course.totalDuration + args.duration,
      updatedAt: Date.now(),
    })

    return lessonId
  },
})

// Update lesson progress
export const updateLessonProgress = mutation({
  args: {
    lessonId: v.id("lessons"),
    watchTime: v.number(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) throw new Error("Lesson not found")

    // Check if progress record exists
    const existingProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id).eq("lessonId", args.lessonId))
      .unique()

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        watchTime: args.watchTime,
        isCompleted: args.isCompleted,
        completedAt: args.isCompleted ? args.completedAt || Date.now() : undefined,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("lessonProgress", {
        userId: user._id,
        lessonId: args.lessonId,
        courseId: lesson.courseId,
        watchTime: args.watchTime,
        isCompleted: args.isCompleted,
        completedAt: args.isCompleted ? args.completedAt || Date.now() : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Award XP for completing lesson
    if (args.isCompleted && !existingProgress?.isCompleted) {
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

      await ctx.db.patch(user._id, {
        stats: {
          ...currentStats,
          xpPoints: currentStats.xpPoints + 25,
          totalStudyTime: currentStats.totalStudyTime + args.watchTime,
          level: Math.floor((currentStats.xpPoints + 25) / 1000) + 1,
        },
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

// Get user's lesson progress for a course
export const getUserCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .collect()

    return progress
  },
})

// Update lesson
export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video"), v.literal("document")),
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

    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) throw new Error("Lesson not found")

    const course = await ctx.db.get(lesson.courseId)
    if (!course) throw new Error("Course not found")

    // Check authorization
    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this lesson")
    }

    const { lessonId, ...updateData } = args
    await ctx.db.patch(args.lessonId, {
      ...updateData,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Delete lesson
export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) throw new Error("Lesson not found")

    const course = await ctx.db.get(lesson.courseId)
    if (!course) throw new Error("Course not found")

    // Check authorization
    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this lesson")
    }

    await ctx.db.delete(args.lessonId)

    // Update course totals
    await ctx.db.patch(lesson.courseId, {
      totalLessons: Math.max(0, course.totalLessons - 1),
      totalDuration: Math.max(0, course.totalDuration - lesson.duration),
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Get next lesson in sequence
export const getNextLesson = query({
  args: {
    courseId: v.id("courses"),
    currentOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const nextLesson = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.gt(q.field("order"), args.currentOrder))
      .order("asc")
      .first()

    return nextLesson
  },
})

// Get previous lesson in sequence
export const getPreviousLesson = query({
  args: {
    courseId: v.id("courses"),
    currentOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.lt(q.field("order"), args.currentOrder))
      .order("desc")
      .collect()

    return lessons[0] || null
  },
})

export const getLessonsSequential = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect()

    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return lessons
        .map((lesson, index) => ({
          ...lesson,
          userProgress: null,
          isCompleted: false,
          watchTime: 0,
          canAccess: index === 0, // Only first lesson accessible without auth
          isLocked: index > 0,
        }))
        .sort((a, b) => a.order - b.order)
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) {
      return lessons
        .map((lesson, index) => ({
          ...lesson,
          userProgress: null,
          isCompleted: false,
          watchTime: 0,
          canAccess: index === 0,
          isLocked: index > 0,
        }))
        .sort((a, b) => a.order - b.order)
    }

    // Get user's progress for all lessons in this course
    const progressRecords = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .collect()

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]))

    const sortedLessons = lessons.sort((a, b) => a.order - b.order)

    // Determine access for each lesson based on sequential completion
    const lessonsWithAccess = sortedLessons.map((lesson, index) => {
      const progress = progressMap.get(lesson._id)
      const isCompleted = progress?.isCompleted || false

      // First lesson is always accessible
      let canAccess = index === 0

      // Subsequent lessons require previous lesson completion
      if (index > 0) {
        const previousLesson = sortedLessons[index - 1]
        const previousProgress = progressMap.get(previousLesson._id)
        canAccess = previousProgress?.isCompleted || false
      }

      return {
        ...lesson,
        userProgress: progress || null,
        isCompleted,
        watchTime: progress?.watchTime || 0,
        canAccess,
        isLocked: !canAccess,
      }
    })

    return lessonsWithAccess
  },
})

export const canAccessLesson = query({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return false

    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) return false

    // Get all lessons in course ordered by sequence
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect()

    const sortedLessons = allLessons.sort((a, b) => a.order - b.order)
    const currentLessonIndex = sortedLessons.findIndex((l) => l._id === args.lessonId)

    if (currentLessonIndex === -1) return false
    if (currentLessonIndex === 0) return true // First lesson always accessible

    // Check if previous lesson is completed
    const previousLesson = sortedLessons[currentLessonIndex - 1]
    const previousProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id).eq("lessonId", previousLesson._id))
      .unique()

    return previousProgress?.isCompleted || false
  },
})

export const markLessonCompleted = mutation({
  args: {
    lessonId: v.id("lessons"),
    watchTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not found")

    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) throw new Error("Lesson not found")

    // Instead of fetching all lessons and sorting in JS,
    // query just the previous lesson directly via order
    if (lesson.order > 1) {
      const previousLesson = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) =>
          q.eq("courseId", lesson.courseId).lt("order", lesson.order)
        )
        .order("desc") // get the closest one before current
        .first()

      if (previousLesson) {
        const previousProgress = await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_lesson", (q) =>
            q.eq("userId", user._id).eq("lessonId", previousLesson._id)
          )
          .unique()

        if (!previousProgress?.isCompleted) {
          throw new Error("Cannot complete lesson - previous lessons must be completed first")
        }
      }
    }

    // Upsert progress for this lesson
    const existingProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .unique()

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        watchTime: args.watchTime || existingProgress.watchTime,
        isCompleted: true,
        completedAt: Date.now(),
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("lessonProgress", {
        userId: user._id,
        lessonId: args.lessonId,
        courseId: lesson.courseId,
        watchTime: args.watchTime || 0,
        isCompleted: true,
        completedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Award XP only if lesson was not already marked completed
    if (!existingProgress?.isCompleted) {
      const stats = user.stats || {
        xpPoints: 0,
        level: 1,
        studyStreak: 0,
        coursesCompleted: 0,
        assignmentsCompleted: 0,
        testsCompleted: 0,
        totalStudyTime: 0,
        currentStreak: 0,
      }

      const newXp = stats.xpPoints + 25
      await ctx.db.patch(user._id, {
        stats: {
          ...stats,
          xpPoints: newXp,
          totalStudyTime: stats.totalStudyTime + (args.watchTime || 0),
          level: Math.floor(newXp / 1000) + 1,
        },
        updatedAt: Date.now(),
      })
    }

    return { success: true, nextLessonUnlocked: true }
  },
})


export const reorderLessons = mutation({
  args: {
    updates: v.array(
      v.object({
        lessonId: v.id("lessons"),
        order: v.number(),
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

    // Verify user has permission to reorder lessons
    if (args.updates.length > 0) {
      const firstLesson = await ctx.db.get(args.updates[0].lessonId)
      if (!firstLesson) throw new Error("Lesson not found")

      const course = await ctx.db.get(firstLesson.courseId)
      if (!course) throw new Error("Course not found")

      if (course.instructorId !== user._id && user.role !== "admin") {
        throw new Error("Not authorized to reorder lessons for this course")
      }
    }

    // Update all lesson orders
    for (const update of args.updates) {
      await ctx.db.patch(update.lessonId, {
        order: update.order,
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

