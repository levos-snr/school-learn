"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Calendar, Star, Target, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AchievementsTab() {
	const userAchievements = useQuery(api.achievements.getUserAchievements);
	const availableAchievements = useQuery(
		api.achievements.getAvailableAchievements,
	);

	if (userAchievements === undefined || availableAchievements === undefined) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">Achievements</h1>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-3 w-1/2 rounded bg-gray-200" />
							</CardHeader>
							<CardContent>
								<div className="h-16 rounded bg-gray-200" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const completedAchievements =
		userAchievements?.filter((a) => a.isCompleted) || [];
	const inProgressAchievements =
		userAchievements?.filter((a) => !a.isCompleted && a.progress > 0) || [];
	const lockedAchievements =
		availableAchievements?.filter(
			(a) => !userAchievements?.some((ua) => ua.achievementId === a._id),
		) || [];

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "learning":
				return BookOpen;
			case "social":
				return Users;
			case "streak":
				return Calendar;
			case "completion":
				return Target;
			default:
				return Trophy;
		}
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity) {
			case "common":
				return "bg-gray-500";
			case "rare":
				return "bg-blue-500";
			case "epic":
				return "bg-purple-500";
			case "legendary":
				return "bg-yellow-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Achievements</h1>
					<p className="text-muted-foreground">
						Track your learning milestones and unlock rewards
					</p>
				</div>
				<div className="text-right">
					<div className="font-bold text-2xl text-primary">
						{completedAchievements.length}
					</div>
					<div className="text-muted-foreground text-sm">
						Achievements Unlocked
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Trophy className="h-5 w-5 text-yellow-500" />
							<div>
								<div className="font-bold text-2xl">
									{completedAchievements.length}
								</div>
								<div className="text-muted-foreground text-sm">Completed</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Target className="h-5 w-5 text-blue-500" />
							<div>
								<div className="font-bold text-2xl">
									{inProgressAchievements.length}
								</div>
								<div className="text-muted-foreground text-sm">In Progress</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Star className="h-5 w-5 text-purple-500" />
							<div>
								<div className="font-bold text-2xl">
									{completedAchievements.reduce(
										(sum, a) => sum + (a.achievement?.points || 0),
										0,
									)}
								</div>
								<div className="text-muted-foreground text-sm">
									Points Earned
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<BookOpen className="h-5 w-5 text-green-500" />
							<div>
								<div className="font-bold text-2xl">
									{lockedAchievements.length}
								</div>
								<div className="text-muted-foreground text-sm">Available</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Completed Achievements */}
			{completedAchievements.length > 0 && (
				<div>
					<h2 className="mb-4 font-semibold text-xl">Completed Achievements</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{completedAchievements.map((userAchievement) => {
							const achievement = userAchievement.achievement;
							if (!achievement) return null;

							const Icon = getCategoryIcon(achievement.category);

							return (
								<Card
									key={userAchievement._id}
									className="border-green-200 bg-green-50"
								>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<Icon className="h-6 w-6 text-green-600" />
											<Badge
												className={`${getRarityColor(achievement.rarity)} text-white`}
											>
												{achievement.rarity}
											</Badge>
										</div>
										<CardTitle className="text-lg">
											{achievement.title}
										</CardTitle>
										<CardDescription>{achievement.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center justify-between">
											<span className="font-medium text-green-600 text-sm">
												Completed!
											</span>
											<span className="text-muted-foreground text-sm">
												+{achievement.points} XP
											</span>
										</div>
										<div className="mt-1 text-muted-foreground text-xs">
											Unlocked{" "}
											{new Date(
												userAchievement.unlockedAt,
											).toLocaleDateString()}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* In Progress Achievements */}
			{inProgressAchievements.length > 0 && (
				<div>
					<h2 className="mb-4 font-semibold text-xl">In Progress</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{inProgressAchievements.map((userAchievement) => {
							const achievement = userAchievement.achievement;
							if (!achievement) return null;

							const Icon = getCategoryIcon(achievement.category);
							// Fixed: Properly calculate progress percentage
							const progressPercentage =
								(userAchievement.progress / achievement.requirements.target) *
								100;

							return (
								<Card key={userAchievement._id} className="border-blue-200">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<Icon className="h-6 w-6 text-blue-600" />
											<Badge
												className={`${getRarityColor(achievement.rarity)} text-white`}
											>
												{achievement.rarity}
											</Badge>
										</div>
										<CardTitle className="text-lg">
											{achievement.title}
										</CardTitle>
										<CardDescription>{achievement.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span>Progress</span>
												<span>
													{userAchievement.progress}/
													{achievement.requirements.target}
												</span>
											</div>
											<Progress value={progressPercentage} className="h-2" />
											<div className="text-muted-foreground text-xs">
												{achievement.points} XP when completed
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Available Achievements */}
			{lockedAchievements.length > 0 && (
				<div>
					<h2 className="mb-4 font-semibold text-xl">Available Achievements</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{lockedAchievements.map((achievement) => {
							const Icon = getCategoryIcon(achievement.category);

							return (
								<Card key={achievement._id} className="opacity-75">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<Icon className="h-6 w-6 text-gray-400" />
											<Badge
												className={`${getRarityColor(achievement.rarity)} text-white`}
											>
												{achievement.rarity}
											</Badge>
										</div>
										<CardTitle className="text-gray-600 text-lg">
											{achievement.name}
										</CardTitle>
										<CardDescription>{achievement.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Requirement: {achievement.requirements.target}{" "}
												{achievement.requirements.type.replace("_", " ")}
											</span>
											<span className="text-muted-foreground text-sm">
												+{achievement.points} XP
											</span>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
