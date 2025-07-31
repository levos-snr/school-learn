"use client";

import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface RecommendationsStepProps {
	onBack: () => void;
	onContinue: (recommendation: string) => void;
}

export function RecommendationsStep({
	onBack,
	onContinue,
}: RecommendationsStepProps) {
	const [selectedPath, setSelectedPath] = useState<string>("programming");

	const learningPaths = [
		{
			id: "programming",
			title: "Programming & CS",
			subtitle: "LEARNING PATH • 8 COURSES",
			description: "Speak the language of computers",
			color: "border-purple-300 bg-purple-50",
			iconBg: "bg-purple-100",
			icon: "💜",
			badge: "TOP PICK",
			badgeColor: "bg-yellow-400 text-black",
		},
		{
			id: "data",
			title: "Data Analysis",
			subtitle: "LEARNING PATH • 5 COURSES",
			description: "Know your stuff in probability and data analysis",
			color: "border-orange-300 bg-orange-50",
			iconBg: "bg-orange-100",
			icon: "🟠",
		},
	];

	const individualCourses = [
		{
			id: "scientific",
			title: "Scientific Thinking",
			subtitle: "1 COURSE",
			description:
				"Open your eyes to the world around you by solving puzzles with science.",
			icon: "💡",
			iconBg: "bg-yellow-100",
		},
		{
			id: "probability",
			title: "Probability and Chance",
			subtitle: "1 COURSE",
			description: "Use probability to make better decisions.",
			icon: "🎲",
			iconBg: "bg-blue-100",
		},
	];

	return (
		<OnboardingLayout
			currentStep={11}
			totalSteps={17}
			mascotText="Here's what I recommend. Get started with one and switch any time."
			onBack={onBack}
			onContinue={() => onContinue(selectedPath)}
			canContinue={!!selectedPath}
		>
			<div className="space-y-4">
				{/* Learning Paths */}
				<div className="grid grid-cols-1 gap-3">
					{learningPaths.map((path) => (
						<button
							key={path.id}
							type="button"
							onClick={() => setSelectedPath(path.id)}
							className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${selectedPath === path.id ? path.color : "border-gray-200 bg-white hover:border-gray-300"} `}
						>
							{path.badge && (
								<div
									className={`absolute top-2 right-2 rounded-full px-2 py-1 font-bold text-xs ${path.badgeColor}`}
								>
									{path.badge}
								</div>
							)}
							<div className="flex items-start space-x-3">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-lg ${path.iconBg}`}
								>
									<span className="text-2xl">{path.icon}</span>
								</div>
								<div className="flex-1">
									<div className="mb-1 font-medium text-gray-500 text-xs">
										{path.subtitle}
									</div>
									<h3 className="mb-1 font-bold text-gray-900">{path.title}</h3>
									<p className="text-gray-600 text-sm">{path.description}</p>
								</div>
							</div>
						</button>
					))}
				</div>

				{/* Individual Courses */}
				<div className="grid grid-cols-1 gap-3">
					{individualCourses.map((course) => (
						<button
							key={course.id}
							type="button"
							onClick={() => setSelectedPath(course.id)}
							className={`rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${selectedPath === course.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"} `}
						>
							<div className="flex items-start space-x-3">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-lg ${course.iconBg}`}
								>
									<span className="text-xl">{course.icon}</span>
								</div>
								<div className="flex-1">
									<div className="mb-1 font-medium text-gray-500 text-xs">
										{course.subtitle}
									</div>
									<h3 className="mb-1 font-semibold text-gray-900">
										{course.title}
									</h3>
									<p className="text-gray-600 text-xs">{course.description}</p>
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</OnboardingLayout>
	);
}
