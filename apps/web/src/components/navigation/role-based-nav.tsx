"use client"

import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, Users, Shield, GraduationCap, Settings, BarChart3, ChevronDown, Plus } from "lucide-react"

/**
 * Role-aware horizontal navigation bar with quick actions, dashboards, and settings.
 *
 * Renders an action bar that adapts to the current user's role:
 * - Returns null while the current user is not yet available.
 * - If the user is an instructor (or admin) shows a "Create" menu with:
 *   - "New Course" -> /instructor/create-course
 *   - "Add Lesson" -> /instructor?tab=lessons
 * - Always shows a "Dashboards" menu with:
 *   - "Student Dashboard" -> /dashboard
 *   - "Instructor Dashboard" -> /instructor (shown for instructors/admins) with a role badge
 *   - "Admin Panel" -> /admin (shown for admins) with a destructive "Admin" badge
 * - Provides a settings icon button that navigates to /dashboard?tab=settings
 *
 * Navigation is performed client-side when menu items or the settings button are clicked.
 *
 * @returns A JSX element containing the role-based navigation bar, or `null` if the current user is not loaded.
 */
export function RoleBasedNav() {
  const user = useQuery(api.users.current)
  const isAdmin = useQuery(api.users.isAdmin)
  const router = useRouter()

  if (!user) return null

  const isInstructor = user.role === "instructor" || user.role === "admin"

  return (
    <div className="flex items-center gap-4">
      {/* Quick Actions based on role */}
      {isInstructor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Create
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Create Content</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/instructor/create-course")}>
              <BookOpen className="mr-2 h-4 w-4" />
              New Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/instructor?tab=lessons")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Add Lesson
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Role-based dashboard access */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboards
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Access Dashboards</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <Users className="mr-2 h-4 w-4" />
            Student Dashboard
          </DropdownMenuItem>

          {isInstructor && (
            <DropdownMenuItem onClick={() => router.push("/instructor")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Instructor Dashboard
              <Badge variant="secondary" className="ml-auto">
                {user.role === "instructor" ? "Instructor" : "Admin"}
              </Badge>
            </DropdownMenuItem>
          )}

          {isAdmin && (
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
              <Badge variant="destructive" className="ml-auto">
                Admin
              </Badge>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings */}
      <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard?tab=settings")}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
