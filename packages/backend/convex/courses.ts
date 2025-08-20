import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Course queries
export const getAllCourses = query({
  args: {
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Use the correct field name "isPublished" from schema
    const coursesQuery = ctx.db.query("courses").withIndex("by_published", (q) => q.eq("isPublished", true))

    let courses = await coursesQuery.collect()

    // Filter by category if provided
    if (args.category) {
      courses = courses.filter((course) => course.category === args.category)
    }

    // Filter by level if provided
    if (args.level) {
      courses = courses.filter((course) => course.level === args.level) // Use "level" not "difficulty"
    }

    // Filter by search term if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) || course.description.toLowerCase().includes(searchLower),
      )
    }

    if (args.limit) {
      courses = courses.slice(0, args.limit)
    }

    // Get instructor details for each course
    const coursesWithInstructors = await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId) // Use "instructorId" from schema
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

export const getCourses = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let courses = await ctx.db.query("courses").collect()

    // Filter by category if provided
    if (args.category && args.category !== "all") {
      courses = courses.filter((course) => course.category === args.category)
    }

    // Filter by level if provided
    if (args.level && args.level !== "all") {
      courses = courses.filter((course) => course.level === args.level)
    }

    // Filter by status if provided
    if (args.status && args.status !== "all") {
      if (args.status === "published") {
        courses = courses.filter((course) => course.isPublished === true)
      } else if (args.status === "draft") {
        courses = courses.filter((course) => course.isPublished === false)
      }
    }

    // Filter by search term if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          (course.shortname && course.shortname.toLowerCase().includes(searchLower)),
      )
    }

    // Get instructor details and enrollment counts for each course
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId)
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect()

        return {
          ...course,
          instructorName: instructor?.name || "Unknown",
          instructorAvatar: instructor?.imageUrl,
          students: enrollments.length,
          isPublished: course.isPublished,
          published: course.isPublished, // Add this for backward compatibility
          rating: 4.5, // Mock rating - you'd calculate this from actual reviews
        }
      }),
    )

    const limitedCourses = args.limit ? coursesWithDetails.slice(0, args.limit) : coursesWithDetails

    return { courses: limitedCourses }
  },
})

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId)
    if (!course) return null

    const instructor = await ctx.db.get(course.instructorId)

    return {
      ...course,
      instructorName: instructor?.name || "Unknown",
      instructorImage: instructor?.imageUrl,
      instructorBio: instructor?.profile?.bio,
    }
  },
})

export const getEnrolledCourses = query({
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

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId)
        const instructor = course ? await ctx.db.get(course.instructorId) : null

        return {
          ...course,
          instructorName: instructor?.name || "Unknown",
          progress: enrollment.progress,
          lastAccessedAt: enrollment.lastAccessedAt,
          enrolledAt: enrollment.enrolledAt,
        }
      }),
    )

    return coursesWithProgress.filter((course) => course.title) // Filter out null courses
  },
})

export const isEnrolled = query({
  args: {
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

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique()

    return !!enrollment
  },
})

export const checkEnrollment = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", args.userId).eq("courseId", args.courseId))
      .unique()

    return !!enrollment
  },
})

export const getCourseStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect()

    const totalEnrollments = enrollments.length
    const completedCount = enrollments.filter((e) => e.progress === 100).length
    const averageProgress =
      enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length : 0

    return {
      totalEnrollments,
      completedCount,
      averageProgress: Math.round(averageProgress),
      activeStudents: enrollments.filter(
        (e) => Date.now() - e.lastAccessedAt < 7 * 24 * 60 * 60 * 1000, // Active in last 7 days
      ).length,
    }
  },
})

export const getCoursesByInstructor = query({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .collect()

    return courses
  },
})

// Course mutations
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    duration: v.string(),
    price: v.number(),
    maxStudents: v.optional(v.number()),
    prerequisites: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    allowDiscussions: v.optional(v.boolean()),
    certificateEnabled: v.optional(v.boolean()),
    enrollmentDeadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    whatYouWillLearn: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
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
      throw new Error("Only instructors and admins can create courses")
    }

    const courseId = await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      thumbnail: args.thumbnail,
      instructorId: user._id,
      category: args.category,
      level: args.level,
      duration: args.duration,
      price: args.price,
      maxStudents: args.maxStudents || 0,
      prerequisites: args.prerequisites || "",
      learningObjectives: args.learningObjectives || [],
      tags: args.tags || [],
      isPublished: args.isPublished || false,
      allowDiscussions: args.allowDiscussions !== false,
      certificateEnabled: args.certificateEnabled !== false,
      enrollmentDeadline: args.enrollmentDeadline,
      totalLessons: 0,
      totalDuration: 0,
      requirements: args.requirements || [],
      whatYouWillLearn: args.whatYouWillLearn || [],
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
    level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    thumbnail: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    whatYouWillLearn: v.optional(v.array(v.string())),
    maxStudents: v.optional(v.number()),
    prerequisites: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    allowDiscussions: v.optional(v.boolean()),
    certificateEnabled: v.optional(v.boolean()),
    enrollmentDeadline: v.optional(v.number()),
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
    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this course")
    }

    const { courseId, ...updateData } = args
    await ctx.db.patch(args.courseId, {
      ...updateData,
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
    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this course")
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
      // Return success instead of throwing error - user is already enrolled
      return { success: true, message: "Already enrolled in this course", enrollmentId: existingEnrollment._id }
    }

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      enrolledAt: Date.now(),
      progress: 0,
      completedLessons: [],
      lastAccessedAt: Date.now(),
      certificateIssued: false,
    })

    return { success: true, enrollmentId }
  },
})

