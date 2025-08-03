import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect()

    const friendsData = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId)
        if (!friend) return null

        return {
          ...friend,
          isOnline: Math.random() > 0.5, // Mock online status
          lastSeen: "2 hours ago",
          level: friend.stats?.level || 1,
          xpPoints: friend.stats?.xpPoints || 0,
          studyStreak: friend.stats?.studyStreak || 0,
        }
      }),
    )

    return friendsData.filter(Boolean)
  },
})

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!currentUser) return []

    const users = await ctx.db.query("users").collect()

    // Filter users by name
    const filteredUsers = users
      .filter((user) => user._id !== currentUser._id && user.name.toLowerCase().includes(args.query.toLowerCase()))
      .slice(0, args.limit || 20)

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      filteredUsers.map(async (user) => {
        const friendship = await ctx.db
          .query("friends")
          .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
          .filter((q) => q.eq(q.field("friendId"), user._id))
          .unique()

        const reverseFriendship = await ctx.db
          .query("friends")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("friendId"), currentUser._id))
          .unique()

        let status = "none"
        if (friendship?.status === "accepted" || reverseFriendship?.status === "accepted") {
          status = "friends"
        } else if (friendship?.status === "pending") {
          status = "sent"
        } else if (reverseFriendship?.status === "pending") {
          status = "received"
        }

        return {
          _id: user._id,
          name: user.name,
          imageUrl: user.imageUrl,
          stats: user.stats,
          level: user.stats?.level || 1,
          xpPoints: user.stats?.xpPoints || 0,
          profile: user.profile,
          friendshipStatus: status,
        }
      }),
    )

    return usersWithStatus
  },
})

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_friend", (q) => q.eq("friendId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId)
        return {
          ...request,
          senderId: request.userId,
          senderName: requester?.name || "Unknown",
          senderImageUrl: requester?.imageUrl,
          requestedAt: request.requestedAt || Date.now(),
        }
      }),
    )

    return requestsWithUsers
  },
})

export const sendRequest = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    if (user._id === args.friendId) {
      throw new Error("Cannot send friend request to yourself")
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("friendId"), args.friendId))
      .unique()

    if (existingFriendship) {
      throw new Error("Friend request already exists or you are already friends")
    }

    const requestId = await ctx.db.insert("friends", {
      userId: user._id,
      friendId: args.friendId,
      status: "pending",
      requestedAt: Date.now(),
    })

    return { success: true, requestId }
  },
})

export const acceptRequest = mutation({
  args: { requestId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const request = await ctx.db.get(args.requestId)
    if (!request || request.friendId !== user._id || request.status !== "pending") {
      throw new Error("Invalid friend request")
    }

    // Update the request
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      acceptedAt: Date.now(),
    })

    // Create reverse friendship
    await ctx.db.insert("friends", {
      userId: user._id,
      friendId: request.userId,
      status: "accepted",
      requestedAt: request.requestedAt,
      acceptedAt: Date.now(),
    })

    // Award XP for making friends
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
      },
    })

    return { success: true }
  },
})

export const rejectRequest = mutation({
  args: { requestId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not found")

    const request = await ctx.db.get(args.requestId)
    if (!request || request.friendId !== user._id || request.status !== "pending") {
      throw new Error("Invalid friend request")
    }

    await ctx.db.delete(args.requestId)
    return { success: true }
  },
})

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect()

    const friendsData = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId)
        if (!friend) return null

        // Get friend's current course
        const friendEnrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", friend._id))
          .collect()

        const currentCourse = friendEnrollments.length > 0 ? await ctx.db.get(friendEnrollments[0].courseId) : null

        return {
          id: friend._id,
          name: friend.name,
          avatar: friend.imageUrl,
          status: Math.random() > 0.5 ? "online" : Math.random() > 0.5 ? "busy" : "offline",
          currentCourse: currentCourse?.title || "No active course",
          studyStreak: friend.stats?.studyStreak || 0,
          lastSeen: "2 hours ago",
        }
      }),
    )

    return friendsData.filter(Boolean)
  },
})

export const getFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_friend", (q) => q.eq("friendId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId)
        return {
          ...request,
          requester: requester
            ? {
                _id: requester._id,
                name: requester.name,
                avatar: requester.imageUrl,
                stats: requester.stats,
              }
            : null,
        }
      }),
    )

    return requestsWithUsers.filter((r) => r.requester !== null)
  },
})

