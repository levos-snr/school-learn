import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all past papers with real-time data
export const list = query({
  args: {
    subject: v.optional(v.string()),
    form: v.optional(v.string()),
    year: v.optional(v.number()),
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db.query("pastPapers").withIndex("by_verified", (q) => q.eq("isVerified", true))

    const papers = await query.collect()

    let filteredPapers = papers

    // Apply filters
    if (args.subject && args.subject !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.subject === args.subject)
    }
    if (args.form && args.form !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.form === args.form)
    }
    if (args.year) {
      filteredPapers = filteredPapers.filter((paper) => paper.year === args.year)
    }
    if (args.type && args.type !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.type === args.type)
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      filteredPapers = filteredPapers.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchLower) ||
          paper.subject.toLowerCase().includes(searchLower) ||
          (paper.tags && paper.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
      )
    }

    // Sort by most recent
    filteredPapers.sort((a, b) => b.createdAt - a.createdAt)

    // Apply pagination
    const offset = args.offset || 0
    const limit = args.limit || 20
    const paginatedPapers = filteredPapers.slice(offset, offset + limit)

    // Get uploader details for each paper
    const papersWithUploaders = await Promise.all(
      paginatedPapers.map(async (paper) => {
        const uploader = await ctx.db.get(paper.uploaderId)
        return {
          ...paper,
          uploaderName: uploader?.name || "Unknown",
          uploaderAvatar: uploader?.imageUrl,
        }
      }),
    )

    return {
      papers: papersWithUploaders,
      hasMore: filteredPapers.length > offset + limit,
      total: filteredPapers.length,
    }
  },
})

// Get past paper by ID
export const getPastPaperById = query({
  args: { paperId: v.id("pastPapers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.paperId)
    if (!paper || !paper.isVerified) return null

    const uploader = await ctx.db.get(paper.uploaderId)

    return {
      ...paper,
      uploaderName: uploader?.name || "Unknown",
      uploaderAvatar: uploader?.imageUrl,
    }
  },
})

// Upload past paper
export const uploadPastPaper = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    form: v.string(),
    year: v.number(),
    type: v.union(v.literal("End Term"), v.literal("Mid Term"), v.literal("KCSE"), v.literal("Mock"), v.literal("CAT")),
    term: v.optional(v.string()),
    fileUrl: v.string(),
    fileSize: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const paperId = await ctx.db.insert("pastPapers", {
      title: args.title,
      subject: args.subject,
      form: args.form,
      year: args.year,
      type: args.type,
      term: args.term,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      tags: args.tags || [],
      uploaderId: user._id,
      isVerified: user.role === "admin", // Auto-verify if admin uploads
      downloads: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Award XP for contributing
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
        xpPoints: currentStats.xpPoints + 50,
        level: Math.floor((currentStats.xpPoints + 50) / 1000) + 1,
      },
      updatedAt: Date.now(),
    })

    return { success: true, paperId }
  },
})

// Download past paper
export const downloadPastPaper = mutation({
  args: { paperId: v.id("pastPapers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.paperId)
    if (!paper) throw new Error("Past paper not found")

    // Increment download count
    await ctx.db.patch(args.paperId, {
      downloads: paper.downloads + 1,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      fileUrl: paper.fileUrl,
      fileName: paper.title,
      fileSize: paper.fileSize,
    }
  },
})

// Get subjects with counts
export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const subjectCounts = papers.reduce(
      (acc, paper) => {
        acc[paper.subject] = (acc[paper.subject] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(subjectCounts).map(([subject, count]) => ({
      name: subject,
      count,
    }))
  },
})

// Get forms
export const getForms = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const forms = [...new Set(papers.map((p) => p.form))].sort()
    return forms
  },
})

// Get years
export const getYears = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
    return years
  },
})

// Get paper types
export const getTypes = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const types = [...new Set(papers.map((p) => p.type))].sort()
    return types
  },
})

// Get popular papers
export const getPopularPapers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const sortedPapers = papers.sort((a, b) => b.downloads - a.downloads)
    return sortedPapers.slice(0, args.limit || 10)
  },
})

// Get recent papers
export const getRecentPapers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    const sortedPapers = papers.sort((a, b) => b.createdAt - a.createdAt)
    return sortedPapers.slice(0, args.limit || 10)
  },
})

// Verify past paper (admin only)
export const verifyPastPaper = mutation({
  args: {
    paperId: v.id("pastPapers"),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can verify past papers")
    }

    await ctx.db.patch(args.paperId, {
      isVerified: args.isVerified,
      verifiedBy: user._id,
      verifiedAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Get unverified papers (admin only)
export const getUnverifiedPapers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") return []

    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", false))
      .collect()

    const papersWithUploaders = await Promise.all(
      papers.map(async (paper) => {
        const uploader = await ctx.db.get(paper.uploaderId)
        return {
          ...paper,
          uploaderName: uploader?.name || "Unknown",
          uploaderEmail: uploader?.email || "",
        }
      }),
    )

    return papersWithUploaders
  },
})

// Get past paper statistics
export const getPastPaperStats = query({
  args: {},
  handler: async (ctx) => {
    const allPapers = await ctx.db.query("pastPapers").collect()
    const verifiedPapers = allPapers.filter((p) => p.isVerified)

    const totalDownloads = verifiedPapers.reduce((sum, paper) => sum + paper.downloads, 0)
    const kcsePapers = verifiedPapers.filter((p) => p.type === "KCSE").length

    // Get subject counts
    const subjectCounts = verifiedPapers.reduce(
      (acc, paper) => {
        acc[paper.subject] = (acc[paper.subject] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topSubjects = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalPapers: verifiedPapers.length,
      kcsePapers,
      totalDownloads,
      verifiedPapers: verifiedPapers.length,
      pendingVerification: allPapers.length - verifiedPapers.length,
      topSubjects,
    }
  },
})

// Get past papers by course
export const getPastPapersByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // Get course details to find related past papers by subject
    const course = await ctx.db.get(args.courseId)
    if (!course) return []

    // Extract subject from course category or tags
    const courseSubject = course.category.toLowerCase()

    // Get past papers that match the course subject
    const papers = await ctx.db
      .query("pastPapers")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect()

    // Filter papers by subject matching
    const filteredPapers = papers.filter(
      (paper) =>
        paper.subject.toLowerCase().includes(courseSubject) ||
        courseSubject.includes(paper.subject.toLowerCase()) ||
        course.tags.some(
          (tag) =>
            tag.toLowerCase().includes(paper.subject.toLowerCase()) ||
            paper.subject.toLowerCase().includes(tag.toLowerCase()),
        ),
    )

    // Get uploader details for each paper
    const papersWithUploaders = await Promise.all(
      filteredPapers.map(async (paper) => {
        const uploader = await ctx.db.get(paper.uploaderId)
        return {
          ...paper,
          uploaderName: uploader?.name || "Unknown",
          uploaderAvatar: uploader?.imageUrl,
        }
      }),
    )

    return papersWithUploaders.slice(0, 10) // Limit to 10 most relevant papers
  },
})

