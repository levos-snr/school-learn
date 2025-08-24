"use client";

import {
	Archive,
	BookOpen,
	Calendar,
	FileText,
	GraduationCap,
	Home,
	Menu,
	Settings,
	TestTube,
	Trophy,
	Users,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FunSidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	collapsed: boolean;
	onToggleCollapse: () => void;
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
		icon: TestTube,
	},
	{
		id: "past-papers",
		label: "Past Papers",
		icon: Archive,
	},
	{
		id: "friends",
		label: "Friends",
		icon: Users,
	},
	{
		id: "achievements",
		label: "Achievements",
		icon: Trophy,
	},
	{
		id: "calendar",
		label: "Calendar",
		icon: Calendar,
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
	},
];

export function FunSidebar({
	activeTab,
	onTabChange,
	collapsed,
	onToggleCollapse,
}: FunSidebarProps) {
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
					size="icon"
					onClick={onToggleCollapse}
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
								onClick={() => onTabChange(item.id)}
								className={cn(
									"flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
									"hover:bg-accent hover:text-accent-foreground",
									isActive && "bg-primary text-primary-foreground",
									collapsed && "justify-center",
								)}
							>
								<Icon className={cn("h-5 w-5 flex-shrink-0")} />
								{!collapsed && (
									<span className="font-medium">{item.label}</span>
								)}
							</button>
						);
					})}
				</div>
			</nav>

			{/* Footer */}
			{!collapsed && (
				<div className="border-border border-t p-4">
					<div className="rounded-lg bg-gradient-to-r from-primary/10 to-fun/10 p-3">
						<div className="mb-2 flex items-center space-x-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
							<span className="font-medium text-green-600 text-sm">
								Learning Streak
							</span>
						</div>
						<div className="mb-2 h-2 w-full rounded-full bg-gray-200">
							<div
								className="h-2 rounded-full bg-gradient-to-r from-primary to-fun"
								style={{ width: "75%" }}
							/>
						</div>
						<p className="text-muted-foreground text-xs">7 days strong! 🔥</p>
					</div>
				</div>
			)}
		</div>
	);
}
