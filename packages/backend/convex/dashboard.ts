import { query } from "./_generated/server"

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return null

    // Get enrolled courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get assignments
    const assignments = await ctx.db.query("assignments").collect()
    const assignmentSubmissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get tests
    const tests = await ctx.db.query("tests").collect()
    const testAttempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get friends
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect()

    // Calculate stats
    const totalCourses = enrollments.length
    const completedCourses = enrollments.filter((e) => e.progress >= 100).length
    const avgProgress =
      totalCourses > 0 ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses) : 0

    const pendingAssignments = assignments.filter((a) => {
      const submission = assignmentSubmissions.find((s) => s.assignmentId === a._id)
      return !submission && a.dueDate > Date.now()
    }).length

    const completedTests = testAttempts.filter((t) => t.status === "completed").length
    const avgTestScore =
      completedTests > 0
        ? Math.round(
            testAttempts.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.percentage, 0) /
              completedTests,
          )
        : 0

    return {
      totalCourses,
      completedCourses,
      avgProgress,
      pendingAssignments,
      completedTests,
      avgTestScore,
      totalFriends: friends.length,
      studyStreak: user.stats?.studyStreak || 0,
      xpPoints: user.stats?.xpPoints || 0,
      level: user.stats?.level || 1,
    }
  },
})

export const getCourses = query({
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
        if (!course) return null

        return {
          id: course._id,
          title: course.title,
          instructor: course.instructor,
          category: course.category,
          subject: course.subject,
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          totalLessons: course.totalLessons,
          rating: course.rating,
          students: course.students,
          duration: course.duration,
          nextLesson: "Introduction to " + course.subject,
          bgGradient: getSubjectGradient(course.subject),
        }
      }),
    )

    return coursesWithProgress.filter(Boolean)
  },
})

export const getAssignments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const assignments = await ctx.db.query("assignments").collect()
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissions.find((s) => s.assignmentId === assignment._id)
      const now = Date.now()
      const isOverdue = assignment.dueDate < now && !submission

      let status = "pending"
      let progress = 0

      if (submission) {
        status = "completed"
        progress = 100
      } else if (isOverdue) {
        status = "overdue"
      }

      return {
        id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        course: `${assignment.subject} ${assignment.form}`,
        dueDate: new Date(assignment.dueDate).toISOString().split("T")[0],
        status,
        priority: isOverdue ? "high" : assignment.dueDate - now < 86400000 ? "medium" : "low",
        progress,
        totalQuestions: assignment.totalQuestions,
        completedQuestions: submission ? assignment.totalQuestions : 0,
        estimatedTime: assignment.estimatedTime,
      }
    })

    return assignmentsWithStatus
  },
})

export const getTests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const tests = await ctx.db.query("tests").collect()
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const testsWithStatus = tests.map((test) => {
      const userAttempts = attempts.filter((a) => a.testId === test._id)
      const completedAttempts = userAttempts.filter((a) => a.status === "completed")
      const bestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.percentage)) : null

      let status = "pending"
      if (completedAttempts.length > 0) {
        status = "completed"
      } else if (userAttempts.some((a) => a.status === "in-progress")) {
        status = "in-progress"
      }

      return {
        id: test._id,
        title: test.title,
        course: `${test.subject} ${test.form}`,
        subject: test.subject,
        type: test.type,
        dueDate: new Date(test.dueDate).toISOString().split("T")[0],
        duration: test.duration,
        questions: test.totalQuestions,
        status,
        bestScore,
        attempts: userAttempts.length,
      }
    })

    return testsWithStatus
  },
})

export const getPastPapers = query({
  args: {},
  handler: async (ctx) => {
    const papers = await ctx.db.query("pastPapers").collect()

    return papers.map((paper) => ({
      id: paper._id,
      title: paper.title,
      subject: paper.subject,
      form: paper.form,
      year: paper.year,
      term: paper.term,
      type: paper.type,
      fileSize: paper.fileSize,
      downloads: paper.downloads,
      uploadDate: paper.uploadDate,
    }))
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

function getSubjectGradient(subject: string): string {
  const gradients: Record<string, string> = {
    Mathematics: "from-blue-400 to-blue-600",
    Physics: "from-green-400 to-green-600",
    Chemistry: "from-purple-400 to-purple-600",
    Biology: "from-emerald-400 to-emerald-600",
    English: "from-pink-400 to-pink-600",
    Kiswahili: "from-orange-400 to-orange-600",
    History: "from-indigo-400 to-indigo-600",
    Geography: "from-teal-400 to-teal-600",
  }
  return gradients[subject] || "from-gray-400 to-gray-600"
}

