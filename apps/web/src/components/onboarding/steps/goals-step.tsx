"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface GoalsStepProps {
	onBack: () => void;
	onContinue: (goal: string) => void;
}

export function GoalsStep({ onBack, onContinue }: GoalsStepProps) {
	const [selectedGoal, setSelectedGoal] = useState<string>("");

	const goals = [
		{
			id: "learn-fundamentals",
			icon: "🎯",
			title: "Learn the fundamentals",
			description: "Build a strong foundation",
		},
		{
			id: "sharpen-skills",
			icon: "⚡",
			title: "Sharpen my thinking",
			description: "Improve problem-solving abilities",
		},
		{
			id: "advance-career",
			icon: "🚀",
			title: "Advance my career",
			description: "Gain skills for professional growth",
		},
		{
			id: "exercise-mind",
			icon: "🧠",
			title: "Exercise my mind",
			description: "Keep mentally sharp and engaged",
		},
		{
			id: "something-else",
			icon: "💡",
			title: "Something else",
			description: "",
		},
	];

	return (
		<OnboardingLayout
			currentStep={2}
			totalSteps={10}
			mascotText="What's your learning goal?"
			onBack={onBack}
			onContinue={() => onContinue(selectedGoal)}
			canContinue={!!selectedGoal}
		>
			<div className="space-y-3">
				{goals.map((goal) => (
					<button
						key={goal.id}
						type="button"
						onClick={() => setSelectedGoal(goal.id)}
						className={`w-full rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedGoal === goal.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<div className="flex items-center space-x-3">
							<span className="text-xl">{goal.icon}</span>
							<div>
								<div className="font-medium text-gray-900">{goal.title}</div>
								{goal.description && (
									<div className="text-gray-600 text-sm">
										{goal.description}
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
