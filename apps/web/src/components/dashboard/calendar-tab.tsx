"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Calendar, Clock, FileText, Plus, TestTube, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CalendarTab() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const events = useQuery(api.calendar.getUserEvents, {
		startDate: new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			1,
		).getTime(),
		endDate: new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth() + 1,
			0,
		).getTime(),
	});
	const upcomingEvents = useQuery(api.calendar.getUpcomingEvents, { days: 7 });

	if (events === undefined || upcomingEvents === undefined) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">Calendar</h1>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<Card className="animate-pulse">
							<CardContent className="p-6">
								<div className="h-96 rounded bg-gray-200" />
							</CardContent>
						</Card>
					</div>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="p-4">
									<div className="h-16 rounded bg-gray-200" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	const getEventIcon = (type: string) => {
		switch (type) {
			case "assignment":
				return FileText;
			case "test":
				return TestTube;
			case "personal":
				return User;
			default:
				return Calendar;
		}
	};

	const getEventColor = (type: string) => {
		switch (type) {
			case "assignment":
				return "bg-blue-500";
			case "test":
				return "bg-red-500";
			case "deadline":
				return "bg-orange-500";
			case "personal":
				return "bg-green-500";
			default:
				return "bg-gray-500";
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString([], {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	const isToday = (timestamp: number) => {
		const today = new Date();
		const eventDate = new Date(timestamp);
		return today.toDateString() === eventDate.toDateString();
	};

	const isTomorrow = (timestamp: number) => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const eventDate = new Date(timestamp);
		return tomorrow.toDateString() === eventDate.toDateString();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Calendar</h1>
					<p className="text-muted-foreground">
						Keep track of your assignments, tests, and important dates
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Event
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Calendar View */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Calendar className="mr-2 h-5 w-5" />
								{selectedDate.toLocaleDateString([], {
									month: "long",
									year: "numeric",
								})}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-4 grid grid-cols-7 gap-2">
								{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
									(day) => (
										<div
											key={day}
											className="p-2 text-center font-medium text-muted-foreground text-sm"
										>
											{day}
										</div>
									),
								)}
							</div>

							<div className="grid grid-cols-7 gap-2">
								{Array.from({ length: 35 }, (_, i) => {
									const date = new Date(
										selectedDate.getFullYear(),
										selectedDate.getMonth(),
										i - 6,
									);
									const dayEvents =
										events?.filter((event) => {
											const eventDate = new Date(event.startDate);
											return eventDate.toDateString() === date.toDateString();
										}) || [];

									const isCurrentMonth =
										date.getMonth() === selectedDate.getMonth();
									const isSelected =
										date.toDateString() === selectedDate.toDateString();

									return (
										<div
											key={i}
											className={`min-h-[80px] cursor-pointer rounded border p-1 transition-colors ${isCurrentMonth ? "bg-background" : "bg-muted/50 text-muted-foreground"} ${isSelected ? "ring-2 ring-primary" : ""}hover:bg-accent `}
											onClick={() => setSelectedDate(date)}
										>
											<div className="mb-1 font-medium text-sm">
												{date.getDate()}
											</div>
											<div className="space-y-1">
												{dayEvents.slice(0, 2).map((event) => (
													<div
														key={event._id}
														className={`truncate rounded p-1 text-white text-xs ${getEventColor(event.type)}`}
													>
														{event.title}
													</div>
												))}
												{dayEvents.length > 2 && (
													<div className="text-muted-foreground text-xs">
														+{dayEvents.length - 2} more
													</div>
												)}
											</div>
										</div>
									);
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
								<p className="text-muted-foreground text-sm">
									No upcoming events
								</p>
							) : (
								upcomingEvents?.map((event) => {
									const Icon = getEventIcon(event.type);

									return (
										<div
											key={event._id}
											className="flex items-start space-x-3 rounded-lg border p-3"
										>
											<div
												className={`rounded-full p-2 ${getEventColor(event.type)}`}
											>
												<Icon className="h-4 w-4 text-white" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="truncate font-medium">
													{event.title}
												</div>
												{event.description && (
													<div className="truncate text-muted-foreground text-sm">
														{event.description}
													</div>
												)}
												<div className="mt-1 flex items-center space-x-2">
													<Clock className="h-3 w-3 text-muted-foreground" />
													<span className="text-muted-foreground text-xs">
														{isToday(event.startDate)
															? "Today"
															: isTomorrow(event.startDate)
																? "Tomorrow"
																: formatDate(event.startDate)}
														{event.endTime !== event.startTime &&
															` at ${formatTime(event.startTime)}`}
													</span>
												</div>
											</div>
											<Badge variant="outline" className="text-xs">
												{event.type}
											</Badge>
										</div>
									);
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
							{events?.filter((event) => isToday(event.startDate)).length ===
							0 ? (
								<p className="text-muted-foreground text-sm">No events today</p>
							) : (
								<div className="space-y-3">
									{events
										?.filter((event) => isToday(event.startDate))
										.map((event) => {
											const Icon = getEventIcon(event.type);

											return (
												<div
													key={event._id}
													className="flex items-center space-x-3 rounded border p-2"
												>
													<div
														className={`rounded p-1 ${getEventColor(event.type)}`}
													>
														<Icon className="h-3 w-3 text-white" />
													</div>
													<div className="flex-1">
														<div className="font-medium text-sm">
															{event.title}
														</div>
														{!event.isAllDay && (
															<div className="text-muted-foreground text-xs">
																{formatTime(event.startDate)}
															</div>
														)}
													</div>
												</div>
											);
										})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
