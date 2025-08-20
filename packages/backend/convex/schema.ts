import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Users table
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("instructor"), v.literal("admin")),
    suspended: v.optional(v.boolean()), // Add this line
    onboardingCompleted: v.boolean(),
    profile: v.optional(
      v.object({
        bio: v.optional(v.string()),
        school: v.optional(v.string()),
        grade: v.optional(v.string()),
        subjects: v.optional(v.array(v.string())),
        goals: v.optional(v.array(v.string())),
        studySchedule: v.optional(v.string()),
        timeCommitment: v.optional(v.string()),
        learningStyle: v.optional(v.string()),
      }),
    ),
    stats: v.object({
      xpPoints: v.number(),
      level: v.number(),
      studyStreak: v.number(),
      coursesCompleted: v.number(),
      assignmentsCompleted: v.number(),
      testsCompleted: v.number(),
      totalStudyTime: v.number(),
      currentStreak: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Courses table
  courses: defineTable({
    title: v.string(),
    shortname: v.optional(v.string()),
    description: v.string(),
    thumbnail: v.optional(v.string()),
    instructorId: v.id("users"),
    category: v.string(),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    duration: v.string(),
    price: v.number(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    isTemplate: v.optional(v.boolean()),
    totalLessons: v.number(),
    totalDuration: v.number(),
    requirements: v.array(v.string()),
    whatYouWillLearn: v.array(v.string()),
    maxStudents: v.optional(v.number()),
    prerequisites: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    allowDiscussions: v.optional(v.boolean()),
    certificateEnabled: v.optional(v.boolean()),
    enrollmentDeadline: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    accessRestrictions: v.optional(
      v.object({
        dateRestriction: v.optional(
          v.object({
            startDate: v.number(),
            endDate: v.number(),
          }),
        ),
        gradeRestriction: v.optional(
          v.object({
            requiredGrade: v.number(),
            requiredCourse: v.id("courses"),
          }),
        ),
        groupRestriction: v.optional(
          v.object({
            allowedGroups: v.array(v.string()),
          }),
        ),
        completionRestriction: v.optional(
          v.object({
            requiredActivities: v.array(v.id("lessons")),
          }),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category"])
    .index("by_level", ["level"]),

  // Lessons table
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    duration: v.number(),
    order: v.number(),
    isPreview: v.boolean(),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          type: v.union(v.literal("pdf"), v.literal("link"), v.literal("video"), v.literal("document")),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  // Lesson Progress table
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    watchTime: v.number(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Enrollments table
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
    progress: v.number(),
    completedLessons: v.array(v.id("lessons")),
    lastAccessedAt: v.number(),
    certificateIssued: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Assignments table
  assignments: defineTable({
    title: v.string(),
    description: v.string(),
    instructions: v.string(),
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
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

  // Submissions table
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

  // Tests table
  tests: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    timeLimit: v.number(),
    maxAttempts: v.number(),
    passingScore: v.number(),
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

  // Test Attempts table
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
    timeSpent: v.number(),
  })
    .index("by_test", ["testId"])
    .index("by_user", ["userId"])
    .index("by_test_user", ["testId", "userId"]),

  // Past Papers table
  pastPapers: defineTable({
    title: v.string(),
    subject: v.string(),
    form: v.string(),
    year: v.number(),
    type: v.union(v.literal("End Term"), v.literal("Mid Term"), v.literal("KCSE"), v.literal("Mock"), v.literal("CAT")),
    term: v.optional(v.string()),
    fileUrl: v.string(),
    fileSize: v.string(),
    tags: v.optional(v.array(v.string())),
    uploaderId: v.id("users"),
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
    downloads: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subject", ["subject"])
    .index("by_form", ["form"])
    .index("by_year", ["year"])
    .index("by_type", ["type"])
    .index("by_uploader", ["uploaderId"])
    .index("by_verified", ["isVerified"]),

  // Friends table
  friends: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    requestedAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_status", ["status"]),

  // Achievements table
  achievements: defineTable({
    name: v.string(),
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

  // User Achievements table
  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
    progress: v.number(),
    isCompleted: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  // Calendar Events table
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
      v.literal("personal"),
    ),
    startDate: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    isAllDay: v.optional(v.boolean()),
    relatedId: v.optional(v.string()),
    color: v.optional(v.string()),
    reminder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_date", ["startDate"]),

  // Legacy calendar table (for backward compatibility)
  calendar: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    type: v.union(v.literal("assignment"), v.literal("test"), v.literal("class"), v.literal("personal")),
    courseId: v.optional(v.id("courses")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Discussions table
  discussions: defineTable({
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("question"), v.literal("discussion"), v.literal("announcement")), // Add this line
    isResolved: v.boolean(),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user", ["userId"]),

  // Discussion Replies table
  discussionReplies: defineTable({
    discussionId: v.id("discussions"),
    userId: v.id("users"),
    content: v.string(),
    isInstructorReply: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_discussion", ["discussionId"])
    .index("by_user", ["userId"]),

  // Course Categories table
  courseCategories: defineTable({
    name: v.string(),
    description: v.string(),
    parentId: v.optional(v.id("courseCategories")),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_parent", ["parentId"]),

  // Course Requests table
  courseRequests: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    justification: v.string(),
    requesterId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    feedback: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_status", ["status"]),
})

