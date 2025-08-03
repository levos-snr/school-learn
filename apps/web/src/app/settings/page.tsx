"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { User } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const user = useQuery(api.users.getCurrentUser)
  const updateProfile = useMutation(api.users.updateUserProfile)
  const updateSettings = useMutation(api.users.updateUserSettings)

  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    grade: "",
    school: "",
  })

  const [settingsForm, setSettingsForm] = useState({
    notifications: {
      email: true,
      push: true,
      assignments: true,
      deadlines: true,
      achievements: true,
      social: true,
    },
    privacy: {
      profileVisible: true,
      progressVisible: true,
      friendsVisible: true,
    },
    theme: "system",
    language: "en",
    timezone: "UTC",
  })

  // Initialize forms when user data loads
  useState(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        bio: user.profile?.bio || "",
        grade: user.profile?.grade || "",
        school: user.profile?.school || "",
      })

      if (user.settings) {
        setSettingsForm({
          notifications: user.settings.notifications,
          privacy: user.settings.privacy,
          theme: user.settings.theme,
          language: user.settings.language,
          timezone: user.settings.timezone,
        })
      }
    }
  })

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: profileForm.name,
        profile: {
          bio: profileForm.bio,
          grade: profileForm.grade,
          school: profileForm.school,
          avatar: user?.profile?.avatar,
        },
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    }
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings({ settings: settingsForm })
      toast.success("Settings updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Customize your learning experience and manage your account
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Settings Coming Soon!</h2>
          <p className="text-muted-foreground">
            We're working on comprehensive settings to personalize your learning experience.
          </p>
        </div>
      </div>
    </div>
  )
}

