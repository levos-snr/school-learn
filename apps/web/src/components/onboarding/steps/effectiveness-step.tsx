"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface EffectivenessStepProps {
	onBack: () => void;
	onContinue: (effectiveness: string) => void;
}

export function EffectivenessStep({
	onBack,
	onContinue,
}: EffectivenessStepProps) {
	const [selectedEffectiveness, setSelectedEffectiveness] =
		useState<string>("");

	const effectivenessOptions = [
		{
			id: "visual",
			icon: "👁️",
			title: "Visual learning",
			description: "Seeing and visualizing",
		},
		{
			id: "hands-on",
			icon: "✋",
			title: "Learning by doing",
			description: "Hands-on practice",
		},
		{
			id: "auditory",
			icon: "👂",
			title: "Auditory learning",
			description: "Listening and discussing",
		},
		{
			id: "reading",
			icon: "📚",
			title: "Reading/writing",
			description: "Text-based learning",
		},
	];

	return (
		<OnboardingLayout
			currentStep={7}
			totalSteps={10}
			mascotText="How do you learn most effectively?"
			onBack={onBack}
			onContinue={() => onContinue(selectedEffectiveness)}
			canContinue={!!selectedEffectiveness}
		>
			<div className="space-y-3">
				{effectivenessOptions.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setSelectedEffectiveness(option.id)}
						className={`w-full rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedEffectiveness === option.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<div className="flex items-center space-x-3">
							<span className="text-xl">{option.icon}</span>
							<div>
								<div className="font-medium text-gray-900">{option.title}</div>
								<div className="text-gray-600 text-sm">
									{option.description}
								</div>
							</div>
						</div>
					</button>
				))}
			</div>
		</OnboardingLayout>
	);
}
