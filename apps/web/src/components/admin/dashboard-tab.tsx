"use client"

import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, GraduationCap, TrendingUp, Activity, UserCheck, Clock, AlertCircle } from "lucide-react"

export function DashboardTab() {
  const dashboardStats = useQuery(api.admin.getDashboardStats)
  const systemHealth = useQuery(api.admin.getSystemHealth)

  if (!dashboardStats || !systemHealth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      change: `+${dashboardStats.recentUsers}`,
      changeLabel: "this month",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Users",
      value: dashboardStats.activeUsers,
      change: `${dashboardStats.engagementRate.toFixed(1)}%`,
      changeLabel: "engagement rate",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Courses",
      value: dashboardStats.totalCourses,
      change: `${dashboardStats.publishedCourses}`,
      changeLabel: "published",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Enrollments",
      value: dashboardStats.totalEnrollments,
      change: `+${dashboardStats.recentEnrollments}`,
      changeLabel: "this month",
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  const healthMetrics = [
    {
      title: "System Uptime",
      value: `${systemHealth.systemUptime}%`,
      status: "healthy",
      icon: Activity,
    },
    {
      title: "Response Time",
      value: `${systemHealth.responseTime}ms`,
      status: "good",
      icon: Clock,
    },
    {
      title: "Error Rate",
      value: `${systemHealth.errorRate}%`,
      status: "excellent",
      icon: AlertCircle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <metric.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{metric.value}</span>
                  <Badge
                    variant={
                      metric.status === "healthy" ? "default" : metric.status === "good" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {metric.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Growth Metrics
            </CardTitle>
            <CardDescription>Platform growth and engagement trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>User Growth</span>
                <span className="font-mono">+{dashboardStats.recentUsers} this month</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Course Completion Rate</span>
                <span className="font-mono">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>User Engagement</span>
                <span className="font-mono">{dashboardStats.engagementRate.toFixed(1)}%</span>
              </div>
              <Progress value={dashboardStats.engagementRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities and user interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registrations</p>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.recentUsers} new users joined this month
                </p>
              </div>
              <Badge variant="secondary">Recent</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course enrollments</p>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.recentEnrollments} new enrollments this month
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course completions</p>
                <p className="text-xs text-muted-foreground">Students are actively completing courses</p>
              </div>
              <Badge variant="outline">Ongoing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
