"use client";

import { Bell, Menu, Moon, Search, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
	user: any;
	onToggleSidebar: () => void;
}

export function DashboardHeader({
	user,
	onToggleSidebar,
}: DashboardHeaderProps) {
	const { theme, setTheme } = useTheme();

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-between px-6">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggleSidebar}
						className="lg:hidden"
					>
						<Menu className="h-4 w-4" />
					</Button>

					{/* Search */}
					<div className="relative w-64 max-w-sm">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search courses, assignments..."
							className="border-0 bg-muted/50 pl-10 focus-visible:ring-1"
						/>
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-3">
					{/* Theme Toggle */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="h-9 w-9"
					>
						<Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
						<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>

					{/* Notifications */}
					<Button variant="ghost" size="sm" className="relative h-9 w-9">
						<Bell className="h-4 w-4" />
						<Badge className="-top-1 -right-1 absolute h-5 w-5 rounded-full bg-kenya-red p-0 text-white text-xs">
							3
						</Badge>
					</Button>

					{/* Settings */}
					<Button variant="ghost" size="sm" className="h-9 w-9">
						<Settings className="h-4 w-4" />
					</Button>

					{/* User Profile */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-9 w-9 rounded-full">
								<Avatar className="h-9 w-9">
									<AvatarImage
										src={user?.profile?.avatar || "/placeholder.svg"}
										alt={user?.name}
									/>
									<AvatarFallback className="bg-kenya-green text-white">
										{user?.name?.charAt(0)?.toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="font-medium text-sm leading-none">
										{user?.name}
									</p>
									<p className="text-muted-foreground text-xs leading-none">
										{user?.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profile Settings</DropdownMenuItem>
							<DropdownMenuItem>Learning Preferences</DropdownMenuItem>
							<DropdownMenuItem>Billing</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-red-600">
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
