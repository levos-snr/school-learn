"use client";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	BarChart3,
	Bell,
	BookOpen,
	Calendar,
	ChevronUp,
	ClipboardList,
	FileText,
	Flame,
	Home,
	LogOut,
	MessageSquare,
	Settings,
	Shield,
	Trophy,
	User,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
	{
		title: "Overview",
		url: "/dashboard",
		icon: Home,
		badge: null,
	},
	{
		title: "Courses",
		url: "/dashboard/courses",
		icon: BookOpen,
		badge: null,
	},
	{
		title: "Assignments",
		url: "/dashboard/assignments",
		icon: ClipboardList,
		badge: 3,
	},
	{
		title: "Tests",
		url: "/dashboard/tests",
		icon: FileText,
		badge: 1,
	},
	{
		title: "Calendar",
		url: "/dashboard/calendar",
		icon: Calendar,
		badge: null,
	},
	{
		title: "Friends",
		url: "/dashboard/friends",
		icon: Users,
		badge: 2,
	},
	{
		title: "Achievements",
		url: "/dashboard/achievements",
		icon: Trophy,
		badge: null,
	},
	{
		title: "Past Papers",
		url: "/dashboard/past-papers",
		icon: FileText,
		badge: null,
	},
];

const quickActions = [
	{
		title: "Messages",
		url: "/dashboard/messages",
		icon: MessageSquare,
		badge: 5,
	},
	{
		title: "Notifications",
		url: "/dashboard/notifications",
		icon: Bell,
		badge: 8,
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: BarChart3,
		badge: null,
	},
];

interface AppSidebarProps {
	user?: {
		name: string;
		email: string;
		imageUrl?: string;
		role?: string;
		stats?: {
			xpPoints: number;
			level: number;
			studyStreak: number;
		};
	};
}

export function AppSidebar({ user }: AppSidebarProps) {
	const { state } = useSidebar();
	const isAdmin = useQuery(api.users.isAdmin);

	const isCollapsed = state === "collapsed";
	const xpPoints = user?.stats?.xpPoints || 0;
	const level = user?.stats?.level || 1;
	const studyStreak = user?.stats?.studyStreak || 0;

	// Calculate XP progress to next level
	const xpForNextLevel = level * 1000;
	const xpProgress = (xpPoints % 1000) / 10;

	return (
		<Sidebar
			variant="sidebar"
			className="border-r-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
		>
			<SidebarHeader className="border-slate-700/50 border-b bg-slate-800/50">
				<div className="flex items-center gap-3 px-3 py-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
						<BookOpen className="h-6 w-6 text-white" />
					</div>
					{!isCollapsed && (
						<div className="flex flex-col">
							<h1 className="font-bold text-lg text-white">SchoolLearn</h1>
							<p className="text-slate-400 text-xs">Learn. Grow. Succeed.</p>
						</div>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent className="bg-slate-900/50">
				{/* User Stats Section */}
				{!isCollapsed && (
					<SidebarGroup>
						<div className="space-y-4 px-3 py-4">
							{/* XP and Level */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-yellow-400" />
										<span className="font-medium text-sm text-white">
											Level {level}
										</span>
									</div>
									<span className="text-slate-400 text-xs">{xpPoints} XP</span>
								</div>
								<Progress value={xpProgress} className="h-2 bg-slate-700">
									<div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" />
								</Progress>
							</div>

							{/* Study Streak */}
							<div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-red-500/20 p-3">
								<div className="flex items-center gap-2">
									<Flame className="h-4 w-4 text-orange-400" />
									<span className="font-medium text-sm text-white">Streak</span>
								</div>
								<Badge
									variant="secondary"
									className="border-orange-500/30 bg-orange-500/20 text-orange-300"
								>
									{studyStreak} days
								</Badge>
							</div>
						</div>
					</SidebarGroup>
				)}

				<SidebarSeparator className="bg-slate-700/50" />

				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel className="px-3 text-slate-400 text-xs uppercase tracking-wider">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
											{item.badge && (
												<Badge
													variant="destructive"
													className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
												>
													{item.badge}
												</Badge>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className="bg-slate-700/50" />

				{/* Quick Actions */}
				<SidebarGroup>
					<SidebarGroupLabel className="px-3 text-slate-400 text-xs uppercase tracking-wider">
						Quick Actions
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{quickActions.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
											{item.badge && (
												<Badge
													variant="secondary"
													className="ml-auto flex h-5 w-5 items-center justify-center rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-300 text-xs"
												>
													{item.badge}
												</Badge>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Admin Section */}
				{isAdmin && (
					<>
						<SidebarSeparator className="bg-slate-700/50" />
						<SidebarGroup>
							<SidebarGroupLabel className="px-3 text-slate-400 text-xs uppercase tracking-wider">
								Administration
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											className="text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
										>
											<Link href="/admin" className="flex items-center gap-3">
												<Shield className="h-4 w-4" />
												<span>Admin Panel</span>
												<Badge
													variant="outline"
													className="ml-auto border-purple-500/50 text-purple-300 text-xs"
												>
													Admin
												</Badge>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				)}
			</SidebarContent>

			<SidebarFooter className="border-slate-700/50 border-t bg-slate-800/50">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="text-slate-300 hover:bg-slate-800/50 hover:text-white data-[state=open]:bg-slate-800/50"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user?.imageUrl || "/placeholder.svg"}
											alt={user?.name}
										/>
										<AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
											{user?.name?.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold text-white">
											{user?.name}
										</span>
										<span className="truncate text-slate-400 text-xs">
											{user?.email}
										</span>
									</div>
									<ChevronUp className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-slate-700 bg-slate-800"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={user?.imageUrl || "/placeholder.svg"}
												alt={user?.name}
											/>
											<AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
												{user?.name?.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold text-white">
												{user?.name}
											</span>
											<span className="truncate text-slate-400 text-xs">
												{user?.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-slate-700" />
								<DropdownMenuItem className="text-slate-300 hover:bg-slate-700/50 hover:text-white">
									<User className="mr-2 h-4 w-4" />
									Profile
								</DropdownMenuItem>
								<DropdownMenuItem className="text-slate-300 hover:bg-slate-700/50 hover:text-white">
									<Settings className="mr-2 h-4 w-4" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-slate-700" />
								<DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
									<LogOut className="mr-2 h-4 w-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
