"use client";

import { useUser } from "@clerk/nextjs";
import {
	BookOpen,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	GraduationCap,
	Home,
	Settings,
	Sparkles,
	TestTube,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FunSidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function FunSidebar({ activeTab, onTabChange }: FunSidebarProps) {
	const { user } = useUser();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const menuItems = [
		{
			id: "overview",
			label: "Overview",
			icon: Home,
			color: "text-blue-500",
			bgColor: "bg-blue-50 dark:bg-blue-950",
		},
		{
			id: "courses",
			label: "Courses",
			icon: BookOpen,
			color: "text-green-500",
			bgColor: "bg-green-50 dark:bg-green-950",
		},
		{
			id: "assignments",
			label: "Assignments",
			icon: FileText,
			color: "text-orange-500",
			bgColor: "bg-orange-50 dark:bg-orange-950",
		},
		{
			id: "tests",
			label: "Tests",
			icon: TestTube,
			color: "text-purple-500",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
		{
			id: "pastpapers",
			label: "Past Papers",
			icon: Download,
			color: "text-indigo-500",
			bgColor: "bg-indigo-50 dark:bg-indigo-950",
		},
		{
			id: "friends",
			label: "Friends",
			icon: Users,
			color: "text-pink-500",
			bgColor: "bg-pink-50 dark:bg-pink-950",
		},
		{
			id: "achievements",
			label: "Achievements",
			icon: Trophy,
			color: "text-yellow-500",
			bgColor: "bg-yellow-50 dark:bg-yellow-950",
		},
		{
			id: "calendar",
			label: "Calendar",
			icon: Calendar,
			color: "text-cyan-500",
			bgColor: "bg-cyan-50 dark:bg-cyan-950",
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
			color: "text-gray-500",
			bgColor: "bg-gray-50 dark:bg-gray-950",
		},
	];

	return (
		<aside
			className={`${isCollapsed ? "w-20" : "w-72"} flex h-screen flex-col border-border border-r bg-card transition-all duration-300`}
		>
			{/* Header */}
			<div className="border-border border-b p-6">
				<div className="flex items-center justify-between">
					{!isCollapsed && (
						<div className="flex items-center space-x-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
								<GraduationCap className="h-6 w-6 text-primary-foreground" />
							</div>
							<div>
								<h1 className="font-bold text-foreground text-xl">Masomo</h1>
								<p className="text-muted-foreground text-xs">
									Learning Dashboard
								</p>
							</div>
						</div>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="hover:bg-accent"
					>
						{isCollapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			{/* User Profile */}
			{!isCollapsed && (
				<div className="border-border border-b p-6">
					<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
						<div className="flex items-center space-x-3">
							<Avatar className="h-12 w-12 border-2 border-primary/20">
								<AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
								<AvatarFallback className="bg-primary font-bold text-primary-foreground">
									{user?.firstName?.[0]}
									{user?.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-foreground">
									{user?.firstName} {user?.lastName}
								</p>
								<div className="flex items-center space-x-2">
									<Badge
										variant="secondary"
										className="border-primary/20 bg-primary/10 text-primary text-xs"
									>
										<Sparkles className="mr-1 h-3 w-3" />
										Level 5
									</Badge>
								</div>
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 space-y-2 overflow-y-auto p-4">
				{menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = activeTab === item.id;

					return (
						<Button
							key={item.id}
							variant={isActive ? "secondary" : "ghost"}
							className={`h-12 w-full justify-start transition-all duration-200 ${
								isActive
									? `${item.bgColor} ${item.color} border border-current/20 shadow-sm`
									: "text-muted-foreground hover:bg-accent hover:text-foreground"
							} ${isCollapsed ? "px-3" : "px-4"}`}
							onClick={() => onTabChange(item.id)}
						>
							<Icon
								className={`${isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} ${isActive ? item.color : ""}`}
							/>
							{!isCollapsed && (
								<span className="font-medium">{item.label}</span>
							)}
							{!isCollapsed && isActive && (
								<div className="ml-auto h-2 w-2 rounded-full bg-current opacity-60" />
							)}
						</Button>
					);
				})}
			</nav>

			{/* Footer */}
			{!isCollapsed && (
				<div className="border-border border-t p-4">
					<div className="text-center">
						<p className="text-muted-foreground text-xs">
							© 2024 Masomo Learning Platform
						</p>
					</div>
				</div>
			)}
		</aside>
	);
}
