"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface LevelsStepProps {
	onBack: () => void;
	onContinue: (level: string) => void;
}

export function LevelsStep({ onBack, onContinue }: LevelsStepProps) {
	const [selectedLevel, setSelectedLevel] = useState<string>("");

	const levels = [
		{
			id: "beginner",
			icon: "🌱",
			title: "Beginner",
			description: "New to this subject",
		},
		{
			id: "intermediate",
			icon: "🌿",
			title: "Intermediate",
			description: "Some experience",
		},
		{
			id: "advanced",
			icon: "🌳",
			title: "Advanced",
			description: "Experienced learner",
		},
	];

	return (
		<OnboardingLayout
			currentStep={6}
			totalSteps={10}
			mascotText="What's your experience level?"
			onBack={onBack}
			onContinue={() => onContinue(selectedLevel)}
			canContinue={!!selectedLevel}
		>
			<div className="space-y-3">
				{levels.map((level) => (
					<button
						key={level.id}
						type="button"
						onClick={() => setSelectedLevel(level.id)}
						className={`w-full rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedLevel === level.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<div className="flex items-center space-x-3">
							<span className="text-xl">{level.icon}</span>
							<div>
								<div className="font-medium text-gray-900">{level.title}</div>
								<div className="text-gray-600 text-sm">{level.description}</div>
							</div>
						</div>
					</button>
				))}
			</div>
		</OnboardingLayout>
	);
}
