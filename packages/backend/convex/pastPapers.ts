import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("pastPapers").collect()

    // Mock data for demonstration
    const mockPapers = [
      {
        _id: "1" as any,
        title: "Mathematics Form 4 End Term 1 2024",
        subject: "Mathematics",
        form: "Form 4",
        year: 2024,
        type: "End Term",
        term: "Term 1",
        fileSize: "2.5 MB",
        downloads: 245,
        uploadDate: "2024-03-15",
        isVerified: true,
        uploader: { name: "Mr. Kamau" },
        fileUrl: "/papers/math-form4-term1-2024.pdf",
      },
      {
        _id: "2" as any,
        title: "English Form 3 Mid Term 2 2024",
        subject: "English",
        form: "Form 3",
        year: 2024,
        type: "Mid Term",
        term: "Term 2",
        fileSize: "1.8 MB",
        downloads: 189,
        uploadDate: "2024-05-20",
        isVerified: true,
        uploader: { name: "Mrs. Wanjiku" },
        fileUrl: "/papers/english-form3-term2-2024.pdf",
      },
      {
        _id: "3" as any,
        title: "Chemistry Form 4 KCSE Mock 2024",
        subject: "Chemistry",
        form: "Form 4",
        year: 2024,
        type: "Mock",
        term: "Term 3",
        fileSize: "3.2 MB",
        downloads: 567,
        uploadDate: "2024-08-10",
        isVerified: true,
        uploader: { name: "Dr. Ochieng" },
        fileUrl: "/papers/chemistry-form4-mock-2024.pdf",
      },
      {
        _id: "4" as any,
        title: "Biology Form 2 CAT 1 2024",
        subject: "Biology",
        form: "Form 2",
        year: 2024,
        type: "CAT",
        term: "Term 1",
        fileSize: "1.2 MB",
        downloads: 123,
        uploadDate: "2024-02-28",
        isVerified: true,
        uploader: { name: "Ms. Akinyi" },
        fileUrl: "/papers/biology-form2-cat1-2024.pdf",
      },
      {
        _id: "5" as any,
        title: "Physics Form 4 End Term 3 2023",
        subject: "Physics",
        form: "Form 4",
        year: 2023,
        type: "End Term",
        term: "Term 3",
        fileSize: "2.8 MB",
        downloads: 334,
        uploadDate: "2023-11-15",
        isVerified: true,
        uploader: { name: "Mr. Mwangi" },
        fileUrl: "/papers/physics-form4-term3-2023.pdf",
      },
      {
        _id: "6" as any,
        title: "Kiswahili Form 1 End Term 2 2024",
        subject: "Kiswahili",
        form: "Form 1",
        year: 2024,
        type: "End Term",
        term: "Term 2",
        fileSize: "1.5 MB",
        downloads: 98,
        uploadDate: "2024-06-12",
        isVerified: true,
        uploader: { name: "Mwalimu Juma" },
        fileUrl: "/papers/kiswahili-form1-term2-2024.pdf",
      },
    ]

    return mockPapers
  },
})

