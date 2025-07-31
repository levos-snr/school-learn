"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface FocusStepProps {
	onBack: () => void;
	onContinue: (focus: string) => void;
}

export function FocusStep({ onBack, onContinue }: FocusStepProps) {
	const [selectedFocus, setSelectedFocus] = useState<string>("");

	const focusOptions = [
		{
			id: "skills",
			icon: "💻",
			title: "Learning specific skills",
			description: "",
		},
		{
			id: "curiosity",
			icon: "🌍",
			title: "Following my curiosity",
			description: "",
		},
		{
			id: "problem-solving",
			icon: "🧩",
			title: "Building my problem-solving skills",
			description: "",
		},
		{
			id: "basics",
			icon: "✏️",
			title: "Brushing up on the basics",
			description: "",
		},
		{
			id: "other",
			icon: "⚡",
			title: "Something else",
			description: "",
		},
	];

	return (
		<OnboardingLayout
			currentStep={3}
			totalSteps={10}
			mascotText="What do you want to focus on?"
			onBack={onBack}
			onContinue={() => onContinue(selectedFocus)}
			canContinue={!!selectedFocus}
		>
			<div className="space-y-3">
				{focusOptions.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setSelectedFocus(option.id)}
						className={`flex w-full items-center space-x-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedFocus === option.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<span className="text-xl">{option.icon}</span>
						<span className="font-medium text-gray-900">{option.title}</span>
					</button>
				))}
			</div>
		</OnboardingLayout>
	);
}
