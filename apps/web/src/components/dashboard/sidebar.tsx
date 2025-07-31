"use client";

import { useUser } from "@clerk/nextjs";
import {
	Bell,
	BookOpen,
	Calendar,
	ChevronLeft,
	ChevronRight,
	FileText,
	GraduationCap,
	Home,
	Settings,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

const menuItems = [
	{ id: "overview", label: "Overview", icon: Home },
	{ id: "courses", label: "Courses", icon: BookOpen },
	{ id: "assignments", label: "Assignments", icon: FileText },
	{ id: "calendar", label: "Calendar", icon: Calendar },
	{ id: "community", label: "Community", icon: Users },
	{ id: "achievements", label: "Achievements", icon: Trophy },
	{ id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { user } = useUser();

	return (
		<div
			className={`border-gray-200 border-r bg-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} flex h-full flex-col`}
		>
			{/* Header */}
			<div className="border-gray-200 border-b p-4">
				<div className="flex items-center justify-between">
					{!isCollapsed && (
						<div className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kenya-green">
								<GraduationCap className="h-5 w-5 text-white" />
							</div>
							<span className="font-bold text-gray-900 text-lg">Masomo</span>
						</div>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-1"
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
				<div className="border-gray-200 border-b p-4">
					<div className="flex items-center space-x-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
							<AvatarFallback className="bg-kenya-green text-white">
								{user?.firstName?.[0]}
								{user?.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-gray-900 text-sm">
								{user?.firstName} {user?.lastName}
							</p>
							<p className="text-gray-500 text-xs">Student</p>
						</div>
						<Button variant="ghost" size="sm" className="p-1">
							<Bell className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 p-2">
				<ul className="space-y-1">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;

						return (
							<li key={item.id}>
								<Button
									variant={isActive ? "default" : "ghost"}
									className={`w-full justify-start ${isActive ? "bg-kenya-green hover:bg-kenya-green/90" : "hover:bg-gray-100"} ${isCollapsed ? "px-2" : "px-3"}`}
									onClick={() => onTabChange(item.id)}
								>
									<Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
									{!isCollapsed && <span>{item.label}</span>}
								</Button>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Footer */}
			{!isCollapsed && (
				<div className="border-gray-200 border-t p-4">
					<div className="rounded-lg bg-gradient-to-r from-kenya-green to-kenya-red p-3 text-center text-white">
						<p className="font-medium text-xs">Upgrade to Pro</p>
						<p className="text-xs opacity-90">Unlock all features</p>
					</div>
				</div>
			)}
		</div>
	);
}
