"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface TimeCommitmentStepProps {
	onBack: () => void;
	onContinue: (time: string) => void;
}

export function TimeCommitmentStep({
	onBack,
	onContinue,
}: TimeCommitmentStepProps) {
	const [selectedTime, setSelectedTime] = useState<string>("15");

	const timeOptions = [
		{ id: "5", title: "5 min", icon: "⏰" },
		{ id: "10", title: "10 min", icon: "⏰" },
		{ id: "15", title: "15 min", icon: "⏰" },
		{ id: "20", title: "20 min", icon: "⏰" },
	];

	return (
		<OnboardingLayout
			currentStep={8}
			totalSteps={10}
			mascotText="That's 547 lessons a year!"
			onBack={onBack}
			onContinue={() => onContinue(selectedTime)}
			canContinue={!!selectedTime}
		>
			<div className="space-y-3">
				{timeOptions.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setSelectedTime(option.id)}
						className={`flex w-full items-center space-x-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedTime === option.id
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
