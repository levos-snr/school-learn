"use client";

import {
	BookOpen,
	Calendar,
	FileText,
	GraduationCap,
	Home,
	Menu,
	Users,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
}

const navigationItems = [
	{
		id: "overview",
		label: "Overview",
		icon: Home,
	},
	{
		id: "courses",
		label: "Courses",
		icon: BookOpen,
	},
	{
		id: "assignments",
		label: "Assignments",
		icon: FileText,
	},
	{
		id: "tests",
		label: "Tests",
		icon: GraduationCap,
	},
	{
		id: "past-papers",
		label: "Past Papers",
		icon: Calendar,
	},
	{
		id: "friends",
		label: "Friends",
		icon: Users,
	},
];

export function Sidebar({
	activeTab,
	setActiveTab,
	collapsed,
	setCollapsed,
}: SidebarProps) {
	return (
		<div
			className={cn(
				"fixed top-0 left-0 z-40 h-screen border-border border-r bg-card transition-all duration-300 ease-in-out",
				"shadow-lg",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-border border-b p-4">
				{!collapsed && (
					<div className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fun">
							<GraduationCap className="h-5 w-5 text-white" />
						</div>
						<span className="bg-gradient-to-r from-primary to-fun bg-clip-text font-bold text-lg text-transparent">
							SchoolLearn
						</span>
					</div>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setCollapsed(!collapsed)}
					className="hover:bg-accent"
				>
					{collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
				</Button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto p-4">
				<div className="space-y-2">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;

						return (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={cn(
									"flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
									"sidebar-nav-item",
									isActive && "active",
									collapsed && "justify-center",
								)}
							>
								<Icon
									className={cn(
										"h-5 w-5 flex-shrink-0",
										isActive && "text-primary",
									)}
								/>
								{!collapsed && (
									<span
										className={cn("font-medium", isActive && "text-primary")}
									>
										{item.label}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</nav>

			{/* Footer */}
			{!collapsed && (
				<div className="border-border border-t p-4">
					<div className="learning-card p-3">
						<div className="mb-2 flex items-center space-x-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-success" />
							<span className="font-medium text-sm text-success">
								Learning Streak
							</span>
						</div>
						<div className="progress-container mb-2">
							<div className="progress-fill" style={{ width: "75%" }} />
						</div>
						<p className="text-muted-foreground text-xs">7 days strong! 🔥</p>
					</div>
				</div>
			)}
		</div>
	);
}
