// convex/admin.ts
import { query } from "./_generated/server"
import { v } from "convex/values"

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Get total users
    const users = await ctx.db.query("users").collect()
    const totalUsers = users.length
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const activeUsers = users.filter(user => 
      user.updatedAt > thirtyDaysAgo
    ).length
    
    // Get recent users (registered this month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const recentUsers = users.filter(user => 
      user.createdAt > startOfMonth.getTime()
    ).length
    
    // Get courses
    const courses = await ctx.db.query("courses").collect()
    const totalCourses = courses.length
    const publishedCourses = courses.filter(course => course.published).length
    
    // Get enrollments
    const enrollments = await ctx.db.query("enrollments").collect()
    const totalEnrollments = enrollments.length
    const recentEnrollments = enrollments.filter(enrollment => 
      enrollment.enrolledAt > startOfMonth.getTime()
    ).length
    
    // Calculate engagement rate
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    
    return {
      totalUsers,
      activeUsers,
      recentUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      recentEnrollments,
      engagementRate,
    }
  },
})

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    // Mock system health data - in a real app, you'd get this from monitoring services
    return {
      systemUptime: 99.9,
      responseTime: 120,
      errorRate: 0.1,
    }
  },
})

// convex/users.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) return null
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.subject))
      .first()
    
    return currentUser
  },
})

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) return false
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.subject))
      .first()
    
    return currentUser?.role === "admin"
  },
})

export const getUsers = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("users")
    
    if (args.role && args.role !== "all") {
      query = query.withIndex("by_role", (q) => q.eq("role", args.role as any))
    }
    
    let users = await query.collect()
    
    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply limit
    if (args.limit) {
      users = users.slice(0, args.limit)
    }
    
    return { users }
  },
})

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("instructor"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role })
  },
})

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      suspended: true,
      suspensionReason: args.reason,
    })
  },
})

export const unsuspendUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      suspended: false,
      suspensionReason: undefined,
    })
  },
})

// convex/courses.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Remove the existing getCourses function and replace with this:
export const getAdminCourses = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("courses")
    
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }
    
    let courses = await query.collect()
    
    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
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
          published: course.isPublished, // Add for backward compatibility
          rating: 4.5, // Mock rating - you'd calculate this from actual reviews
        }
      })
    )
    
    // Apply limit
    const limitedCourses = args.limit 
      ? coursesWithDetails.slice(0, args.limit)
      : coursesWithDetails
    
    return { courses: limitedCourses }
  },
})

// Also fix the updateCourse function to use the correct field name
export const updateAdminCourse = mutation({
  args: {
    courseId: v.id("courses"),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: any = {}
    
    if (args.isPublished !== undefined) {
      updates.isPublished = args.isPublished // Use isPublished instead of published
    }
    
    updates.updatedAt = Date.now()
    
    await ctx.db.patch(args.courseId, updates)
  },
})

// Fix the deleteCourse function name conflict
export const deleteAdminCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // In a real app, you'd want to handle cascade deletes for enrollments, etc.
    await ctx.db.delete(args.courseId)
  },
})