export const updateProgress = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
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

    // Add lesson to completed if not already completed
    const completedLessons = enrollment.completedLessons.includes(args.lessonId)
      ? enrollment.completedLessons
      : [...enrollment.completedLessons, args.lessonId]

    // Calculate progress percentage
    const totalLessons = course.totalLessons
    const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0

    await ctx.db.patch(enrollment._id, {
      completedLessons,
      progress,
      lastAccessedAt: Date.now(),
    })

    return { success: true, progress }
  },
})

// Lesson queries and mutations
export const getLessonsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .collect()
  },
})

export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId)
  },
})

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    videoUrl: v.optional(v.string()),
    duration: v.number(),
    order: v.number(),
    isPreview: v.boolean(),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video")),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("lessons", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update course total lessons and duration
    const course = await ctx.db.get(args.courseId)
    if (course) {
      await ctx.db.patch(args.courseId, {
        totalLessons: course.totalLessons + 1,
        totalDuration: course.totalDuration + args.duration,
        updatedAt: Date.now(),
      })
    }

    return lessonId
  },
})

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video")),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...updates } = args

    await ctx.db.patch(lessonId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return lessonId
  },
})

export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) throw new Error("Lesson not found")

    await ctx.db.delete(args.lessonId)

    // Update course total lessons and duration
    const course = await ctx.db.get(lesson.courseId)
    if (course) {
      await ctx.db.patch(lesson.courseId, {
        totalLessons: Math.max(0, course.totalLessons - 1),
        totalDuration: Math.max(0, course.totalDuration - lesson.duration),
        updatedAt: Date.now(),
      })
    }

    return args.lessonId
  },
})

// Course Templates
export const getCourseTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect()

    return templates
  },
})

