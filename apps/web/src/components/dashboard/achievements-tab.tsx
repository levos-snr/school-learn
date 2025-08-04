"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Users, BookOpen, Calendar } from "lucide-react"

export function AchievementsTab() {
  const userAchievements = useQuery(api.achievements.getUserAchievements)
  const availableAchievements = useQuery(api.achievements.getAvailableAchievements)

  if (userAchievements === undefined || availableAchievements === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Achievements</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const completedAchievements = userAchievements?.filter((a) => a.isCompleted) || []
  const inProgressAchievements = userAchievements?.filter((a) => !a.isCompleted && a.progress > 0) || []
  const lockedAchievements =
    availableAchievements?.filter((a) => !userAchievements?.some((ua) => ua.achievementId === a._id)) || []

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "learning":
        return BookOpen
      case "social":
        return Users
      case "streak":
        return Calendar
      case "completion":
        return Target
      default:
        return Trophy
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Track your learning milestones and unlock rewards</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{completedAchievements.length}</div>
          <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{completedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{inProgressAchievements.length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {completedAchievements.reduce((sum, a) => sum + (a.achievement?.points || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{lockedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement
              if (!achievement) return null

              const Icon = getCategoryIcon(achievement.category)

              return (
                <Card key={userAchievement._id} className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="w-6 h-6 text-green-600" />
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>{achievement.rarity}</Badge>
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">Completed!</span>
                      <span className="text-sm text-muted-foreground">+{achievement.points} XP</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement
              if (!achievement) return null

              const Icon = getCategoryIcon(achievement.category)
              const progressPercentage = (userAchievement.progress / achievement.requirements.target) * 100 {/* was achievement.requirement.value */}


              return (
                <Card key={userAchievement._id} className="border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>{achievement.rarity}</Badge>
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>
  {userAchievement.progress}/{achievement.requirements.target} {/* was achievement.requirement.value */}
</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">{achievement.points} XP when completed</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => {
              const Icon = getCategoryIcon(achievement.category)

              return (
                <Card key={achievement._id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="w-6 h-6 text-gray-400" />
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>{achievement.rarity}</Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-600">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Requirement: {achievement.requirement.value} {achievement.requirement.type.replace("_", " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
  Requirement: {achievement.requirements.target} {achievement.requirements.type.replace("_", " ")} {/* was achievement.requirement.value and achievement.requirement.type */}
</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

