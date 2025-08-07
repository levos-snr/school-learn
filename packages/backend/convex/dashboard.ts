import { query } from "./_generated/server";
import { v } from "convex/values";

// Get overview statistics for dashboard
export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get user's submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get user's test attempts
    const testAttempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate stats
    const totalCourses = enrollments.length;
    const avgProgress = totalCourses > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses 
      : 0;
    
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const avgTestScore = testAttempts.length > 0
      ? testAttempts.reduce((sum, t) => sum + t.score, 0) / testAttempts.length
      : 0;

    return {
      totalCourses,
      avgProgress: Math.round(avgProgress),
      completedCourses,
      xpPoints: user.stats.totalXP || 0,
      level: user.stats.level || 1,
      studyStreak: user.stats.streak || 0,
      avgTestScore: Math.round(avgTestScore),
    };
  },
});

// Get user's courses with progress
export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get course details for each enrollment
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        const instructor = await ctx.db.get(course.instructorId);
        
        return {
          id: course._id,
          title: course.title,
          instructor: instructor?.name || "Unknown Instructor",
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons.length,
          totalLessons: course.totalLessons,
          bgGradient: "from-blue-500 to-purple-500", // Default gradient
        };
      })
    );

    return coursesWithProgress.filter(Boolean);
  },
});

// Get user's assignments
export const getAssignments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's enrollments to find their courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const courseIds = enrollments.map(e => e.courseId);

    // Get assignments for user's courses
    const allAssignments = await Promise.all(
      courseIds.map(async (courseId) => {
        return await ctx.db
          .query("assignments")
          .withIndex("by_course", (q) => q.eq("courseId", courseId))
          .collect();
      })
    );

    const assignments = allAssignments.flat();

    // Get user's submissions to check completion status
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));

    // Format assignments with status and course info
    const formattedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        const submission = submissionMap.get(assignment._id);
        
        const now = Date.now();
        const dueDate = assignment.dueDate || (now + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
        const isOverdue = dueDate < now;
        const daysTillDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
        
        let priority: "high" | "medium" | "low" = "low";
        if (isOverdue || daysTillDue <= 1) priority = "high";
        else if (daysTillDue <= 3) priority = "medium";

        return {
          id: assignment._id,
          title: assignment.title,
          subject: course?.title || "Unknown Course",
          dueDate: new Date(dueDate).toLocaleDateString(),
          status: submission ? "completed" : isOverdue ? "overdue" : "pending",
          priority,
          estimatedTime: "2-3 hours", // Default estimate
        };
      })
    );

    return formattedAssignments.sort((a, b) => {
      // Sort by priority (high first) then by due date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  },
});

// Get user's tests
export const getTests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's enrollments to find their courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const courseIds = enrollments.map(e => e.courseId);

    // Get tests for user's courses
    const allTests = await Promise.all(
      courseIds.map(async (courseId) => {
        return await ctx.db
          .query("tests")
          .withIndex("by_course", (q) => q.eq("courseId", courseId))
          .collect();
      })
    );

    const tests = allTests.flat();

    // Get user's test attempts
    const testAttempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const attemptMap = new Map();
    testAttempts.forEach(attempt => {
      const existing = attemptMap.get(attempt.testId);
      if (!existing || attempt.score > existing.score) {
        attemptMap.set(attempt.testId, attempt);
      }
    });

    // Format tests with attempt info
    const formattedTests = await Promise.all(
      tests.map(async (test) => {
        const course = await ctx.db.get(test.courseId);
        const bestAttempt = attemptMap.get(test._id);
        
        return {
          id: test._id,
          title: test.title,
          subject: course?.title || "Unknown Course",
          bestScore: bestAttempt?.score || null,
          status: bestAttempt ? "completed" : test.isPublished ? "available" : "upcoming",
        };
      })
    );

    return formattedTests;
  },
});

// Get user's friends
export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's accepted friendships
    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Get friend details
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId);
        if (!friend) return null;

        // Get friend's current course (most recent enrollment)
        const friendEnrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", friend._id))
          .collect();

        const latestEnrollment = friendEnrollments.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)[0];
        let currentCourse = "No active course";
        
        if (latestEnrollment) {
          const course = await ctx.db.get(latestEnrollment.courseId);
          currentCourse = course?.title || "Unknown Course";
        }

        return {
          id: friend._id,
          name: friend.name,
          status: "online", // You might want to implement actual online status
          currentCourse,
          studyStreak: friend.stats.streak || 0,
        };
      })
    );

    return friends.filter(Boolean);
  },
});
