import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Course Templates
export const getCourseTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect()

    const templatesWithInstructors = await Promise.all(
      templates.map(async (template) => {
        const instructor = await ctx.db.get(template.instructorId)
        return {
          ...template,
          instructorName: instructor?.name || "Unknown",
          instructorImage: instructor?.imageUrl,
        }
      })
    )

    return templatesWithInstructors
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
      title: args.title,
      shortname: args.shortname,
      description: template.description,
      thumbnail: template.thumbnail,
      instructorId: user._id,
      category: args.category,
      level: template.level,
      duration: template.duration,
      price: template.price,
      tags: template.tags,
      isPublished: false,
      isTemplate: false,
      totalLessons: 0,
      totalDuration: 0,
      requirements: template.requirements,
      whatYouWillLearn: template.whatYouWillLearn,
      startDate: args.startDate,
      endDate: args.endDate,
      format: template.format,
      settings: template.settings,
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
        courseId,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        isPreview: lesson.isPreview,
        resources: lesson.resources,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Update course totals
    await ctx.db.patch(courseId, {
      totalLessons: templateLessons.length,
      totalDuration: templateLessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    })

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
      })
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
            .withIndex("by_shortname", (q) => q.eq("shortname", courseData.templateCourse))
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
          format: templateCourse?.format || "topics",
          settings: templateCourse?.settings || {
            showGradebook: true,
            allowDiscussions: true,
            maxFileSize: 10485760, // 10MB
          },
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
              courseId,
              title: lesson.title,
              description: lesson.description,
              content: lesson.content,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration,
              order: lesson.order,
              isPreview: lesson.isPreview,
              resources: lesson.resources,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }

          // Update course totals
          await ctx.db.patch(courseId, {
            totalLessons: templateLessons.length,
            totalDuration: templateLessons.reduce((sum, lesson) => sum + lesson.duration, 0),
          })
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

    categories.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] })
    })

    categories.forEach(cat => {
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
      query = query.withIndex("by_status", (q) => q.eq("status", args.status))
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
      })
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
          shortname: request.title.toLowerCase().replace(/\s+/g, '-'),
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
          format: "topics",
          settings: {
            showGradebook: true,
            allowDiscussions: true,
            maxFileSize: 10485760,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
    }

    return { success: true }
  },
})

// Course Access Restrictions
export const setCourseRestrictions = mutation({
  args: {
    courseId: v.id("courses"),
    restrictions: v.object({
      dateRestriction: v.optional(v.object({
        startDate: v.number(),
        endDate: v.number(),
      })),
      gradeRestriction: v.optional(v.object({
        requiredGrade: v.number(),
        requiredCourse: v.id("courses"),
      })),
      groupRestriction: v.optional(v.object({
        allowedGroups: v.array(v.string()),
      })),
      completionRestriction: v.optional(v.object({
        requiredActivities: v.array(v.id("lessons")),
      })),
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

// Course Analytics
export const getCourseAnalytics = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId)
    if (!course) return null

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect()

    const discussions = await ctx.db
      .query("discussions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect()

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect()

    const totalEnrollments = enrollments.length
    const completedCount = enrollments.filter((e) => e.progress === 100).length
    const averageProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
      : 0

    const activeStudents = enrollments.filter(
      (e) => Date.now() - e.lastAccessedAt < 7 * 24 * 60 * 60 * 1000
    ).length

    return {
      totalEnrollments,
      completedCount,
      averageProgress: Math.round(averageProgress),
      activeStudents,
      totalDiscussions: discussions.length,
      totalAssignments: assignments.length,
      completionRate: totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0,
    }
  },
})
