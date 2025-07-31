"use client";

import { OnboardingLayout } from "../onboarding-layout";

interface TestimonialStepProps {
	onBack: () => void;
	onContinue: () => void;
}

export function TestimonialStep({ onBack, onContinue }: TestimonialStepProps) {
	return (
		<OnboardingLayout
			currentStep={15}
			totalSteps={17}
			mascotText=""
			onBack={onBack}
			onContinue={onContinue}
			showMascot={false}
		>
			<div className="space-y-6 text-center">
				<h1 className="font-bold text-2xl text-gray-900">
					You're on your way now!
				</h1>

				{/* 5 Stars */}
				<div className="flex justify-center space-x-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<svg
							key={star}
							className="h-6 w-6 fill-current text-yellow-400"
							viewBox="0 0 24 24"
						>
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
					))}
				</div>

				{/* Testimonial */}
				<div className="rounded-xl bg-gray-50 p-6">
					<div className="mx-auto mb-4 h-10 w-16 rounded-full bg-teal-400 opacity-80" />
					<blockquote className="mb-4 text-gray-700 text-sm italic leading-relaxed">
						"Through its engaging and well-structured courses, Brilliant has
						taught me mathematical concepts that I previously struggled to
						understand. I now feel confident approaching both technical job
						interviews and real world problem-solving situations."
					</blockquote>
					<cite className="text-gray-500 text-sm">— Jacob S.</cite>
				</div>
			</div>
		</OnboardingLayout>
	);
}