export const createCourseFromTemplate = mutation({
  args: {
    templateId: v.id("courses"),
    title: v.string(),
    shortname: v.string(),
    category: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
      throw new Error("Only instructors can create courses")
    }

    const template = await ctx.db.get(args.templateId)
    if (!template) throw new Error("Template not found")

    // Create new course from template
    const courseId = await ctx.db.insert("courses", {
      ...template,
      _id: undefined,
      _creationTime: undefined,
      title: args.title,
      shortname: args.shortname,
      category: args.category,
      instructorId: user._id,
      isPublished: false,
      isTemplate: false,
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Copy lessons from template
    const templateLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.templateId))
      .collect()

    for (const lesson of templateLessons) {
      await ctx.db.insert("lessons", {
        ...lesson,
        _id: undefined,
        _creationTime: undefined,
        courseId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return courseId
  },
})

// Bulk Course Upload
export const bulkCreateCourses = mutation({
  args: {
    courses: v.array(
      v.object({
        shortname: v.string(),
        title: v.string(),
        category: v.string(),
        description: v.optional(v.string()),
        level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
        duration: v.optional(v.string()),
        price: v.optional(v.number()),
        templateCourse: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
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
    if (user.role !== "admin") {
      throw new Error("Only admins can bulk create courses")
    }

    const results = []

    for (const courseData of args.courses) {
      try {
        let templateCourse = null
        if (courseData.templateCourse) {
          templateCourse = await ctx.db
            .query("courses")
            .filter((q) => q.eq(q.field("shortname"), courseData.templateCourse))
            .first()
        }

        const courseId = await ctx.db.insert("courses", {
          title: courseData.title,
          shortname: courseData.shortname,
          description: courseData.description || "",
          thumbnail: templateCourse?.thumbnail,
          instructorId: user._id,
          category: courseData.category,
          level: courseData.level || "beginner",
          duration: courseData.duration || "4 weeks",
          price: courseData.price || 0,
          tags: templateCourse?.tags || [],
          isPublished: false,
          isTemplate: false,
          totalLessons: 0,
          totalDuration: 0,
          requirements: templateCourse?.requirements || [],
          whatYouWillLearn: templateCourse?.whatYouWillLearn || [],
          startDate: courseData.startDate ? new Date(courseData.startDate).getTime() : undefined,
          endDate: courseData.endDate ? new Date(courseData.endDate).getTime() : undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        // Copy content from template if specified
        if (templateCourse) {
          const templateLessons = await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", templateCourse._id))
            .collect()

          for (const lesson of templateLessons) {
            await ctx.db.insert("lessons", {
              ...lesson,
              _id: undefined,
              _creationTime: undefined,
              courseId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }
        }

        results.push({ success: true, courseId, shortname: courseData.shortname })
      } catch (error) {
        results.push({ success: false, error: error.message, shortname: courseData.shortname })
      }
    }

    return results
  },
})

// Course Reset
export const resetCourse = mutation({
  args: {
    courseId: v.id("courses"),
    resetOptions: v.object({
      removeEnrollments: v.boolean(),
      removeGrades: v.boolean(),
      removeDiscussions: v.boolean(),
      removeSubmissions: v.boolean(),
      newStartDate: v.optional(v.number()),
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

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to reset this course")
    }

    // Remove enrollments
    if (args.resetOptions.removeEnrollments) {
      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect()

      for (const enrollment of enrollments) {
        await ctx.db.delete(enrollment._id)
      }
    }

    // Remove discussions
    if (args.resetOptions.removeDiscussions) {
      const discussions = await ctx.db
        .query("discussions")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect()

      for (const discussion of discussions) {
        // Remove replies first
        const replies = await ctx.db
          .query("discussionReplies")
          .withIndex("by_discussion", (q) => q.eq("discussionId", discussion._id))
          .collect()

        for (const reply of replies) {
          await ctx.db.delete(reply._id)
        }

        await ctx.db.delete(discussion._id)
      }
    }

    // Remove submissions
    if (args.resetOptions.removeSubmissions) {
      const assignments = await ctx.db
        .query("assignments")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect()

      for (const assignment of assignments) {
        const submissions = await ctx.db
          .query("submissions")
          .withIndex("by_assignment", (q) => q.eq("assignmentId", assignment._id))
          .collect()

        for (const submission of submissions) {
          await ctx.db.delete(submission._id)
        }
      }
    }

    // Update course start date if provided
    const updates: any = { updatedAt: Date.now() }
    if (args.resetOptions.newStartDate) {
      updates.startDate = args.resetOptions.newStartDate
    }

    await ctx.db.patch(args.courseId, updates)

    return { success: true }
  },
})

// Course Categories Management
export const createCourseCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("courseCategories")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create course categories")
    }

    const categoryId = await ctx.db.insert("courseCategories", {
      name: args.name,
      description: args.description || "",
      parentId: args.parentId,
      sortOrder: args.sortOrder || 0,
      isVisible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return categoryId
  },
})

export const getCourseCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("courseCategories").collect()

    // Build hierarchy
    const categoryMap = new Map()
    const rootCategories = []

    categories.forEach((cat) => {
      categoryMap.set(cat._id, { ...cat, children: [] })
    })

    categories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          parent.children.push(categoryMap.get(cat._id))
        }
      } else {
        rootCategories.push(categoryMap.get(cat._id))
      }
    })

    return rootCategories
  },
})

// Course Access Restrictions
export const setCourseRestrictions = mutation({
  args: {
    courseId: v.id("courses"),
    restrictions: v.object({
      dateRestriction: v.optional(
        v.object({
          startDate: v.number(),
          endDate: v.number(),
        }),
      ),
      gradeRestriction: v.optional(
        v.object({
          requiredGrade: v.number(),
          requiredCourse: v.id("courses"),
        }),
      ),
      groupRestriction: v.optional(
        v.object({
          allowedGroups: v.array(v.string()),
        }),
      ),
      completionRestriction: v.optional(
        v.object({
          requiredActivities: v.array(v.id("lessons")),
        }),
      ),
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

    const course = await ctx.db.get(args.courseId)
    if (!course) throw new Error("Course not found")

    if (course.instructorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to modify this course")
    }

    await ctx.db.patch(args.courseId, {
      accessRestrictions: args.restrictions,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Course Requests
export const createCourseRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    justification: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const requestId = await ctx.db.insert("courseRequests", {
      title: args.title,
      description: args.description,
      category: args.category,
      justification: args.justification,
      requesterId: user._id,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return requestId
  },
})

export const getCourseRequests = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("courseRequests")

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }

    const requests = await query.collect()

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId)
        return {
          ...request,
          requesterName: requester?.name || "Unknown",
          requesterEmail: requester?.email || "",
        }
      }),
    )

    return requestsWithUsers
  },
})

export const approveCourseRequest = mutation({
  args: {
    requestId: v.id("courseRequests"),
    approved: v.boolean(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can approve course requests")
    }

    const request = await ctx.db.get(args.requestId)
    if (!request) throw new Error("Request not found")

    await ctx.db.patch(args.requestId, {
      status: args.approved ? "approved" : "rejected",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      feedback: args.feedback,
      updatedAt: Date.now(),
    })

    // If approved, create the course
    if (args.approved) {
      const requester = await ctx.db.get(request.requesterId)
      if (requester) {
        await ctx.db.insert("courses", {
          title: request.title,
          shortname: request.title.toLowerCase().replace(/\s+/g, "-"),
          description: request.description,
          instructorId: request.requesterId,
          category: request.category,
          level: "beginner",
          duration: "4 weeks",
          price: 0,
          tags: [],
          isPublished: false,
          isTemplate: false,
          totalLessons: 0,
          totalDuration: 0,
          requirements: [],
          whatYouWillLearn: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
    }

    return { success: true }
  },
})

