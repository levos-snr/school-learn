"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  Menu,
  Users,
  X,
  Trophy,
  Archive,
  TestTube,
  Settings,
} from "lucide-react"

interface FunSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: FileText,
  },
  {
    id: "tests",
    label: "Tests",
    icon: TestTube,
  },
  {
    id: "past-papers",
    label: "Past Papers",
    icon: Archive,
  },
  {
    id: "friends",
    label: "Friends",
    icon: Users,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]

/**
 * Collapsible left sidebar with navigation and an optional footer showing a learning streak.
 *
 * Renders a fixed, full-height sidebar that switches between a compact (icons-only) and expanded (icons + labels + footer) layout.
 *
 * @param activeTab - Identifier of the currently active navigation item; used to apply active styling.
 * @param onTabChange - Callback invoked with the item's id when a navigation item is clicked.
 * @param collapsed - When true, renders the compact (collapsed) variant showing only icons.
 * @param onToggleCollapse - Callback invoked when the collapse/expand control is clicked.
 * @returns A React element representing the sidebar.
 */
export function FunSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: FunSidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
        "shadow-lg",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
             <div>
                <h1 className="font-bold text-xl text-foreground">Masomo</h1>
                <p className="text-xs text-muted-foreground">Learning Dashboard</p>
              </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hover:bg-accent">
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  collapsed && "justify-center",
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0")} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-r from-primary/10 to-fun/10 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Learning Streak</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-primary to-fun h-2 rounded-full" style={{ width: "75%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground">7 days strong! 🔥</p>
          </div>
        </div>
      )}
    </div>
  )
}
