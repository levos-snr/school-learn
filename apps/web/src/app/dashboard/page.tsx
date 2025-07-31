"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignmentsTab } from "@/components/dashboard/assignments-tab";
import { CoursesTab } from "@/components/dashboard/courses-tab";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FriendsTab } from "@/components/dashboard/friends-tab";
import { FunOverviewTab } from "@/components/dashboard/fun-overview-tab";
import { FunSidebar } from "@/components/dashboard/fun-sidebar";
import { PastPapersTab } from "@/components/dashboard/past-papers-tab";
import { TestsTab } from "@/components/dashboard/tests-tab";

export default function DashboardPage() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [isCreatingUser, setIsCreatingUser] = useState(false);

	const currentUser = useQuery(api.users.current);
	const storeUser = useMutation(api.users.store);

	// Debug logging
	useEffect(() => {
		console.log("Dashboard State:", {
			isLoaded,
			hasUser: !!user,
			currentUser: currentUser,
			isCreatingUser,
		});
	}, [isLoaded, user, currentUser, isCreatingUser]);

	// Handle authentication and user setup
	useEffect(() => {
		const handleUserSetup = async () => {
			// If not loaded or no user, redirect to sign in
			if (isLoaded && !user) {
				console.log("No user found, redirecting to sign-in");
				router.push("/sign-in");
				return;
			}

			// If user exists in Clerk but not in Convex, create them
			if (isLoaded && user && currentUser === null && !isCreatingUser) {
				console.log("User exists in Clerk but not in Convex, creating user...");
				setIsCreatingUser(true);
				try {
					await storeUser();
					console.log("User created successfully");
				} catch (error) {
					console.error("Failed to create user:", error);
				} finally {
					setIsCreatingUser(false);
				}
			}

			// If user exists but hasn't completed onboarding, redirect to onboarding
			if (isLoaded && user && currentUser && !currentUser.onboardingCompleted) {
				console.log("User hasn't completed onboarding, redirecting...");
				router.push("/onboarding");
				return;
			}
		};

		handleUserSetup();
	}, [isLoaded, user, currentUser, router, storeUser, isCreatingUser]);

	// Show loading while checking authentication and user status
	if (!isLoaded || !user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-kenya-green border-b-2" />
					<p className="text-muted-foreground">Loading authentication...</p>
				</div>
			</div>
		);
	}

	// Show loading while currentUser is undefined or null (still loading from Convex)
	if (currentUser === undefined || currentUser === null || isCreatingUser) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-kenya-green border-b-2" />
					<p className="text-muted-foreground">
						{isCreatingUser
							? "Setting up your account..."
							: "Loading your dashboard..."}
					</p>
				</div>
			</div>
		);
	}

	// If user hasn't completed onboarding, show loading (redirect should happen in useEffect)
	if (!currentUser.onboardingCompleted) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-kenya-green border-b-2" />
					<p className="text-muted-foreground">
						Setting up your learning experience...
					</p>
				</div>
			</div>
		);
	}

	const renderActiveTab = () => {
		switch (activeTab) {
			case "overview":
				return <FunOverviewTab />;
			case "courses":
				return <CoursesTab />;
			case "assignments":
				return <AssignmentsTab />;
			case "tests":
				return <TestsTab />;
			case "past-papers":
				return <PastPapersTab />;
			case "friends":
				return <FriendsTab />;
			default:
				return <FunOverviewTab />;
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				{/* Sidebar */}
				<FunSidebar
					activeTab={activeTab}
					onTabChange={setActiveTab}
					collapsed={sidebarCollapsed}
					onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>
				{/* Main Content */}
				<div
					className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}
				>
					{/* Header */}
					<DashboardHeader
						user={currentUser}
						onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
					/>
					{/* Tab Content */}
					<main className="p-6">{renderActiveTab()}</main>
				</div>
			</div>
		</div>
	);
}
