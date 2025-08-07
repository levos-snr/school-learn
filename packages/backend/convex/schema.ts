import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("instructor"), v.literal("admin")),
    suspended: v.boolean(),
    suspensionReason: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    profile: v.optional(
      v.object({
        bio: v.optional(v.string()),
        grade: v.optional(v.string()),
        school: v.optional(v.string()),
        subjects: v.optional(v.array(v.string())),
        goals: v.optional(v.array(v.string())),
        studySchedule: v.optional(v.string()),
      }),
    ),
    stats: v.object({
      totalXP: v.float64(),
      level: v.float64(),
      streak: v.float64(),
      coursesCompleted: v.float64(),
      studyTime: v.float64(),
      xpPoints: v.optional(v.float64()),
      studyStreak: v.optional(v.float64()),
      assignmentsCompleted: v.optional(v.float64()),
      testsCompleted: v.optional(v.float64()),
      totalStudyTime: v.optional(v.float64()),
      currentStreak: v.optional(v.float64()),
    }),
    settings: v.object({
      notifications: v.object({
        email: v.boolean(),
        push: v.boolean(),
        assignments: v.boolean(),
        deadlines: v.boolean(),
        achievements: v.boolean(),
        social: v.boolean(),
      }),
      privacy: v.object({
        profileVisible: v.boolean(),
        progressVisible: v.boolean(),
        friendsVisible: v.boolean(),
      }),
      theme: v.string(),
      language: v.string(),
      timezone: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnail: v.optional(v.string()),
    instructorId: v.id("users"),
    category: v.string(),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    duration: v.string(), // e.g., "4 weeks", "2 months"
    price: v.number(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    totalLessons: v.number(),
    totalDuration: v.number(), // in minutes
    requirements: v.array(v.string()),
    whatYouWillLearn: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.string(), // Rich text content
    videoUrl: v.optional(v.string()),
    duration: v.number(), // in minutes
    order: v.number(),
    isPreview: v.boolean(), // Can be viewed without enrollment
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video")),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
    progress: v.number(), // 0-100
    completedLessons: v.array(v.id("lessons")),
    lastAccessedAt: v.number(),
    certificateIssued: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  assignments: defineTable({
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    title: v.string(),
    description: v.string(),
    instructions: v.string(),
    dueDate: v.optional(v.number()),
    maxPoints: v.number(),
    type: v.union(v.literal("essay"), v.literal("multiple_choice"), v.literal("coding"), v.literal("project")),
    questions: v.optional(
      v.array(
        v.object({
          question: v.string(),
          type: v.union(v.literal("text"), v.literal("multiple_choice"), v.literal("code")),
          options: v.optional(v.array(v.string())),
          correctAnswer: v.optional(v.string()),
          points: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_lesson", ["lessonId"]),

  submissions: defineTable({
    assignmentId: v.id("assignments"),
    userId: v.id("users"),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        answer: v.string(),
      }),
    ),
    submittedAt: v.number(),
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.id("users")),
  })
    .index("by_assignment", ["assignmentId"])
    .index("by_user", ["userId"])
    .index("by_assignment_user", ["assignmentId", "userId"]),

  discussions: defineTable({
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("question"), v.literal("discussion"), v.literal("announcement")),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user", ["userId"]),

  discussionReplies: defineTable({
    discussionId: v.id("discussions"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_discussion", ["discussionId"])
    .index("by_user", ["userId"]),

  tests: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    timeLimit: v.number(), // in minutes
    maxAttempts: v.number(),
    passingScore: v.number(), // percentage
    questions: v.array(
      v.object({
        question: v.string(),
        type: v.union(v.literal("multiple_choice"), v.literal("true_false"), v.literal("short_answer")),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        points: v.number(),
        explanation: v.optional(v.string()),
      }),
    ),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_course", ["courseId"]),

  testAttempts: defineTable({
    testId: v.id("tests"),
    userId: v.id("users"),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        answer: v.string(),
      }),
    ),
    score: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    timeSpent: v.number(), // in seconds
  })
    .index("by_test", ["testId"])
    .index("by_user", ["userId"])
    .index("by_test_user", ["testId", "userId"]),

  // Fixed calendar table with proper table name and indexes
  calendarEvents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("assignment"),
      v.literal("test"),
      v.literal("study-session"),
      v.literal("reminder"),
      v.literal("deadline"),
      v.literal("personal")
    ),
    startTime: v.number(),
    endTime: v.number(),
    relatedId: v.optional(v.string()),
    color: v.optional(v.string()),
    reminder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_start_time", ["startTime"]),

  // Legacy calendar table (keeping for backward compatibility)
  calendar: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    type: v.union(v.literal("assignment"), v.literal("test"), v.literal("class"), v.literal("personal")),
    courseId: v.optional(v.id("courses")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // Fixed achievements table with proper structure
  achievements: defineTable({
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    points: v.number(),
    requirements: v.object({
      type: v.string(),
      target: v.number(),
      metric: v.string(),
    }),
    rarity: v.union(v.literal("common"), v.literal("rare"), v.literal("epic"), v.literal("legendary")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_rarity", ["rarity"]),

  // User achievements junction table
  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
    progress: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  friends: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"]),

  pastPapers: defineTable({
    title: v.string(),
    subject: v.string(),
    year: v.number(),
    examBoard: v.string(),
    level: v.string(),
    fileUrl: v.string(),
    markingSchemeUrl: v.optional(v.string()),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_subject", ["subject"])
    .index("by_year", ["year"]),
})
