"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { OnboardingFlow } from "./onboarding-flow";

interface FirstTimeFlowProps {
	onComplete: (data: any) => void;
	onTryLesson?: () => void;
}

export function FirstTimeFlow({ onComplete, onTryLesson }: FirstTimeFlowProps) {
	const { user, isLoaded } = useUser();
	const currentUser = useQuery(api.users.current);
	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		if (isLoaded && user) {
			// Check if user has completed onboarding
			if (currentUser && !currentUser.onboardingCompleted) {
				setShowOnboarding(true);
			} else if (currentUser?.onboardingCompleted) {
				// User has already completed onboarding, redirect to dashboard
				window.location.href = "/dashboard";
			} else if (!currentUser) {
				// New user, show onboarding
				setShowOnboarding(true);
			}
		} else if (isLoaded && !user) {
			// Not authenticated, show onboarding anyway for demo purposes
			setShowOnboarding(true);
		}
	}, [isLoaded, user, currentUser]);

	if (!showOnboarding) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-kenya-green border-t-transparent" />
					<p className="text-gray-600">
						Setting up your learning experience...
					</p>
				</div>
			</div>
		);
	}

	return <OnboardingFlow onComplete={onComplete} onTryLesson={onTryLesson} />;
}
