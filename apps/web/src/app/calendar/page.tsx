"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import { CalendarIcon, Clock, FileText, TestTube, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endTime: "",
    isAllDay: false,
    location: "",
    reminder: true,
  })

  // Get events for current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const events = useQuery(api.calendar.getUserEvents, {
    startDate: startOfMonth.getTime(),
    endDate: endOfMonth.getTime(),
  })

  const upcomingDeadlines = useQuery(api.calendar.getUpcomingDeadlines, { days: 14 })
  const createPersonalEvent = useMutation(api.calendar.createPersonalEvent)

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.startDate) {
      toast.error("Please fill in required fields")
      return
    }

    try {
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || "09:00"}`)
      const endDateTime = eventForm.endTime ? new Date(`${eventForm.startDate}T${eventForm.endTime}`) : undefined

      await createPersonalEvent({
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDateTime.getTime(),
        endDate: endDateTime?.getTime(),
        isAllDay: eventForm.isAllDay,
        location: eventForm.location || undefined,
        reminder: eventForm.reminder ? { enabled: true, minutes: 60 } : undefined,
      })

      toast.success("Event created successfully!")
      setShowEventDialog(false)
      setEventForm({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endTime: "",
        isAllDay: false,
        location: "",
        reminder: true,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create event")
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "assignment_due":
        return <FileText className="h-4 w-4" />
      case "test_due":
        return <TestTube className="h-4 w-4" />
      case "study_group":
        return <Users className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "assignment_due":
        return "bg-orange-500"
      case "test_due":
        return "bg-red-500"
      case "study_group":
        return "bg-blue-500"
      case "personal":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    if (!events) return []

    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString([], { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Calendar
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Stay organized with your schedule, deadlines, and events
              </p>
            </div>
          </FadeIn>

          {/* Quick Stats */}
          <SlideIn direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">{events?.length || 0}</div>
                    <div className="text-sm font-medium">This Month</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{upcomingDeadlines?.length || 0}</div>
                    <div className="text-sm font-medium">Upcoming</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {events?.filter((e) => e.status === "completed").length || 0}
                    </div>
                    <div className="text-sm font-medium">Completed</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {events?.filter((e) => new Date(e.startDate).toDateString() === new Date().toDateString())
                        .length || 0}
                    </div>
                    <div className="text-sm font-medium">Today</div>
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
          <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Calendar Coming Soon!</h2>
          <p className="text-muted-foreground">
            We're building a comprehensive calendar system to help you manage your study schedule.
          </p>
        </div>
      </div>
    </div>
  )
}