export const getPastPapers = query({
  args: {
    subject: v.optional(v.string()),
    year: v.optional(v.number()),
    form: v.optional(v.string()),
    type: v.optional(v.union(v.literal("past_paper"), v.literal("marking_scheme"), v.literal("specimen"))),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all papers first
    const allPapers = await ctx.db.query("pastPapers").collect()

    // Mock data with more comprehensive structure
    const mockPapers = [
      {
        _id: "1" as any,
        title: "Mathematics Form 4 End Term 1 2024",
        subject: "Mathematics",
        form: "Form 4",
        year: 2024,
        type: "past_paper" as const,
        fileSize: "2.5 MB",
        downloadCount: 245,
        isVerified: true,
        uploader: { name: "Mr. Kamau" },
        tags: ["Algebra", "Calculus", "Geometry"],
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
      },
      {
        _id: "2" as any,
        title: "Mathematics Form 4 Marking Scheme Term 1 2024",
        subject: "Mathematics",
        form: "Form 4",
        year: 2024,
        type: "marking_scheme" as const,
        fileSize: "1.8 MB",
        downloadCount: 189,
        isVerified: true,
        uploader: { name: "Mr. Kamau" },
        tags: ["Solutions", "Marking Guide"],
        createdAt: Date.now() - 86400000 * 30,
      },
      {
        _id: "3" as any,
        title: "Chemistry Form 4 KCSE Specimen 2024",
        subject: "Chemistry",
        form: "Form 4",
        year: 2024,
        type: "specimen" as const,
        fileSize: "3.2 MB",
        downloadCount: 567,
        isVerified: true,
        uploader: { name: "Dr. Ochieng" },
        tags: ["Organic Chemistry", "Inorganic", "Physical Chemistry"],
        createdAt: Date.now() - 86400000 * 15,
      },
      {
        _id: "4" as any,
        title: "Biology Form 2 Past Paper 2024",
        subject: "Biology",
        form: "Form 2",
        year: 2024,
        type: "past_paper" as const,
        fileSize: "1.2 MB",
        downloadCount: 123,
        isVerified: true,
        uploader: { name: "Ms. Akinyi" },
        tags: ["Cell Biology", "Genetics"],
        createdAt: Date.now() - 86400000 * 45,
      },
      {
        _id: "5" as any,
        title: "Physics Form 4 Past Paper 2023",
        subject: "Physics",
        form: "Form 4",
        year: 2023,
        type: "past_paper" as const,
        fileSize: "2.8 MB",
        downloadCount: 334,
        isVerified: true,
        uploader: { name: "Mr. Mwangi" },
        tags: ["Mechanics", "Electricity", "Waves"],
        createdAt: Date.now() - 86400000 * 120,
      },
      {
        _id: "6" as any,
        title: "English Form 3 Past Paper 2024",
        subject: "English",
        form: "Form 3",
        year: 2024,
        type: "past_paper" as const,
        fileSize: "1.5 MB",
        downloadCount: 98,
        isVerified: true,
        uploader: { name: "Mrs. Wanjiku" },
        tags: ["Literature", "Grammar", "Composition"],
        createdAt: Date.now() - 86400000 * 60,
      },
    ]

    let filteredPapers = mockPapers

    // Apply filters
    if (args.subject) {
      filteredPapers = filteredPapers.filter((paper) => paper.subject === args.subject)
    }
    if (args.year) {
      filteredPapers = filteredPapers.filter((paper) => paper.year === args.year)
    }
    if (args.form) {
      filteredPapers = filteredPapers.filter((paper) => paper.form === args.form)
    }
    if (args.type) {
      filteredPapers = filteredPapers.filter((paper) => paper.type === args.type)
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      filteredPapers = filteredPapers.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchLower) ||
          paper.subject.toLowerCase().includes(searchLower) ||
          paper.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Sort by most recent
    filteredPapers.sort((a, b) => b.createdAt - a.createdAt)

    // Apply pagination
    const offset = args.offset || 0
    const limit = args.limit || 20
    const paginatedPapers = filteredPapers.slice(offset, offset + limit)
    const hasMore = filteredPapers.length > offset + limit

    return {
      papers: paginatedPapers,
      hasMore,
      total: filteredPapers.length,
    }
  },
})

export const getPastPaperSubjects = query({
  args: {},
  handler: async (ctx) => {
    return [
      { name: "Mathematics", count: 45 },
      { name: "English", count: 38 },
      { name: "Kiswahili", count: 32 },
      { name: "Biology", count: 41 },
      { name: "Chemistry", count: 39 },
      { name: "Physics", count: 37 },
      { name: "History", count: 28 },
      { name: "Geography", count: 31 },
      { name: "Business Studies", count: 25 },
      { name: "Agriculture", count: 22 },
    ]
  },
})

export const getPastPaperYears = query({
  args: {},
  handler: async (ctx) => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, i) => currentYear - i)
  },
})

