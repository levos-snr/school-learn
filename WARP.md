# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Masomo (school-learn) is a Kenyan educational technology platform built with a modern TypeScript stack. It's a learning management system that supports students, instructors, and administrators with course management, assignments, tests, and progress tracking.

## Architecture

This is a monorepo built with Turborepo containing:

### Frontend (`apps/web`)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: Clerk (with SSO support)
- **State Management**: React Query (@tanstack/react-query)
- **Animations**: Framer Motion

### Backend (`packages/backend`)
- **Platform**: Convex (Backend-as-a-Service)
- **Language**: TypeScript
- **Authentication**: Clerk integration via JWT
- **Real-time**: Built-in Convex reactivity

### Key User Roles & Features
- **Students**: Course enrollment, lesson viewing, assignments, tests, progress tracking
- **Instructors**: Course creation, content management, grading
- **Administrators**: User management, course approval, system oversight

## Development Commands

### Initial Setup
```bash
# Install dependencies
bun install

# Setup Convex backend (first time only)
bun dev:setup
```

### Development
```bash
# Start all services (frontend + backend)
bun dev

# Start only the web app
bun dev:web

# Start only the Convex backend
bun dev:server
```

### Code Quality & Building
```bash
# Run linting and formatting (Biome)
bun check

# Type checking across all packages
bun check-types

# Build all applications
bun build
```

### Individual Package Commands
```bash
# Target specific packages with Turbo
turbo -F web dev          # Frontend only
turbo -F @school-learn/backend dev  # Backend only
```

## Key Architecture Components

### Data Layer (Convex Schema)
The Convex backend defines a comprehensive schema with these main entities:
- **Users**: Student/instructor/admin profiles with stats, onboarding state
- **Courses**: Content structure with lessons, access restrictions, metadata
- **Lessons**: Video/PDF content, resources, progress tracking
- **Assignments/Tests**: Assessment system with submissions and grading
- **Enrollments**: Student-course relationships with progress tracking

### Frontend Structure
```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── courses/           # Course catalog and viewing
│   ├── dashboard/         # Student dashboard
│   ├── instructor/        # Instructor tools
│   ├── admin/            # Admin panels
│   └── onboarding/       # User onboarding flow
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── courses/          # Course-related components
│   ├── dashboard/        # Dashboard components
│   ├── learning/         # Learning experience components
│   ├── onboarding/       # Multi-step onboarding flow
│   └── auth/            # Authentication components
```

### State Management Pattern
- **Server State**: React Query for API calls to Convex
- **Client State**: React hooks for local UI state
- **Authentication**: Clerk provider wrapping the entire app
- **Theme**: Theme provider for dark/light mode support

### Authentication Flow
1. Clerk handles authentication (supports social auth + SSO)
2. JWT tokens passed to Convex backend
3. User roles (student/instructor/admin) determine feature access
4. Onboarding flow for new users to set up profiles

## Development Environment

### Required Environment Variables
Set these in your `.env.local` (web app) and Convex dashboard:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `CONVEX_URL` 
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`

### Code Standards
- **Formatting**: Biome with tab indentation, double quotes
- **Linting**: Biome with strict TypeScript rules
- **Commits**: Husky pre-commit hooks run `bun check`
- **Components**: shadcn/ui pattern with Tailwind utility classes

### Testing Strategy
Currently no testing framework is configured. Consider adding:
- Vitest for unit testing
- Playwright for E2E testing
- React Testing Library for component testing

### Port Configuration
- Web app runs on port 3001 (not 3000)
- Convex backend runs on Convex cloud infrastructure

## Common Development Patterns

### Adding New Convex Functions
1. Create function in `packages/backend/convex/[module].ts`
2. Export using `query`, `mutation`, or `action` from `convex/server`
3. Use in frontend with `useQuery` or `useMutation` from `convex/react`

### Adding New UI Components
1. Use shadcn/ui CLI to add base components: `npx shadcn-ui@latest add [component]`
2. Create feature-specific components in appropriate `/components/[feature]/` folder
3. Follow the established pattern of exporting from component files

### Course Content Management
The system supports multiple content types (video, PDF, text) with rich metadata and progress tracking. New content types require updates to both Convex schema and frontend viewers.
