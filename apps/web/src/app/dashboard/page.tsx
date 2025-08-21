"use client"

import { useUser } from "@clerk/nextjs"
import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AssignmentsTab } from "@/components/dashboard/assignments-tab"
import { CoursesTab } from "@/components/dashboard/courses-tab"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { FunOverviewTab } from "@/components/dashboard/fun-overview-tab"
import { FunSidebar } from "@/components/dashboard/fun-sidebar"
import { PastPapersTab } from "@/components/dashboard/past-papers-tab"
import { AchievementsTab } from "@/components/dashboard/achievements-tab"
import { CalendarTab } from "@/components/dashboard/calendar-tab"
import { TestsTab } from "@/components/dashboard/tests-tab"
import { SettingsTab } from "@/components/dashboard/settings-tab"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Get active tab from URL params or default to overview
  const activeTab = searchParams.get("tab") || "overview"

  const currentUser = useQuery(api.users.current)
  const storeUser = useMutation(api.users.store)

  // Debug logging
  useEffect(() => {
    console.log("Dashboard State:", {
      isLoaded,
      hasUser: !!user,
      currentUser: currentUser,
      isCreatingUser,
      activeTab,
    })
  }, [isLoaded, user, currentUser, isCreatingUser, activeTab])

  // Handle authentication and user setup
  useEffect(() => {
    const handleUserSetup = async () => {
      // If not loaded or no user, redirect to sign in
      if (isLoaded && !user) {
        console.log("No user found, redirecting to sign-in")
        router.push("/sign-in")
        return
      }

      // If user exists in Clerk but not in Convex, create them
      if (isLoaded && user && currentUser === null && !isCreatingUser) {
        console.log("User exists in Clerk but not in Convex, creating user...")
        setIsCreatingUser(true)
        try {
          await storeUser()
          console.log("User created successfully")
        } catch (error) {
          console.error("Failed to create user:", error)
        } finally {
          setIsCreatingUser(false)
        }
      }

      // If user exists but hasn't completed onboarding, redirect to onboarding
      if (isLoaded && user && currentUser && !currentUser.onboardingCompleted) {
        console.log("User hasn't completed onboarding, redirecting...")
        router.push("/onboarding")
        return
      }
    }

    handleUserSetup()
  }, [isLoaded, user, currentUser, router, storeUser, isCreatingUser])

  const setActiveTab = (tab: string) => {
    // Update URL with the new tab
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "overview") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : "/dashboard"
    router.push(newUrl)
  }

  // Show loading while checking authentication and user status
  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading while currentUser is undefined or null (still loading from Convex)
  if (currentUser === undefined || currentUser === null || isCreatingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">
            {isCreatingUser ? "Setting up your account..." : "Loading your dashboard..."}
          </p>
        </div>
      </div>
    )
  }

  // If user hasn't completed onboarding, show loading (redirect should happen in useEffect)
  if (!currentUser.onboardingCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Setting up your learning experience...</p>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <FunOverviewTab onTabChange={setActiveTab} />
      case "courses":
        return <CoursesTab />
      case "assignments":
        return <AssignmentsTab />
      case "tests":
        return <TestsTab />
      case "past-papers":
        return <PastPapersTab />
      case "friends":
        return <FriendsTab />
      case "achievements":
        return <AchievementsTab />
      case "calendar":
        return <CalendarTab />
      case "settings":
        return <SettingsTab />
      default:
        return <FunOverviewTab onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex">
        {/* Sidebar - Fixed/Sticky positioning */}
        <div className="fixed left-0 top-0 z-40 h-screen">
          <FunSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main Content - With left margin to account for sidebar */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"}`}>
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
            <DashboardHeader user={currentUser} />
          </div>

          {/* Tab Content */}
          <main className="p-6">{renderActiveTab()}</main>
        </div>
      </div>
    </div>
  )
}
