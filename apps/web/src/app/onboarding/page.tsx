"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FirstTimeFlow } from "@/components/onboarding/first-time-flow";

interface OnboardingData {
	goal?: string;
	focus?: string;
	subject?: string;
	level?: string;
	timeCommitment?: string;
	schedule?: string;
	recommendation?: string;
	age?: string;
}

export default function OnboardingPage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const [isProcessing, setIsProcessing] = useState(false);

	const currentUser = useQuery(api.users.current);
	const storeUser = useMutation(api.users.store);
	const completeOnboarding = useMutation(api.users.completeOnboarding);

	// Debug logging
	useEffect(() => {
		console.log("Onboarding Page State:", {
			isLoaded,
			hasUser: !!user,
			currentUser: currentUser,
			userId: user?.id,
		});
	}, [isLoaded, user, currentUser]);

	// Check if user is already onboarded and redirect
	useEffect(() => {
		if (isLoaded && currentUser && currentUser.onboardingCompleted) {
			console.log("User already onboarded, redirecting to dashboard");
			router.push("/dashboard");
		}
	}, [isLoaded, currentUser, router]);

	// Ensure user exists in Convex when they arrive on onboarding
	useEffect(() => {
		const ensureUserExists = async () => {
			if (isLoaded && user && currentUser === null) {
				console.log("User exists in Clerk but not in Convex, creating user...");
				try {
					await storeUser();
					console.log("User created successfully");
				} catch (error) {
					console.error("Failed to create user:", error);
				}
			}
		};

		ensureUserExists();
	}, [isLoaded, user, currentUser, storeUser]);

	const handleOnboardingComplete = async (data: OnboardingData) => {
		if (isProcessing) return;
		setIsProcessing(true);

		console.log("Starting onboarding completion with data:", data);

		try {
			if (user) {
				console.log("User authenticated, completing onboarding...");

				// Ensure user exists first
				if (currentUser === null) {
					console.log("Creating user before onboarding...");
					await storeUser();
				}

				// Validate that all required fields are present
				if (
					!data.goal ||
					!data.focus ||
					!data.subject ||
					!data.level ||
					!data.timeCommitment ||
					!data.schedule ||
					!data.recommendation ||
					!data.age
				) {
					toast.error("Please complete all onboarding steps");
					return;
				}

				// Complete onboarding with data - now all fields are guaranteed to be strings
				const result = await completeOnboarding({
					goal: data.goal,
					focus: data.focus,
					subject: data.subject,
					level: data.level,
					timeCommitment: data.timeCommitment,
					schedule: data.schedule,
					recommendation: data.recommendation,
					age: data.age,
				});

				console.log("Onboarding completed:", result);
				toast.success("Welcome to Masomo! Your learning journey begins now.");

				// Small delay to ensure data is saved before redirect
				setTimeout(() => {
					router.push("/dashboard");
				}, 1000);
			} else {
				console.log("User not authenticated, redirecting to sign up");
				toast.success("Let's create your account to save your preferences!");
				router.push("/sign-up");
			}
		} catch (error) {
			console.error("Failed to save onboarding data:", error);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleTryLesson = () => {
		if (user) {
			toast.success("Let's start with a quick lesson!");
			router.push("/dashboard");
		} else {
			toast.success("Sign up to try your first lesson!");
			router.push("/sign-up");
		}
	};

	// Show loading while checking authentication and user status
	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-kenya-green border-b-2" />
					<p className="text-muted-foreground">Loading authentication...</p>
				</div>
			</div>
		);
	}

	// If user is authenticated but we're still loading currentUser
	if (user && currentUser === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-kenya-green border-b-2" />
					<p className="text-muted-foreground">
						Setting up your learning experience...
					</p>
					<p className="text-muted-foreground text-sm">This won't take long!</p>
				</div>
			</div>
		);
	}

	return (
		<FirstTimeFlow
			onComplete={handleOnboardingComplete}
			onTryLesson={handleTryLesson}
			disabled={isProcessing}
		/>
	);
}
