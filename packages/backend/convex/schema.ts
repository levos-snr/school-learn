import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
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
    stats: v.optional(
      v.object({
        xpPoints: v.number(),
        level: v.number(),
        studyStreak: v.number(),
        coursesCompleted: v.number(),
        assignmentsCompleted: v.number(),
        testsCompleted: v.number(),
        totalStudyTime: v.number(),
      }),
    ),
    settings: v.optional(
      v.object({
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
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    instructor: v.string(),
    category: v.string(),
    subject: v.string(),
    form: v.string(),
    difficulty: v.string(),
    duration: v.string(),
    totalLessons: v.number(),
    rating: v.number(),
    students: v.number(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    syllabus: v.array(
      v.object({
        title: v.string(),
        lessons: v.array(
          v.object({
            title: v.string(),
            duration: v.string(),
            type: v.string(),
          }),
        ),
      }),
    ),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_subject", ["subject"])
    .index("by_form", ["form"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    progress: v.number(),
    completedLessons: v.number(),
    lastAccessedAt: v.number(),
    enrolledAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  assignments: defineTable({
    title: v.string(),
    description: v.string(),
    courseId: v.id("courses"),
    subject: v.string(),
    form: v.string(),
    type: v.string(),
    difficulty: v.string(),
    totalQuestions: v.number(),
    estimatedTime: v.string(),
    dueDate: v.number(),
    instructions: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        type: v.string(),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        explanation: v.optional(v.string()),
        points: v.number(),
      }),
    ),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_subject", ["subject"])
    .index("by_due_date", ["dueDate"]),

  assignmentSubmissions: defineTable({
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
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
  })
    .index("by_user", ["userId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_user_assignment", ["userId", "assignmentId"]),

  tests: defineTable({
    title: v.string(),
    description: v.string(),
    courseId: v.optional(v.id("courses")),
    subject: v.string(),
    form: v.string(),
    type: v.string(),
    difficulty: v.string(),
    duration: v.number(),
    totalQuestions: v.number(),
    passingScore: v.number(),
    dueDate: v.number(),
    instructions: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        type: v.string(),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        explanation: v.optional(v.string()),
        points: v.number(),
      }),
    ),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_subject", ["subject"])
    .index("by_due_date", ["dueDate"]),

  testAttempts: defineTable({
    userId: v.id("users"),
    testId: v.id("tests"),
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
    percentage: v.number(),
    timeSpent: v.number(),
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_test", ["testId"])
    .index("by_user_test", ["userId", "testId"]),

  pastPapers: defineTable({
    title: v.string(),
    subject: v.string(),
    form: v.string(),
    year: v.number(),
    term: v.optional(v.string()),
    type: v.string(),
    fileUrl: v.string(),
    fileSize: v.string(),
    downloads: v.number(),
    uploadedBy: v.id("users"),
    uploadDate: v.string(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subject", ["subject"])
    .index("by_form", ["form"])
    .index("by_year", ["year"])
    .index("by_type", ["type"]),

  friends: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.string(),
    requestedAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_status", ["status"]),

  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    rarity: v.string(),
    points: v.number(),
    iconUrl: v.optional(v.string()),
    requirement: v.object({
      type: v.string(),
      value: v.number(),
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    progress: v.number(),
    isCompleted: v.boolean(),
    unlockedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  studySessions: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    subject: v.string(),
    duration: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["startTime"]),
})

