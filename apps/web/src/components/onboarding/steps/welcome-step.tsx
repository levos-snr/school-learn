"use client";

import { useUser } from "@clerk/nextjs";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface WelcomeStepProps {
	onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
	const { user } = useUser();

	return (
		<OnboardingLayout
			currentStep={1}
			totalSteps={10}
			mascotText={`Hi ${user?.firstName || "there"}! I'm your learning companion.`}
			onContinue={onContinue}
			showBack={false}
		>
			<div className="space-y-6 text-center">
				<h1 className="font-bold text-3xl text-gray-900">Welcome to Masomo</h1>
				<p className="text-gray-600 text-lg">
					Let's create a personalized learning experience just for you. I'll ask
					you a few questions to get started.
				</p>
			</div>
		</OnboardingLayout>
	);
}
