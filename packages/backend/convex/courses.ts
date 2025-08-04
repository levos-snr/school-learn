import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getAllCourses = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    form: v.optional(v.string()),
    search: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("courses")

    // Apply filters
    if (args.published !== undefined) {
      query = ctx.db.query("courses").withIndex("by_published", (q) => q.eq("published", args.published))
    }

    let courses = await query.collect()

    // Apply additional filters
    if (args.category) {
      courses = courses.filter((course) => course.category === args.category)
    }

    if (args.difficulty) {
      courses = courses.filter((course) => course.difficulty === args.difficulty)
    }

    if (args.form) {
      courses = courses.filter((course) => course.form === args.form)
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase()
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Get instructor details for each course
    const coursesWithInstructors = await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructor)
        return {
          ...course,
          instructorName: instructor?.name || "Unknown",
          instructorImage: instructor?.imageUrl,
        }
      }),
    )

    return coursesWithInstructors
  },
})

// Add the missing getCourses function that the frontend expects
export const getCourses = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    form: v.optional(v.string()),
    search: v.optional(v.string()),
    published: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    
    let query = ctx.db.query("courses")

    // Default to published courses only
    const publishedFilter = args.published !== undefined ? args.published : true
    query = ctx.db.query("courses").withIndex("by_published", (q) => q.eq("published", publishedFilter))

    let courses = await query.collect()

    // Apply additional filters
    if (args.category) {
      courses = courses.filter((course) => course.category === args.category)
    }

    if (args.difficulty) {
      courses = courses.filter((course) => course.difficulty === args.difficulty)
    }

    if (args.form) {
      courses = courses.filter((course) => course.form === args.form)
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase()
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Apply limit
    if (args.limit) {
      courses = courses.slice(0, args.limit)
    }

    // Get user's enrollments to check which courses they're enrolled in
    let userEnrollments: any[] = []
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique()
      
      if (user) {
        userEnrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect()
      }
    }

    // Get instructor details and enrollment status for each course
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructor)
        const isEnrolled = userEnrollments.some((e) => e.courseId === course._id)
        
        return {
          ...course,
          instructorName: instructor?.name || "Unknown",
          instructorAvatar: instructor?.imageUrl,
          isEnrolled,
          // Add default values for missing fields expected by frontend
          students: 100, // Default value
          rating: 4.5, // Default value
          totalLessons: course.modules.length,
        }
      }),
    )

    return {
      courses: coursesWithDetails,
      total: coursesWithDetails.length,
    }
  },
})

// Add missing getCourseCategories function
export const getCourseCategories = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect()
    const categories = [...new Set(courses.map(course => course.category))]
    return categories.filter(Boolean).sort()
  },
})

// Add missing getCourseSubjects function
export const getCourseSubjects = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect()
    const subjects = [...new Set(courses.map(course => course.category))] // Using category as subject
    return subjects.filter(Boolean).sort()
  },
})

// Add missing getCourseForms function
export const getCourseForms = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect()
    const forms = [...new Set(courses.map(course => course.form))]
    return forms.filter(Boolean).sort()
  },
})

// Add missing enroll function
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

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      progress: 0,
      completedModules: [],
      enrolledAt: Date.now(),
      lastAccessedAt: Date.now(),
    })

    // Award XP for enrollment
    const currentStats = user.stats
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        totalXP: currentStats.totalXP + 50, // 50 XP for enrollment
        level: Math.floor((currentStats.totalXP + 50) / 1000) + 1,
      },
      updatedAt: Date.now(),
    })

    return { success: true, enrollmentId, xpGained: 50 }
  },
})

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId)
    if (!course) return null

    const instructor = await ctx.db.get(course.instructor)
    return {
      ...course,
      instructorName: instructor?.name || "Unknown",
      instructorImage: instructor?.imageUrl,
    }
  },
})

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    form: v.string(),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    learningOutcomes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      throw new Error("Unauthorized - Instructor or Admin access required")
    }

    const courseId = await ctx.db.insert("courses", {
      ...args,
      instructor: user._id,
      published: false,
      modules: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return courseId
  },
})

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    form: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    learningOutcomes: v.optional(v.array(v.string())),
    published: v.optional(v.boolean()),
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

    // Check if user is the instructor or admin
    if (course.instructor !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized - Only course instructor or admin can update")
    }

    const { courseId, ...updates } = args
    await ctx.db.patch(courseId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
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

    // Check if user is the instructor or admin
    if (course.instructor !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized - Only course instructor or admin can delete")
    }

    await ctx.db.delete(args.courseId)
    return { success: true }
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

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      progress: 0,
      completedModules: [],
      enrolledAt: Date.now(),
      lastAccessedAt: Date.now(),
    })

    // Award XP for enrollment
    const currentStats = user.stats
    await ctx.db.patch(user._id, {
      stats: {
        ...currentStats,
        totalXP: currentStats.totalXP + 50, // 50 XP for enrollment
        level: Math.floor((currentStats.totalXP + 50) / 1000) + 1,
      },
      updatedAt: Date.now(),
    })

    return { success: true, enrollmentId, xpGained: 50 }
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

    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId)
        const instructor = course ? await ctx.db.get(course.instructor) : null
        return {
          ...enrollment,
          course: course
            ? {
                ...course,
                instructorName: instructor?.name || "Unknown",
                // Add missing fields expected by frontend
                students: 100,
                rating: 4.5,
                totalLessons: course.modules.length,
              }
            : null,
        }
      }),
    )

    return enrollmentsWithCourses.filter((e) => e.course !== null)
  },
})

export const updateProgress = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.string(),
    completed: v.boolean(),
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

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    let completedModules = [...enrollment.completedModules]
    let xpGained = 0

    if (args.completed && !completedModules.includes(args.moduleId)) {
      completedModules.push(args.moduleId)
      xpGained = 25 // 25 XP per module completion
    } else if (!args.completed && completedModules.includes(args.moduleId)) {
      completedModules = completedModules.filter((id) => id !== args.moduleId)
    }

    const progress = (completedModules.length / course.modules.length) * 100

    await ctx.db.patch(enrollment._id, {
      completedModules,
      progress,
      lastAccessedAt: Date.now(),
      ...(progress === 100 && { completedAt: Date.now() }),
    })

    // Update user stats if XP was gained
    if (xpGained > 0) {
      const currentStats = user.stats
      const newTotalXP = currentStats.totalXP + xpGained
      await ctx.db.patch(user._id, {
        stats: {
          ...currentStats,
          totalXP: newTotalXP,
          level: Math.floor(newTotalXP / 1000) + 1,
          ...(progress === 100 && { coursesCompleted: currentStats.coursesCompleted + 1 }),
        },
        updatedAt: Date.now(),
      })
    }

    return { success: true, progress, xpGained }
  },
})

export const addNote = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.string(),
    content: v.string(),
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

    const notes = enrollment.notes || []
    notes.push({
      moduleId: args.moduleId,
      content: args.content,
      timestamp: Date.now(),
    })

    await ctx.db.patch(enrollment._id, { notes })
    return { success: true }
  },
})

export const addBookmark = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.string(),
    note: v.optional(v.string()),
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

    const bookmarks = enrollment.bookmarks || []
    bookmarks.push({
      moduleId: args.moduleId,
      timestamp: Date.now(),
      note: args.note,
    })

    await ctx.db.patch(enrollment._id, { bookmarks })
    return { success: true }
  },
})
