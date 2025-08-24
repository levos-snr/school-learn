"use client";

import { useClerk } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Bell, Menu, Search, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav";
import { RoleBasedNav } from "@/components/navigation/role-based-nav";
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
	onSidebarToggle?: () => void;
	user?: {
		name: string;
		email: string;
		imageUrl?: string;
		role?: string;
	};
}

export function DashboardHeader({
	onSidebarToggle,
	user,
}: DashboardHeaderProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const isAdmin = useQuery(api.users.isAdmin);
	const { signOut } = useClerk();

	return (
		<div className="space-y-4">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between px-4">
					{/* Left side - Mobile menu and search */}
					<div className="flex flex-1 items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={onSidebarToggle}
						>
							<Menu className="h-5 w-5" />
						</Button>

						<div className="relative max-w-sm">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search courses, assignments..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 md:w-[300px]"
							/>
						</div>
					</div>

					{/* Center - Role-based navigation */}
					<div className="hidden md:flex">
						<RoleBasedNav />
					</div>

					{/* Right side - Theme toggle, notifications and user menu */}
					<div className="flex items-center gap-2">
						<ModeToggle />

						{/* Notifications */}
						<Button variant="ghost" size="icon" className="relative">
							<Bell className="h-5 w-5" />
							<Badge
								variant="destructive"
								className="-top-1 -right-1 absolute h-5 w-5 rounded-full p-0 text-xs"
							>
								3
							</Badge>
						</Button>

						{/* Admin Panel Access */}
						{isAdmin && (
							<Button variant="ghost" size="icon" asChild>
								<Link href="/admin">
									<Shield className="h-5 w-5" />
								</Link>
							</Button>
						)}

						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-10 w-10 rounded-full"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={user?.imageUrl || "/placeholder.svg"}
											alt={user?.name || "User"}
										/>
										<AvatarFallback>
											{user?.name?.charAt(0).toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="font-medium text-sm leading-none">
											{user?.name || "User"}
										</p>
										<p className="text-muted-foreground text-xs leading-none">
											{user?.email}
										</p>
										{user?.role && (
											<Badge variant="secondary" className="w-fit text-xs">
												{user.role}
											</Badge>
										)}
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard?tab=settings">
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard?tab=settings">
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								{isAdmin && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href="/admin">
												<Shield className="mr-2 h-4 w-4" />
												<span>Admin Panel</span>
											</Link>
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600"
									onClick={() => signOut()}
								>
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<div className="container px-4">
				<BreadcrumbNav />
			</div>
		</div>
	);
}
