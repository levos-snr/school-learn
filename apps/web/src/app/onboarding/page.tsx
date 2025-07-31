"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
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
	const { user } = useUser();
	const updateUserPreferences = useMutation(api.users.updatePreferences);
	const storeUser = useMutation(api.users.store);

	const handleOnboardingComplete = async (data: OnboardingData) => {
		try {
			// If user is authenticated, store them first if needed
			if (user) {
				await storeUser();

				// Update preferences with onboardingCompleted set to true
				await updateUserPreferences({
					preferences: {
						goal: data.goal || "",
						focus: data.focus || "",
						subject: data.subject || "",
						level: data.level || "",
						timeCommitment: data.timeCommitment || "15",
						schedule: data.schedule || "",
						recommendation: data.recommendation || "",
						age: data.age || "",
						onboardingCompleted: true, // This is the key fix
					},
				});

				toast.success("Welcome to Masomo! Your learning journey begins now.");
				router.push("/dashboard");
			} else {
				// For non-authenticated users, redirect to sign up with onboarding data
				toast.success("Let's create your account to save your preferences!");
				router.push("/sign-up");
			}
		} catch (error) {
			console.error("Failed to save onboarding data:", error);
			toast.error("Something went wrong. Please try again.");
		}
	};

	const handleTryLesson = () => {
		if (user) {
			// Authenticated user trying a lesson
			toast.success("Let's start with a quick lesson!");
			router.push("/dashboard");
		} else {
			// Non-authenticated user, redirect to sign up
			toast.success("Sign up to try your first lesson!");
			router.push("/sign-up");
		}
	};

	return (
		<FirstTimeFlow
			onComplete={handleOnboardingComplete}
			onTryLesson={handleTryLesson}
		/>
	);
}
