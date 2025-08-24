"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	BarChart3,
	BookOpen,
	ChevronDown,
	GraduationCap,
	Plus,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export function RoleBasedNav() {
	const user = useQuery(api.users.current);
	const isAdmin = useQuery(api.users.isAdmin);
	const router = useRouter();

	if (!user) return null;

	const isInstructor = user.role === "instructor" || user.role === "admin";

	return (
		<div className="flex items-center gap-4">
			{/* Quick Actions based on role */}
			{isInstructor && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2 bg-transparent">
							<Plus className="h-4 w-4" />
							Create
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Create Content</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => router.push("/instructor/create-course")}
						>
							<BookOpen className="mr-2 h-4 w-4" />
							New Course
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => router.push("/instructor/lessons")}
						>
							<GraduationCap className="mr-2 h-4 w-4" />
							Add Lesson
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{/* Role-based dashboard access */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="gap-2">
						<BarChart3 className="h-4 w-4" />
						Dashboards
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Access Dashboards</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => router.push("/dashboard")}>
						<Users className="mr-2 h-4 w-4" />
						Student Dashboard
					</DropdownMenuItem>

					{isInstructor && (
						<DropdownMenuItem onClick={() => router.push("/instructor")}>
							<BookOpen className="mr-2 h-4 w-4" />
							Instructor Dashboard
							<Badge variant="secondary" className="ml-auto">
								{user.role === "instructor" ? "Instructor" : "Admin"}
							</Badge>
						</DropdownMenuItem>
					)}

					{isAdmin && (
						<DropdownMenuItem onClick={() => router.push("/admin")}>
							<Shield className="mr-2 h-4 w-4" />
							Admin Panel
							<Badge variant="destructive" className="ml-auto">
								Admin
							</Badge>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Settings */}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.push("/dashboard?tab=settings")}
			>
				<Settings className="h-4 w-4" />
			</Button>
		</div>
	);
}
