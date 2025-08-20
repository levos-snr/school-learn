"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// <CHANGE> Added ArrowLeft import for back button
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { ComprehensiveCourseCreator } from "../admin/comprehensive-course-creator"
import { DraftCourseEditor } from "./draft-course-editor"
// <CHANGE> Added useRouter import for navigation
import { useRouter } from "next/navigation"

export function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCourseCreator, setShowCourseCreator] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  // <CHANGE> Added router for navigation
  const router = useRouter()

  const user = useQuery(api.users.current)
  const myCourses = useQuery(api.courses.getCoursesByInstructor, user ? { instructorId: user._id } : "skip")

  if (user === undefined || myCourses === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (user?.role !== "instructor" && user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You need instructor privileges to access this page.</p>
      </div>
    )
  }

  const publishedCourses = myCourses?.filter((course) => course.isPublished) || []
  const draft