export const getPastPaperStats = query({
  args: {},
  handler: async (ctx) => {
    return {
      totalPapers: 312,
      kcsePapers: 89,
      totalDownloads: 15420,
      verifiedPapers: 298,
      topSubjects: [
        { subject: "Mathematics", count: 45 },
        { subject: "Biology", count: 41 },
        { subject: "Chemistry", count: 39 },
        { subject: "English", count: 38 },
        { subject: "Physics", count: 37 },
      ],
    }
  },
})

export const downloadPaper = mutation({
  args: { paperId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    // In a real scenario, you would:
    // 1. Get the paper from database
    // 2. Check user permissions
    // 3. Generate a secure download URL
    // 4. Log the download
    // 5. Update download count

    // For now, return mock download info
    return {
      success: true,
      downloadUrl: `/api/download/${args.paperId}`,
      fileName: `paper-${args.paperId}.pdf`,
    }
  },
})

export const uploadPaper = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    form: v.string(),
    year: v.number(),
    type: v.union(v.literal("past_paper"), v.literal("marking_scheme"), v.literal("specimen")),
    fileUrl: v.string(),
    fileSize: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    // In a real scenario, you would validate the file, scan for viruses, etc.
    const paperId = await ctx.db.insert("pastPapers", {
      title: args.title,
      subject: args.subject,
      form: args.form,
      year: args.year,
      type: args.type,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      tags: args.tags,
      uploaderId: user._id,
      isVerified: false, // Requires admin verification
      downloadCount: 0,
      createdAt: Date.now(),
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
        xpPoints: currentStats.xpPoints + 50, // Reward for uploading
      },
    })

    return { success: true, paperId }
  },
})

export const getAllPastPapers = query({
  args: {
    subject: v.optional(v.string()),
    form: v.optional(v.string()),
    year: v.optional(v.number()),
    type: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("pastPapers").filter((q) => q.eq(q.field("isVerified"), true))

    if (args.subject && args.subject !== "all") {
      query = query.filter((q) => q.eq(q.field("subject"), args.subject))
    }

    if (args.form && args.form !== "all") {
      query = query.filter((q) => q.eq(q.field("form"), args.form))
    }

    if (args.year) {
      query = query.filter((q) => q.eq(q.field("year"), args.year))
    }

    if (args.type && args.type !== "all") {
      query = query.filter((q) => q.eq(q.field("type"), args.type))
    }

    const papers = await query.collect()

    if (args.search) {
      return papers.filter((paper) => paper.title.toLowerCase().includes(args.search!.toLowerCase()))
    }

    return papers.sort((a, b) => b.year - a.year)
  },
})

export const getPastPaperById = query({
  args: { paperId: v.id("pastPapers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.paperId)
    if (!paper || !paper.isVerified) return null

    return paper
  },
})

export const downloadPastPaper = mutation({
  args: { paperId: v.id("pastPapers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.paperId)
    if (!paper) throw new Error("Past paper not found")

    // Increment download count
    await ctx.db.patch(args.paperId, {
      downloads: paper.downloads + 1,
    })

    return { success: true, fileUrl: paper.fileUrl, fileName: paper.title }
  },
})

export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("pastPapers").collect()
    const subjects = [...new Set(papers.map((p) => p.subject))].sort()
    return subjects
  },
})

export const getForms = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("pastPapers").collect()
    const forms = [...new Set(papers.map((p) => p.form))].sort()
    return forms
  },
})

export const getYears = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("pastPapers").collect()
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
    return years
  },
})

export const getPopularPapers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const papers = await ctx.db
      .query("pastPapers")
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect()

    return papers.sort((a, b) => b.downloads - a.downloads).slice(0, args.limit || 10)
  },
})

export const getRecentPapers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const papers = await ctx.db
      .query("pastPapers")
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect()

    return papers.sort((a, b) => b.createdAt - a.createdAt).slice(0, args.limit || 10)
  },
})

