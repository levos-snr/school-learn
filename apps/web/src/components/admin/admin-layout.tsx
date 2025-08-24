"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	Activity,
	ArrowLeft,
	BarChart3,
	BookOpen,
	CheckCircle,
	Clock,
	Settings,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesManagementTab } from "./courses-management-tab";
import { DashboardTab } from "./dashboard-tab";
import { UsersManagementTab } from "./users-management-tab";

export function AdminLayout() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const currentUser = useQuery(api.users.getCurrentUser);
	const isAdmin = useQuery(api.users.isAdmin);
	const router = useRouter();

	if (!isAdmin) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<CardTitle className="text-xl">Access Denied</CardTitle>
						<CardDescription>
							You don't have permission to access the admin panel.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button variant="outline" onClick={() => window.history.back()}>
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push("/dashboard")}
							className="cursor-pointer"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Dashboard
						</Button>
						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-primary/10 p-2">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h1 className="font-bold text-xl">Admin Panel</h1>
								<p className="text-muted-foreground text-sm">
									System Management
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<Badge variant="secondary" className="gap-1">
							<Activity className="h-3 w-3" />
							System Online
						</Badge>
						<div className="text-right">
							<p className="font-medium text-sm">{currentUser?.name}</p>
							<p className="text-muted-foreground text-xs">Administrator</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container px-4 py-6">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-6">
						<TabsTrigger value="dashboard" className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4" />
							Dashboard
						</TabsTrigger>
						<TabsTrigger value="users" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Users
						</TabsTrigger>
						<TabsTrigger value="courses" className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							Courses
						</TabsTrigger>
						<TabsTrigger value="content" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							Content
						</TabsTrigger>
						<TabsTrigger value="analytics" className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							Analytics
						</TabsTrigger>
						<TabsTrigger value="system" className="flex items-center gap-2">
							<Activity className="h-4 w-4" />
							System
						</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard">
						<DashboardTab />
					</TabsContent>

					<TabsContent value="users">
						<UsersManagementTab />
					</TabsContent>

					<TabsContent value="courses">
						<CoursesManagementTab />
					</TabsContent>

					<TabsContent value="content">
						<Card>
							<CardHeader>
								<CardTitle>Content Management</CardTitle>
								<CardDescription>
									Manage assignments, tests, and other learning materials
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Content management features coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="analytics">
						<Card>
							<CardHeader>
								<CardTitle>Advanced Analytics</CardTitle>
								<CardDescription>
									Detailed insights into platform usage and performance
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Advanced analytics coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="system">
						<Card>
							<CardHeader>
								<CardTitle>System Health</CardTitle>
								<CardDescription>
									Monitor system performance and health metrics
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="flex items-center gap-3 rounded-lg border p-4">
										<CheckCircle className="h-8 w-8 text-green-500" />
										<div>
											<p className="font-medium">Database</p>
											<p className="text-muted-foreground text-sm">Healthy</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-lg border p-4">
										<CheckCircle className="h-8 w-8 text-green-500" />
										<div>
											<p className="font-medium">API</p>
											<p className="text-muted-foreground text-sm">
												Operational
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-lg border p-4">
										<Clock className="h-8 w-8 text-yellow-500" />
										<div>
											<p className="font-medium">Cache</p>
											<p className="text-muted-foreground text-sm">Warming</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
