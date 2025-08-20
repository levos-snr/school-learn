# 📚 Masomo Course Management - Key Files & Paths Guide

Based on comprehensive analysis of your Masomo (school-learn) learning management system, here are the **key files and paths** you should focus on for course creation and management, plus discussions, tests, courses, and past papers:

## 🎯 **Backend Files (Convex Functions)**

### Core Course Management
- **`packages/backend/convex/schema.ts`** - Database schema defining all tables
- **`packages/backend/convex/courses.ts`** - Main course CRUD operations
- **`packages/backend/convex/courseManagement.ts`** - Advanced course management features

### Feature-Specific Backend Files
- **`packages/backend/convex/discussions.ts`** - Course discussions & forums
- **`packages/backend/convex/assignments.ts`** - Assignment creation & grading  
- **`packages/backend/convex/tests.ts`** - Test/quiz system
- **`packages/backend/convex/pastPapers.ts`** - Past papers upload & management
- **`packages/backend/convex/lessons.ts`** - Lesson content management
- **`packages/backend/convex/learning.ts`** - Learning progress tracking

## 🖥️ **Frontend Pages (Next.js App Router)**

### Core Course Pages
- **`apps/web/src/app/courses/page.tsx`** - Course catalog/listing
- **`apps/web/src/app/courses/[courseId]/page.tsx`** - Course detail view
- **`apps/web/src/app/courses/[courseId]/lessons/[lessonId]/page.tsx`** - Lesson viewer

### Management Interfaces
- **`apps/web/src/app/instructor/courses/page.tsx`** - Instructor course dashboard
- **`apps/web/src/app/admin/courses/page.tsx`** - Admin course management
- **`apps/web/src/app/admin/course-requests/page.tsx`** - Course request approval
- **`apps/web/src/app/course-requests/page.tsx`** - Student course requests

## 🧩 **Frontend Components**

### Course Management Components
- **`apps/web/src/components/courses/course-creation-wizard.tsx`** - Create new courses
- **`apps/web/src/components/courses/course-management-dashboard.tsx`** - Course overview
- **`apps/web/src/components/courses/bulk-course-upload.tsx`** - Bulk course import
- **`apps/web/src/components/courses/course-request-system.tsx`** - Request new courses

### Feature Components
- **`apps/web/src/components/courses/discussion-panel.tsx`** - Course discussions
- **`apps/web/src/components/courses/assignment-panel.tsx`** - Assignment management
- **`apps/web/src/components/dashboard/tests-tab.tsx`** - Test/quiz interface
- **`apps/web/src/components/dashboard/past-papers-tab.tsx`** - Past papers browser

### Admin Components
- **`apps/web/src/components/admin/courses-management-tab.tsx`** - Admin course tools
- **`apps/web/src/components/admin/admin-layout.tsx`** - Admin panel layout

## 📊 **Key Database Tables (Schema)**

Your system already has comprehensive tables for:
- **`courses`** - Course metadata, instructor, categories, restrictions
- **`lessons`** - Video/PDF content, resources, ordering
- **`discussions`** - Forum posts, questions, announcements
- **`discussionReplies`** - Threaded discussion responses
- **`assignments`** - Essay, multiple choice, coding, project assignments
- **`submissions`** - Student assignment submissions & grading
- **`tests`** - Timed tests with multiple question types
- **`testAttempts`** - Student test attempts & scores
- **`pastPapers`** - KCSE, Mock, CAT papers with verification
- **`enrollments`** - Student-course relationships & progress
- **`courseCategories`** - Hierarchical course organization
- **`courseRequests`** - Student requests for new courses

## 🚀 **Development Workflow**

1. **Start with schema changes** in `packages/backend/convex/schema.ts`
2. **Create/modify backend functions** in respective Convex files
3. **Build UI components** in `apps/web/src/components/`
4. **Create pages** in `apps/web/src/app/` using App Router
5. **Test with**: `bun dev` (starts both frontend and backend)

## 💡 **Key Features Already Implemented**

✅ **Course Management**: Templates, bulk upload, categories, restrictions  
✅ **Discussions**: Threaded forums with instructor replies  
✅ **Assignments**: Multiple types with auto-grading  
✅ **Tests**: Timed quizzes with multiple attempts  
✅ **Past Papers**: Upload, verification, download tracking  
✅ **Progress Tracking**: Lesson completion, course analytics  
✅ **User Roles**: Student, Instructor, Admin permissions  
✅ **Course Requests**: Student-initiated course creation  

## 🔧 **Key Functions Available**

### Course Management Functions
```typescript
// From courseManagement.ts
- getCourseTemplates() - Get course templates
- createCourseFromTemplate() - Create course from template
- bulkCreateCourses() - Bulk course creation
- resetCourse() - Reset course data
- createCourseCategory() - Create course categories
- setCourseRestrictions() - Set access restrictions
- getCourseAnalytics() - Course performance metrics
```

### Past Papers Functions
```typescript
// From pastPapers.ts
- list() - List all verified past papers
- uploadPastPaper() - Upload new past paper
- downloadPastPaper() - Download with tracking
- verifyPastPaper() - Admin verification
- getSubjects() - Get subjects with counts
- getPopularPapers() - Most downloaded papers
```

### Discussion Functions
```typescript
// From discussions.ts (implied structure)
- createDiscussion() - Start new discussion
- replyToDiscussion() - Add reply to thread
- pinDiscussion() - Pin important discussions
- resolveDiscussion() - Mark as resolved
```

## 📝 **Next Steps for Development**

1. **Review existing schema** to understand data relationships
2. **Check current backend functions** for available operations
3. **Examine frontend components** for UI patterns
4. **Test existing features** to understand current functionality
5. **Identify gaps** between requirements and current implementation
6. **Plan incremental improvements** following existing patterns

## 🎯 **Architecture Notes**

- **Convex Backend**: Real-time database with TypeScript functions
- **Next.js 15**: App Router with server components
- **TailwindCSS + shadcn/ui**: Consistent design system
- **Clerk Auth**: Authentication with role-based access
- **React Query**: Server state management
- **Monorepo Structure**: Turborepo for organized development

Your architecture is already well-structured for a comprehensive educational platform! Focus on these files to extend and customize the course management system according to your specific needs.
