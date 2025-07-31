"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface ScheduleStepProps {
	onBack: () => void;
	onContinue: (schedule: string) => void;
}

export function ScheduleStep({ onBack, onContinue }: ScheduleStepProps) {
	const [selectedSchedule, setSelectedSchedule] = useState<string>("");

	const scheduleOptions = [
		{
			id: "morning",
			icon: "☀️",
			title: "Morning routine",
			description: "during breakfast or my commute",
		},
		{
			id: "break",
			icon: "🥪",
			title: "Quick break",
			description: "during lunch or between activities",
		},
		{
			id: "night",
			icon: "🌙",
			title: "Nightly ritual",
			description: "after dinner or while in bed",
		},
		{
			id: "other",
			icon: "💻",
			title: "Another time",
			description: "in my day",
		},
	];

	return (
		<OnboardingLayout
			currentStep={9}
			totalSteps={10}
			mascotText="Learning and growing? Nice."
			onBack={onBack}
			onContinue={() => onContinue(selectedSchedule)}
			canContinue={!!selectedSchedule}
		>
			<div className="space-y-3">
				{scheduleOptions.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setSelectedSchedule(option.id)}
						className={`w-full rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedSchedule === option.id
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
