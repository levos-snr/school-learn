"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useQuery, useMutation } from "convex/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Bell, Shield, Palette, Globe } from "lucide-react"

export function SettingsTab() {
  const currentUser = useQuery(api.users.current)
  const updateProfile = useMutation(api.users.updateUserProfile)
  const updateSettings = useMutation(api.users.updateUserSettings)

  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    grade: "",
    school: "",
  })

  const [settingsData, setSettingsData] = useState({
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

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        bio: currentUser.profile?.bio || "",
        grade: currentUser.profile?.grade || "",
        school: currentUser.profile?.school || "",
      })

      if (currentUser.settings) {
        setSettingsData(currentUser.settings)
      }
    }
  }, [currentUser])

  if (currentUser === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const handleProfileUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateProfile({
        name: profileData.name,
        profile: {
          bio: profileData.bio,
          grade: profileData.grade,
          school: profileData.school,
        },
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateSettings({ settings: settingsData })
      toast.success("Settings updated successfully!")
    } catch (error) {
      toast.error("Failed to update settings")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Class</Label>
                  <Select
                    value={profileData.grade}
                    onValueChange={(value) => setProfileData((prev) => ({ ...prev, grade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form-1">Form 1</SelectItem>
                      <SelectItem value="form-2">Form 2</SelectItem>
                      <SelectItem value="form-3">Form 3</SelectItem>
                      <SelectItem value="form-4">Form 4</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/Institution</Label>
                <Input
                  id="school"
                  value={profileData.school}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, school: e.target.value }))}
                  placeholder="Enter your school name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settingsData.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settingsData.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="assignment-notifications">Assignment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming assignments</p>
                </div>
                <Switch
                  id="assignment-notifications"
                  checked={settingsData.notifications.assignments}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, assignments: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadline-notifications">Deadline Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get alerted about approaching deadlines</p>
                </div>
                <Switch
                  id="deadline-notifications"
                  checked={settingsData.notifications.deadlines}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, deadlines: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you unlock achievements</p>
                </div>
                <Switch
                  id="achievement-notifications"
                  checked={settingsData.notifications.achievements}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, achievements: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="social-notifications">Social Notifications</Label>
                  <p className="text-sm text-muted-foreground">Friend requests and social activity</p>
                </div>
                <Switch
                  id="social-notifications"
                  checked={settingsData.notifications.social}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, social: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy
              </CardTitle>
              <CardDescription>Control who can see your information and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-visible">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={settingsData.privacy.profileVisible}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisible: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="progress-visible">Show Learning Progress</Label>
                  <p className="text-sm text-muted-foreground">Let others see your learning progress</p>
                </div>
                <Switch
                  id="progress-visible"
                  checked={settingsData.privacy.progressVisible}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, progressVisible: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="friends-visible">Show Friends List</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your friends</p>
                </div>
                <Switch
                  id="friends-visible"
                  checked={settingsData.privacy.friendsVisible}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, friendsVisible: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settingsData.theme}
                  onValueChange={(value) => setSettingsData((prev) => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settingsData.language}
                  onValueChange={(value) => setSettingsData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settingsData.timezone}
                  onValueChange={(value) => setSettingsData((prev) => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Africa/Nairobi">East Africa Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="text-sm font-medium">{currentUser.stats?.xpPoints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="text-sm font-medium">{currentUser.stats?.level || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Courses Completed</span>
                <span className="text-sm font-medium">{currentUser.stats?.coursesCompleted || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSettingsUpdate} disabled={isUpdating} className="w-full">
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
