"use client"

import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import { Trophy, Star, Crown, Zap, BookOpen, Users, Target, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AchievementsPage() {
  const userAchievements = useQuery(api.achievements.getUserAchievements)
  const allAchievements = useQuery(api.achievements.getAllAchievements)

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

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Award className="h-5 w-5" />
      case "rare":
        return <Star className="h-5 w-5" />
      case "epic":
        return <Crown className="h-5 w-5" />
      case "legendary":
        return <Trophy className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "learning":
        return <BookOpen className="h-5 w-5" />
      case "social":
        return <Users className="h-5 w-5" />
      case "streak":
        return <Zap className="h-5 w-5" />
      case "mastery":
        return <Target className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  const completedAchievements = userAchievements?.filter((ua) => ua.isCompleted) || []
  const inProgressAchievements = userAchievements?.filter((ua) => !ua.isCompleted && ua.progress > 0) || []
  const totalPoints = completedAchievements.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                My Achievements
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track your learning milestones and unlock rewards
              </p>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <SlideIn direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{completedAchievements.length}</div>
                    <div className="text-sm font-medium">Earned</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
                    <div className="text-sm font-medium">In Progress</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                    <div className="text-sm font-medium">Total Points</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Crown className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {completedAchievements.filter((ua) => ua.achievement?.rarity === "legendary").length}
                    </div>
                    <div className="text-sm font-medium">Legendary</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SlideIn>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Achievements Coming Soon!</h2>
          <p className="text-muted-foreground">
            We're working on an amazing achievement system to track your learning progress.
          </p>
        </div>
      </div>
    </div>
  )
}

