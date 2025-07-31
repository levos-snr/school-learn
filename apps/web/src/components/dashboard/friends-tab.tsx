"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	BookOpen,
	Clock,
	Crown,
	FlameIcon as Fire,
	MessageCircle,
	Search,
	Star,
	Trophy,
	UserPlus,
	Users,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function FriendsTab() {
	const [searchTerm, setSearchTerm] = useState("");
	const friends = useQuery(api.dashboard.getFriends);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "online":
				return "bg-green-500";
			case "busy":
				return "bg-yellow-500";
			case "offline":
				return "bg-gray-400";
			default:
				return "bg-gray-400";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "online":
				return "Online";
			case "busy":
				return "Studying";
			case "offline":
				return "Offline";
			default:
				return "Unknown";
		}
	};

	const filteredFriends =
		friends?.filter((friend) =>
			friend.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const onlineFriends =
		friends?.filter((friend) => friend.status === "online") || [];
	const studyingFriends =
		friends?.filter((friend) => friend.status === "busy") || [];

	return (
		<div className="min-h-screen space-y-6 bg-background p-6">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="flex items-center space-x-2 font-bold text-3xl text-foreground">
						<Users className="h-8 w-8 text-pink-500" />
						<span>My Study Buddies</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Connect, compete, and learn together!
					</p>
				</div>
				<div className="flex items-center space-x-3">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							placeholder="Search friends..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-64 border-border bg-background pl-10 focus:border-pink-300"
						/>
					</div>
					<Button className="transform bg-gradient-to-r from-pink-500 to-purple-500 text-white transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-600">
						<UserPlus className="mr-2 h-4 w-4" />
						Add Friend
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-0 bg-green-50 shadow-lg dark:bg-green-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-green-600 text-sm dark:text-green-400">
									Online Now
								</p>
								<p className="font-bold text-2xl text-green-700 dark:text-green-300">
									{onlineFriends.length}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
								<Users className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-yellow-50 shadow-lg dark:bg-yellow-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-orange-600 text-sm dark:text-orange-400">
									Studying
								</p>
								<p className="font-bold text-2xl text-orange-700 dark:text-orange-300">
									{studyingFriends.length}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
								<BookOpen className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-purple-50 shadow-lg dark:bg-purple-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-purple-600 text-sm dark:text-purple-400">
									Total Friends
								</p>
								<p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
									{friends?.length || 0}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
								<Trophy className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-blue-50 shadow-lg dark:bg-blue-950">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-blue-600 text-sm dark:text-blue-400">
									Study Groups
								</p>
								<p className="font-bold text-2xl text-blue-700 dark:text-blue-300">
									3
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
								<Users className="h-6 w-6 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Friends List */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{filteredFriends.map((friend) => (
					<Card
						key={friend.id}
						className="hover:-translate-y-1 transform border-0 bg-card shadow-xl transition-all duration-300 hover:shadow-2xl"
					>
						<CardContent className="p-6">
							<div className="flex items-start space-x-4">
								<div className="relative">
									<Avatar className="h-16 w-16 border-4 border-background shadow-lg">
										<AvatarImage src={friend.avatar || "/placeholder.svg"} />
										<AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 font-bold text-lg text-white">
											{friend.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div
										className={`-bottom-1 -right-1 absolute h-5 w-5 ${getStatusColor(friend.status)} rounded-full border-3 border-background`}
									/>
								</div>

								<div className="flex-1">
									<div className="mb-2 flex items-center justify-between">
										<h3 className="font-bold text-foreground text-lg">
											{friend.name}
										</h3>
										<Badge
											className={`${friend.status === "online" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : friend.status === "busy" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
										>
											{getStatusText(friend.status)}
										</Badge>
									</div>

									<p className="mb-3 text-muted-foreground text-sm">
										{friend.currentCourse}
									</p>

									<div className="mb-4 grid grid-cols-2 gap-4">
										<div className="flex items-center space-x-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
												<Fire className="h-4 w-4 text-orange-500" />
											</div>
											<div>
												<p className="text-muted-foreground text-xs">
													Study Streak
												</p>
												<p className="font-bold text-orange-600 text-sm dark:text-orange-400">
													{friend.studyStreak} days
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
												<Clock className="h-4 w-4 text-blue-500" />
											</div>
											<div>
												<p className="text-muted-foreground text-xs">
													Last Seen
												</p>
												<p className="font-bold text-blue-600 text-sm dark:text-blue-400">
													{friend.lastSeen}
												</p>
											</div>
										</div>
									</div>

									<div className="flex space-x-2">
										<Button
											size="sm"
											className="flex-1 transform bg-gradient-to-r from-pink-500 to-purple-500 text-white transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-600"
										>
											<MessageCircle className="mr-2 h-4 w-4" />
											Message
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="transform border-border bg-transparent transition-all hover:scale-105 hover:bg-accent"
										>
											<Zap className="mr-2 h-4 w-4" />
											Challenge
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Study Groups */}
			<Card className="border-0 bg-card shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2 text-foreground">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
							<Users className="h-5 w-5 text-white" />
						</div>
						<span>Study Groups</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
							<CardContent className="p-4">
								<div className="mb-3 flex items-center space-x-2">
									<Crown className="h-5 w-5 text-yellow-500" />
									<h4 className="font-bold text-foreground">Math Masters</h4>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									Advanced Mathematics study group
								</p>
								<div className="flex items-center justify-between">
									<div className="-space-x-2 flex">
										{[1, 2, 3, 4].map((i) => (
											<Avatar
												key={i}
												className="h-6 w-6 border-2 border-background"
											>
												<AvatarFallback className="bg-primary text-primary-foreground text-xs">
													U{i}
												</AvatarFallback>
											</Avatar>
										))}
									</div>
									<Badge className="bg-blue-500 text-white">8 members</Badge>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
							<CardContent className="p-4">
								<div className="mb-3 flex items-center space-x-2">
									<Star className="h-5 w-5 text-green-500" />
									<h4 className="font-bold text-foreground">Science Squad</h4>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									Physics & Chemistry enthusiasts
								</p>
								<div className="flex items-center justify-between">
									<div className="-space-x-2 flex">
										{[1, 2, 3, 4, 5].map((i) => (
											<Avatar
												key={i}
												className="h-6 w-6 border-2 border-background"
											>
												<AvatarFallback className="bg-primary text-primary-foreground text-xs">
													S{i}
												</AvatarFallback>
											</Avatar>
										))}
									</div>
									<Badge className="bg-green-500 text-white">12 members</Badge>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
							<CardContent className="p-4">
								<div className="mb-3 flex items-center space-x-2">
									<BookOpen className="h-5 w-5 text-purple-500" />
									<h4 className="font-bold text-foreground">
										Language Learners
									</h4>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									English & Kiswahili practice
								</p>
								<div className="flex items-center justify-between">
									<div className="-space-x-2 flex">
										{[1, 2, 3].map((i) => (
											<Avatar
												key={i}
												className="h-6 w-6 border-2 border-background"
											>
												<AvatarFallback className="bg-primary text-primary-foreground text-xs">
													L{i}
												</AvatarFallback>
											</Avatar>
										))}
									</div>
									<Badge className="bg-purple-500 text-white">6 members</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{filteredFriends.length === 0 && (
				<Card className="border-0 bg-card shadow-xl">
					<CardContent className="p-12 text-center">
						<Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
						<h3 className="mb-2 font-bold text-foreground text-xl">
							No friends found
						</h3>
						<p className="mb-6 text-muted-foreground">
							Start building your study network by adding friends!
						</p>
						<Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600">
							<UserPlus className="mr-2 h-4 w-4" />
							Find Study Buddies
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
