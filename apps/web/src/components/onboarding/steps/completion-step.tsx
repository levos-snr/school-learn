"use client";

import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface CompletionStepProps {
	onContinue: () => void;
}

export function CompletionStep({ onContinue }: CompletionStepProps) {
	return (
		<OnboardingLayout
			currentStep={10}
			totalSteps={10}
			mascotText="Perfect! You're all set up."
			onContinue={onContinue}
			showBack={false}
		>
			<div className="space-y-6 text-center">
				<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-kenya-green">
					<svg
						className="h-12 w-12 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<div className="space-y-2">
					<h2 className="font-bold text-2xl text-gray-900">
						You're ready to learn!
					</h2>
					<p className="text-gray-600">
						Your personalized learning path has been created based on your
						preferences.
					</p>
				</div>
			</div>
		</OnboardingLayout>
	);
}
