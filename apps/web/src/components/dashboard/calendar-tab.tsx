"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, FileText, TestTube, User } from "lucide-react"

/**
 * CalendarTab — a client React component that displays an interactive month calendar, an upcoming-7-day events list, and today's events.
 *
 * Renders a calendar grid for the selected month with per-day event badges, allows selecting a day (updates internal `selectedDate` state), and shows two side panels: upcoming events (next 7 days) and today's events. While month or upcoming data is loading it renders a skeleton placeholder UI. Event icons, colors, and date/time labels are derived from each event's `type`, `startDate`, `startTime`, and `endTime`.
 *
 * @returns JSX.Element The rendered calendar UI.
 */
export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const events = useQuery(api.calendar.getUserEvents, {
    startDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getTime(),
    endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getTime(),
  })
  const upcomingEvents = useQuery(api.calendar.getUpcomingEvents, { days: 7 })

  if (events === undefined || upcomingEvents === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-96 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return FileText
      case "test":
        return TestTube
      case "personal":
        return User
      default:
        return Calendar
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "bg-blue-500"
      case "test":
        return "bg-red-500"
      case "deadline":
        return "bg-orange-500"
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

  const isToday = (timestamp: number) => {
    const today = new Date()
    const eventDate = new Date(timestamp)
    return today.toDateString() === eventDate.toDateString()
  }

  const isTomorrow = (timestamp: number) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const eventDate = new Date(timestamp)
    return tomorrow.toDateString() === eventDate.toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Keep track of your assignments, tests, and important dates</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {selectedDate.toLocaleDateString([], { month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 6)
                  const dayEvents =
                    events?.filter((event) => {
                      const eventDate = new Date(event.startDate)
                      return eventDate.toDateString() === date.toDateString()
                    }) || []

                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                  const isSelected = date.toDateString() === selectedDate.toDateString()

                  return (
                    <div
                      key={i}
                      className={`
                        min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                        ${isCurrentMonth ? "bg-background" : "bg-muted/50 text-muted-foreground"}
                        ${isSelected ? "ring-2 ring-primary" : ""}
                        hover:bg-accent
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event._id}
                            className={`text-xs p-1 rounded text-white truncate ${getEventColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming events</p>
              ) : (
                upcomingEvents?.map((event) => {
                  const Icon = getEventIcon(event.type)

                  return (
                    <div key={event._id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{event.title}</div>
                        {event.description && (
  <div className="text-sm text-muted-foreground truncate">{event.description}</div>
)}
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {isToday(event.startDate)
                              ? "Today"
                              : isTomorrow(event.startDate)
                                ? "Tomorrow"
                                : formatDate(event.startDate)}
                            {event.endTime !== event.startTime && ` at ${formatTime(event.startTime)}`}

                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events?.filter((event) => isToday(event.startDate)).length === 0 ? (
                <p className="text-muted-foreground text-sm">No events today</p>
              ) : (
                <div className="space-y-3">
                  {events
                    ?.filter((event) => isToday(event.startDate))
                    .map((event) => {
                      const Icon = getEventIcon(event.type)

                      return (
                        <div key={event._id} className="flex items-center space-x-3 p-2 rounded border">
                          <div className={`p-1 rounded ${getEventColor(event.type)}`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{event.title}</div>
                            {!event.isAllDay && (
                              <div className="text-xs text-muted-foreground">{formatTime(event.startDate)}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
