"use client";

import { OnboardingFlow } from "./onboarding-flow";

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

interface FirstTimeFlowProps {
	onComplete: (data: OnboardingData) => void;
	onTryLesson?: () => void;
	disabled?: boolean;
}

export function FirstTimeFlow({
	onComplete,
	onTryLesson,
	disabled = false,
}: FirstTimeFlowProps) {
	return (
		<div className="min-h-screen bg-background">
			<OnboardingFlow
				onComplete={onComplete}
				onTryLesson={onTryLesson}
				disabled={disabled}
			/>
		</div>
	);
}
