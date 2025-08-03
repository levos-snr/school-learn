import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
  },
})

export const getUserEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId)
        return {
          ...enrollment,
          course,
        }
      }),
    )

    return enrollmentsWithCourses.filter((e) => e.course !== null)
  },
})

export const enroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique()

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course")
    }

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    // Create enrollment
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      progress: 0,
      completedLessons: 0,
      lastAccessedAt: Date.now(),
      enrolledAt: Date.now(),
    })

    // Update course student count
    await ctx.db.patch(args.courseId, {
      students: course.students + 1,
      updatedAt: Date.now(),
    })

    // Award XP for enrollment
    const currentStats = user.stats || {
      xpPoints: 0,
      level: 1,
      studyStreak: 0,
      coursesCompleted: 0,
      assignmentsCompleted: 0,
      testsCompleted: 0,
      totalStudyTime: 0,
    }
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + 100,
      },
      updatedAt: Date.now(),
    })

    return { success: true, enrollmentId }
  },
})

export const updateProgress = mutation({
  args: {
    courseId: v.id("courses"),
    progress: v.number(),
    completedLessons: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique()

    if (!enrollment) throw new Error("Not enrolled in this course")

    await ctx.db.patch(enrollment._id, {
      progress: args.progress,
      completedLessons: args.completedLessons,
      lastAccessedAt: Date.now(),
    })

    // Award XP for progress
    const currentStats = user.stats || {
      xpPoints: 0,
      level: 1,
      studyStreak: 0,
      coursesCompleted: 0,
      assignmentsCompleted: 0,
      testsCompleted: 0,
      totalStudyTime: 0,
    }
    let xpGain = 25
    let updatedStats = { ...currentStats }

    // Bonus XP for course completion
    if (args.progress >= 100) {
      xpGain += 200
      updatedStats = {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
        coursesCompleted: currentStats.coursesCompleted + 1,
      }
    } else {
      updatedStats = {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGain,
      }
    }

    await ctx.db.patch(user._id, {
      stats: updatedStats,
      updatedAt: Date.now(),
    })

    return { success: true, newProgress: args.progress, xpGained: xpGain }
  },
})

export const getAllCourses = query({
  args: {
    category: v.optional(v.string()),
    subject: v.optional(v.string()),
    form: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("courses").filter((q) => q.eq(q.field("isPublished"), true))

    if (args.category && args.category !== "all") {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }

    if (args.subject && args.subject !== "all") {
      query = query.filter((q) => q.eq(q.field("subject"), args.subject))
    }

    if (args.form && args.form !== "all") {
      query = query.filter((q) => q.eq(q.field("form"), args.form))
    }

    const courses = await query.collect()

    if (args.search) {
      return courses.filter(
        (course) =>
          course.title.toLowerCase().includes(args.search!.toLowerCase()) ||
          course.description.toLowerCase().includes(args.search!.toLowerCase()) ||
          course.instructor.toLowerCase().includes(args.search!.toLowerCase()),
      )
    }

    return courses
  },
})

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId)
    if (!course || !course.isPublished) return null

    return course
  },
})

export const enrollInCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique()

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course")
    }

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    // Create enrollment
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      progress: 0,
      completedLessons: 0,
      lastAccessedAt: Date.now(),
      enrolledAt: Date.now(),
    })

    // Update course student count
    await ctx.db.patch(args.courseId, {
      students: course.students + 1,
      updatedAt: Date.now(),
    })

    // Award XP for enrollment
    const currentStats = user.stats || {
      xpPoints: 0,
      level: 1,
      studyStreak: 0,
      coursesCompleted: 0,
      assignmentsCompleted: 0,
      testsCompleted: 0,
      totalStudyTime: 0,
    }
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        xpPoints: currentStats.xpPoints + 50,
      },
      updatedAt: Date.now(),
    })

    return { success: true, enrollmentId }
  },
})

// Additional helper functions
export const getCourseCategories = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
    
    const categories = [...new Set(courses.map(course => course.category))].sort()
    return categories
  },
})

export const getCourseSubjects = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
    
    const subjects = [...new Set(courses.map(course => course.subject))].sort()
    return subjects
  },
})

export const getCourseForms = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect()
    
    const forms = [...new Set(courses.map(course => course.form))].sort()
    return forms
  },
})
