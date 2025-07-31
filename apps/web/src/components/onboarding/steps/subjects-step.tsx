"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface SubjectsStepProps {
	onBack: () => void;
	onContinue: (subject: string) => void;
}

export function SubjectsStep({ onBack, onContinue }: SubjectsStepProps) {
	const [selectedSubject, setSelectedSubject] = useState<string>("");

	const subjects = [
		{
			id: "math",
			icon: "🔷",
			title: "Math",
			description: "",
		},
		{
			id: "science",
			icon: "🥇",
			title: "Science & Engineering",
			description: "",
		},
		{
			id: "programming",
			icon: "💜",
			title: "Computer Science & Programming",
			description: "",
		},
		{
			id: "data",
			icon: "🟠",
			title: "Data Science & Data Analysis",
			description: "",
		},
	];

	return (
		<OnboardingLayout
			currentStep={5}
			totalSteps={10}
			mascotText="A logical choice."
			onBack={onBack}
			onContinue={() => onContinue(selectedSubject)}
			canContinue={!!selectedSubject}
		>
			<div className="space-y-3">
				{subjects.map((subject) => (
					<button
						key={subject.id}
						type="button"
						onClick={() => setSelectedSubject(subject.id)}
						className={`flex w-full items-center space-x-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
							selectedSubject === subject.id
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white hover:border-gray-300"
						} `}
					>
						<span className="text-xl">{subject.icon}</span>
						<span className="font-medium text-gray-900">{subject.title}</span>
					</button>
				))}
			</div>
		</OnboardingLayout>
	);
}
