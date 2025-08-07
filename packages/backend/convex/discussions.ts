import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get discussions for a course
export const getCourseDiscussions = query({
  args: {
    courseId: v.id("courses"),
    lessonId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const discussionsQuery = ctx.db.query("discussions").withIndex("by_course", (q) => q.eq("courseId", args.courseId))

    let discussions = await discussionsQuery.collect()

    // Filter by lesson if provided
    if (args.lessonId) {
      discussions = discussions.filter((d) => d.lessonId === args.lessonId)
    }

    // Get user details and replies for each discussion
    const discussionsWithDetails = await Promise.all(
      discussions.map(async (discussion) => {
        const user = await ctx.db.get(discussion.userId)
        const replies = await ctx.db
          .query("discussionReplies")
          .withIndex("by_discussion", (q) => q.eq("discussionId", discussion._id))
          .collect()

        const repliesWithUsers = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await ctx.db.get(reply.userId)
            return {
              ...reply,
              userName: replyUser?.name || "Unknown",
              userImage: replyUser?.imageUrl,
            }
          }),
        )

        return {
          ...discussion,
          userName: user?.name || "Unknown",
          userImage: user?.imageUrl,
          replies: repliesWithUsers,
          replyCount: replies.length,
        }
      }),
    )

    // Sort by pinned first, then by creation date
    return discussionsWithDetails.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.createdAt - a.createdAt
    })
  },
})

// Create a new discussion
export const createDiscussion = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("question"), v.literal("discussion"), v.literal("announcement")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    // Check if user is enrolled in the course or is instructor/admin
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique()

    const course = await ctx.db.get(args.courseId)
    const isInstructor = course?.instructor === user._id
    const isAdmin = user.role === "admin"

    if (!enrollment && !isInstructor && !isAdmin) {
      throw new Error("Must be enrolled in course to participate in discussions")
    }

    const discussionId = await ctx.db.insert("discussions", {
      courseId: args.courseId,
      lessonId: args.lessonId,
      userId: user._id,
      title: args.title,
      content: args.content,
      type: args.type,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { success: true, discussionId }
  },
})

// Reply to a discussion
export const replyToDiscussion = mutation({
  args: {
    discussionId: v.id("discussions"),
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

    const discussion = await ctx.db.get(args.discussionId)
    if (!discussion) throw new Error("Discussion not found")

    // Check if user is enrolled in the course or is instructor/admin
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", discussion.courseId))
      .unique()

    const course = await ctx.db.get(discussion.courseId)
    const isInstructor = course?.instructor === user._id
    const isAdmin = user.role === "admin"

    if (!enrollment && !isInstructor && !isAdmin) {
      throw new Error("Must be enrolled in course to participate in discussions")
    }

    const replyId = await ctx.db.insert("discussionReplies", {
      discussionId: args.discussionId,
      userId: user._id,
      content: args.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update discussion's updated time
    await ctx.db.patch(args.discussionId, {
      updatedAt: Date.now(),
    })

    return { success: true, replyId }
  },
})

// Pin/unpin discussion (instructor/admin only)
export const togglePinDiscussion = mutation({
  args: {
    discussionId: v.id("discussions"),
    isPinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const discussion = await ctx.db.get(args.discussionId)
    if (!discussion) throw new Error("Discussion not found")

    const course = await ctx.db.get(discussion.courseId)
    const isInstructor = course?.instructor === user._id
    const isAdmin = user.role === "admin"

    if (!isInstructor && !isAdmin) {
      throw new Error("Only instructors and admins can pin discussions")
    }

    await ctx.db.patch(args.discussionId, {
      isPinned: args.isPinned,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Delete discussion
export const deleteDiscussion = mutation({
  args: { discussionId: v.id("discussions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const discussion = await ctx.db.get(args.discussionId)
    if (!discussion) throw new Error("Discussion not found")

    const course = await ctx.db.get(discussion.courseId)
    const isInstructor = course?.instructor === user._id
    const isAdmin = user.role === "admin"
    const isOwner = discussion.userId === user._id

    if (!isOwner && !isInstructor && !isAdmin) {
      throw new Error("Not authorized to delete this discussion")
    }

    // Delete all replies first
    const replies = await ctx.db
      .query("discussionReplies")
      .withIndex("by_discussion", (q) => q.eq("discussionId", args.discussionId))
      .collect()

    for (const reply of replies) {
      await ctx.db.delete(reply._id)
    }

    // Delete the discussion
    await ctx.db.delete(args.discussionId)

    return { success: true }
  },
})

