"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface FitInStepProps {
	onBack: () => void;
	onContinue: (fitIn: string) => void;
}

export function FitInStep({ onBack, onContinue }: FitInStepProps) {
	const [selectedFitIn, setSelectedFitIn] = useState<string>("");

	const fitInOptions = [
		{
			id: "student",
			icon: "🎓",
			title: "Student",
			description: "Learning for school or university",
		},
		{
			id: "professional",
			icon: "💼",
			title: "Professional",
			description: "Advancing my career",
		},
		{
			id: "parent",
			icon: "👨‍👩‍👧‍👦",
			title: "Parent",
			description: "Helping my children learn",
		},
		{
			id: "lifelong-learner",
			icon: "🌟",
			title: "Lifelong learner",
			description: "Learning for personal growth",
		},
		{
			id: "teacher",
			icon: "👩‍🏫",
			title: "Teacher",
			description: "Improving my teaching skills",
		},
		{
			id: "other",
			icon: "❓",
			title: "Other",
			description: "",
		},
	];

	return (
		<OnboardingLayout
			currentStep={4}
			totalSteps={10}
			mascotText="Which describes you best?"
			onBack={onBack}
			onContinue={() => onContinue(selectedFitIn)}
			canContinue={!!selectedFitIn}
		>
			<div className="space-y-3">
				{fitInOptions.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setSelectedFitIn(option.id)}
						className={`w-full rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedFitIn === option.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<div className="flex items-center space-x-3">
							<span className="text-xl">{option.icon}</span>
							<div>
								<div className="font-medium text-gray-900">{option.title}</div>
								{option.description && (
									<div className="text-gray-600 text-sm">
										{option.description}
									</div>
								)}
							</div>
						</div>
					</button>
				))}
			</div>
		</OnboardingLayout>
	);
}
