"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Play,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

interface FunOverviewTabProps {
  onTabChange: (tab: string) => void
}

export function FunOverviewTab({ onTabChange }: FunOverviewTabProps) {
  const [studyTime, setStudyTime] = useState(0)
  const [isStudying, setIsStudying] = useState(false)
  const [studyInterval, setStudyInterval] = useState<NodeJS.Timeout | null>(null)

  const overviewStats = useQuery(api.dashboard.getOverviewStats)
  const courses = useQuery(api.dashboard.getCourses)
  const assignments = useQuery(api.dashboard.getAssignments)
  const tests = useQuery(api.dashboard.getTests)
  const friends = useQuery(api.dashboard.getFriends)
  const updateStats = useMutation(api.users.updateStats)

  // Study timer functionality
  const startStudySession = () => {
    setIsStudying(true)
    const interval = setInterval(() => {
      setStudyTime((prev) => prev + 1)
    }, 1000)
    setStudyInterval(interval)
  }

  const stopStudySession = async () => {
    setIsStudying(false)
    if (studyInterval) {
      clearInterval(studyInterval)
      setStudyInterval(null)
    }

    if (studyTime > 0) {
      // Award XP and update study time
      const minutes = Math.floor(studyTime / 60)
      if (minutes > 0) {
        await updateStats({
          xpPoints: minutes * 2, // 2 XP per minute
          totalStudyTime: minutes,
        })
      }
      setStudyTime(0)
    }
  }

  useEffect(() => {
    return () => {
      if (studyInterval) {
        clearInterval(studyInterval)
      }
    }
  }, [studyInterval])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!overviewStats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const recentCourses = courses?.slice(0, 3) || []
  const upcomingAssignments = assignments?.filter((a) => a.status === "pending").slice(0, 3) || []
  const recentTests = tests?.slice(0, 3) || []
  const onlineFriends = friends?.filter((f) => f.status === "online").slice(0, 4) || []

  return (
    <motion.div
      className="min-h-screen space-y-6 bg-background p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="mb-2 font-bold text-4xl text-foreground">Welcome back! 🎓</h1>
        <p className="text-muted-foreground text-lg">Ready to continue your learning journey?</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-600 text-sm dark:text-blue-400">Active Courses</p>
                  <p className="font-bold text-2xl text-blue-700 dark:text-blue-300">{overviewStats.totalCourses}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-600 text-sm dark:text-green-400">Avg Progress</p>
                  <p className="font-bold text-2xl text-green-700 dark:text-green-300">{overviewStats.avgProgress}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-600 text-sm dark:text-purple-400">XP Points</p>
                  <p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
                    {overviewStats.xpPoints.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-600 text-sm dark:text-orange-400">Study Streak</p>
                  <p className="font-bold text-2xl text-orange-700 dark:text-orange-300">
                    {overviewStats.studyStreak} days
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Study Timer */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-indigo-500" />
              <span>Study Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="mb-2 font-mono text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatTime(studyTime)}
                </div>
                <p className="text-muted-foreground text-sm">Current Session</p>
              </div>
              <div className="flex space-x-3">
                {!isStudying ? (
                  <Button
                    onClick={startStudySession}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Studying
                  </Button>
                ) : (
                  <Button
                    onClick={stopStudySession}
                    variant="destructive"
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    End Session
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={containerVariants}>
        {/* Continue Learning */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>Continue Learning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div
                        className={`h-12 w-12 bg-gradient-to-r ${course.bgGradient} flex items-center justify-center rounded-lg`}
                      >
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <p className="text-muted-foreground text-sm">by {course.instructor}</p>
                        <div className="mt-2">
                          <Progress value={course.progress} className="h-2" />
                          <p className="mt-1 text-muted-foreground text-xs">
                            {course.completedLessons}/{course.totalLessons} lessons • {course.progress}% complete
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onTabChange("courses")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Continue
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No courses enrolled yet</p>
                    <Button onClick={() => onTabChange("courses")} className="mt-4 bg-primary hover:bg-primary/90">
                      Browse Courses
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-orange-500" />
                <span>Upcoming Deadlines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            assignment.priority === "high"
                              ? "bg-red-500"
                              : assignment.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-foreground">{assignment.title}</h4>
                          <p className="text-muted-foreground text-sm">{assignment.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground text-sm">{assignment.dueDate}</p>
                        <Badge variant="outline" className="text-xs">
                          {assignment.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming deadlines</p>
                    <Button
                      onClick={() => onTabChange("assignments")}
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                    >
                      View Assignments
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={containerVariants}>
        {/* Recent Tests */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-green-500" />
                <span>Recent Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTests.length > 0 ? (
                  recentTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{test.title}</h4>
                          <p className="text-muted-foreground text-sm">{test.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {test.bestScore !== null ? (
                          <div>
                            <p className="font-bold text-green-600 dark:text-green-400">{test.bestScore}%</p>
                            <Badge variant="outline" className="text-xs">
                              Completed
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {test.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No tests available</p>
                    <Button onClick={() => onTabChange("tests")} className="mt-4 bg-green-500 hover:bg-green-600">
                      View Tests
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Buddies */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-pink-500" />
                <span>Study Buddies Online</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onlineFriends.length > 0 ? (
                  onlineFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-md"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center font-bold text-white">
                          {friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{friend.name}</h4>
                        <p className="text-muted-foreground text-sm">{friend.currentCourse}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-3 w-3 text-orange-500" />
                          <span className="text-orange-600 text-xs dark:text-orange-400">{friend.studyStreak}d</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No friends online</p>
                    <Button onClick={() => onTabChange("friends")} className="mt-4 bg-pink-500 hover:bg-pink-600">
                      Find Study Buddies
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Achievement Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-yellow-600 dark:text-yellow-400">
                  Level {overviewStats.level}
                </div>
                <p className="text-muted-foreground text-sm">Current Level</p>
                <div className="mt-2">
                  <Progress value={(overviewStats.xpPoints % 1000) / 10} className="h-2" />
                  <p className="mt-1 text-muted-foreground text-xs">
                    {overviewStats.xpPoints % 1000}/1000 XP to next level
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-green-600 dark:text-green-400">
                  {overviewStats.completedCourses}
                </div>
                <p className="text-muted-foreground text-sm">Courses Completed</p>
                <Badge className="mt-2 bg-green-500 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  Great Progress!
                </Badge>
              </div>

              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-blue-600 dark:text-blue-400">
                  {overviewStats.avgTestScore}%
                </div>
                <p className="text-muted-foreground text-sm">Average Test Score</p>
                <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Target className="mr-1 h-3 w-3" />
                  Keep Going!
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
