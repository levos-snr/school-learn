"use client";

import { OnboardingLayout } from "../onboarding-layout";

interface LetsStartStepProps {
	onBack: () => void;
	onContinue: () => void;
}

export function LetsStartStep({ onBack, onContinue }: LetsStartStepProps) {
	return (
		<OnboardingLayout
			currentStep={13}
			totalSteps={17}
			mascotText="Let's start learning! You'll get a little smarter every day—starting now."
			onBack={onBack}
			onContinue={onContinue}
			showMascot={true}
		>
			<div className="py-8 text-center">
				<div className="space-y-4">
					<h1 className="font-medium text-gray-800 text-xl">
						Ready to begin your journey?
					</h1>
					<p className="text-gray-600 text-sm">
						Your personalized learning experience awaits!
					</p>
				</div>
			</div>
		</OnboardingLayout>
	);
}
