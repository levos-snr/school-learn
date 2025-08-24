# AGENTS.md - School Learn Project

This file contains essential information for agentic coding assistants working in this repository.

## Build/Lint/Test Commands

### Root Level Commands (run from project root)
- **Development**: `bun dev` - Start all applications in development mode
- **Build**: `bun build` - Build all applications with Turborepo
- **Type Check**: `bun check-types` - Check TypeScript types across all apps
- **Lint & Format**: `bun check` - Run Biome formatting and linting
- **Setup**: `bun dev:setup` - Setup and configure Convex project

### Web App Commands (run from `apps/web/`)
- **Development**: `bun dev:web` - Start only the web application (Next.js on port 3001)
- **Build**: `bun build` - Build the Next.js application
- **Lint**: `bun lint` - Run Next.js ESLint
- **Start**: `bun start` - Start production server

### Backend Commands (run from `packages/backend/`)
- **Development**: `bun dev:server` - Start Convex development server
- **Setup**: `bun dev:setup` - Configure Convex project

### Testing
- **Integration Tests**: Visit `/test` in the web app for the LMS Integration Test Suite
- **Type Validation**: `bun check-types` to verify TypeScript compilation
- **Code Quality**: `bun check` for linting and formatting validation
- **No traditional unit tests** - focus on integration testing through the UI

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2017, **Module Resolution**: bundler, **Strict Mode**: Enabled
- **JSX**: preserve, **Path Aliases**: `@/*` maps to `./src/*`
- **Incremental builds**: Enabled for faster compilation

### Formatting (Biome)
- **Indentation**: Tabs (not spaces)
- **Quote Style**: Double quotes for JavaScript/TypeScript
- **Import Organization**: Enabled (organizeImports: on)
- **Line Endings**: Auto-detected

### Linting Rules (Biome)
- **Recommended Rules**: Enabled
- **React**: React-specific rules enabled
- **Accessibility**: Most a11y rules enabled (some disabled for flexibility)
- **Style Rules**: `useAsConstAssertion`, `useDefaultParameterLast`, `useEnumInitializers`, `useSelfClosingElements`, `useSingleVarDeclarator`, `noInferrableTypes`, `noUselessElse` set to error
- **Custom Rules**: `useSortedClasses` for clsx/cva functions, `noExplicitAny` disabled

### Import Conventions
- Use path aliases: `@/components`, `@/lib/utils`, `@/hooks`
- Group: React → external libraries → internal imports
- Use named imports for tree-shaking
- Import types explicitly: `import type { User } from '@/types'`

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`, `DashboardCard`)
- **Functions**: camelCase (e.g., `getUserData`, `handleSubmit`)
- **Variables**: camelCase (e.g., `userData`, `isLoading`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`, `ComponentProps`)
- **Files**: kebab-case for components (e.g., `user-profile.tsx`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### React/TypeScript Best Practices
- Functional components with hooks (React 19 patterns)
- Type all props with interfaces
- Use `React.ComponentProps` for extending component props
- Implement proper error boundaries
- Use `useCallback` and `useMemo` for performance optimization
- Follow concurrent features patterns

### UI/Design System
- **Framework**: shadcn/ui with "new-york" style
- **CSS**: Tailwind CSS with CSS variables
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Component Variants**: `class-variance-authority` (cva) for variant management

### Backend (Convex)
- Use Convex functions for server-side logic
- Follow Convex schema definitions for data modeling
- Implement proper authentication with Clerk
- Use Convex queries and mutations for data operations

### Security & Best Practices
- Never expose secrets or API keys in client code
- Use environment variables for configuration
- Implement proper error handling and user feedback
- Follow Next.js security best practices
- Use TypeScript strict mode for type safety

### Git Workflow
- Pre-commit hooks enabled with Husky
- Automatic linting and formatting on commit via lint-staged
- Use conventional commit messages
- Follow monorepo structure with Turborepo

### Development Workflow
1. Run `bun dev:setup` for initial Convex setup
2. Use `bun dev` for development
3. Run `bun check` before committing
4. Use `bun check-types` to verify TypeScript
5. Test builds with `bun build`
6. Use `/test` route for integration testing

Remember to always run `bun check` and `bun check-types` before making changes to ensure code quality and type safety.