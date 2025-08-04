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
  totalXP: v.float64(), // Keep existing
  level: v.float64(), // Keep existing  
  streak: v.float64(), // Keep existing
  coursesCompleted: v.float64(), // Keep existing
  studyTime: v.float64(), // Keep existing
  // Add missing fields that your code uses:
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
    category: v.string(),
    difficulty: v.string(),
    form: v.string(),
    instructor: v.id("users"),
    imageUrl: v.optional(v.string()),
    published: v.boolean(),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    modules: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("video"), v.literal("text"), v.literal("pdf"), v.literal("quiz")),
        content: v.string(),
        duration: v.optional(v.number()),
        order: v.number(),
      }),
    ),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    learningOutcomes: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructor", ["instructor"])
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_form", ["form"])
    .index("by_published", ["published"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    progress: v.number(),
    completedModules: v.array(v.string()),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
    lastAccessedAt: v.number(),
    notes: v.optional(
      v.array(
        v.object({
          moduleId: v.string(),
          content: v.string(),
          timestamp: v.number(),
        }),
      ),
    ),
    bookmarks: v.optional(
      v.array(
        v.object({
          moduleId: v.string(),
          timestamp: v.number(),
          note: v.optional(v.string()),
        }),
      ),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  assignments: defineTable({
    title: v.string(),
    description: v.string(),
    courseId: v.optional(v.id("courses")),
    instructorId: v.id("users"),
    dueDate: v.number(),
    maxPoints: v.number(),
    instructions: v.string(),
    attachments: v.optional(v.array(v.string())),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_instructor", ["instructorId"])
    .index("by_due_date", ["dueDate"]),

  assignmentSubmissions: defineTable({
  assignmentId: v.id("assignments"),
  userId: v.id("users"), // Changed from studentId to userId
  answers: v.array(
    v.object({
      questionId: v.string(),
      answer: v.string(),
      isCorrect: v.boolean(),
      pointsEarned: v.number(),
    }),
  ),
  score: v.number(),
  totalPoints: v.number(),
  status: v.string(),
  timeSpent: v.number(),
  submittedAt: v.number(),
  // Remove these fields that don't match your mutations:
  // content: v.string(),
  // attachments: v.optional(v.array(v.string())),
  // grade: v.optional(v.number()),
  // feedback: v.optional(v.string()),
  // gradedAt: v.optional(v.number()),
  // gradedBy: v.optional(v.id("users")),
})
  .index("by_assignment", ["assignmentId"])
  .index("by_user", ["userId"]) // Changed from by_student to by_user
  .index("by_user_assignment", ["userId", "assignmentId"]),


  tests: defineTable({
  title: v.string(),
  description: v.string(),
  subject: v.string(), // Add subject field
  courseId: v.optional(v.id("courses")),
  instructorId: v.id("users"),
  questions: v.array(
    v.object({
      id: v.string(),
      question: v.string(),
      type: v.union(v.literal("multiple-choice"), v.literal("true-false"), v.literal("short-answer")),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.string(),
      points: v.number(),
    }),
  ),
  timeLimit: v.optional(v.number()),
  duration: v.number(), // Add duration field
  maxAttempts: v.optional(v.number()),
  totalQuestions: v.number(), // Add totalQuestions field
  totalPoints: v.number(), // Add totalPoints field
  passingScore: v.number(), // Add passingScore field
  difficulty: v.string(), // Add difficulty field
  type: v.string(), // Add type field
  dueDate: v.number(), // Add dueDate field
  published: v.boolean(), // Changed from isPublished to published
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_course", ["courseId"])
  .index("by_instructor", ["instructorId"])
  .index("by_subject", ["subject"]) // Add subject index
  .index("by_published", ["published"]), // Add published index


  testAttempts: defineTable({
  testId: v.id("tests"),
  userId: v.id("users"), // Changed from studentId to userId
  answers: v.array(
    v.object({
      questionId: v.string(),
      answer: v.string(),
      isCorrect: v.boolean(), // Add isCorrect field
      pointsEarned: v.number(), // Add pointsEarned field
    }),
  ),
  score: v.number(),
  totalPoints: v.number(), // Add totalPoints field
  percentage: v.number(), // Add percentage field
  status: v.string(), // Add status field
  timeSpent: v.number(), // Add timeSpent field
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_test", ["testId"])
  .index("by_user", ["userId"]) // Changed from by_student to by_user
  .index("by_user_test", ["userId", "testId"]),


  pastPapers: defineTable({
    title: v.string(),
    subject: v.string(),
    year: v.number(),
    term: v.string(),
    form: v.string(),
    fileUrl: v.string(),
    markingSchemeUrl: v.optional(v.string()),
    uploadedBy: v.id("users"),
    downloadCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subject", ["subject"])
    .index("by_year", ["year"])
    .index("by_form", ["form"])
    .index("by_uploader", ["uploadedBy"]),

  friends: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_status", ["status"]),

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

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
    progress: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  studySessions: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    duration: v.number(),
    xpEarned: v.number(),
    startedAt: v.number(),
    endedAt: v.number(),
    activities: v.array(
      v.object({
        type: v.string(),
        moduleId: v.optional(v.string()),
        duration: v.number(),
        completed: v.boolean(),
      }),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["startedAt"]),

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
    ),
    startTime: v.number(),
    endTime: v.number(),
    relatedId: v.optional(v.string()),
    color: v.optional(v.string()),
    reminder: v.optional(v.number()),
    recurring: v.optional(
      v.object({
        frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
        interval: v.number(),
        endDate: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_start_time", ["startTime"]),
})

