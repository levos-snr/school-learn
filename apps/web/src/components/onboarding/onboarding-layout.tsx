"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedMascot } from "./animated-mascot";
import { ProgressBar } from "./progress-bar";
import { SpeechBubble } from "./speech-bubble";

interface OnboardingLayoutProps {
	currentStep: number;
	totalSteps: number;
	mascotText: string;
	children: ReactNode;
	onBack?: () => void;
	onContinue: () => void;
	canContinue?: boolean;
	showMascot?: boolean;
}

export function OnboardingLayout({
	currentStep,
	totalSteps,
	mascotText,
	children,
	onBack,
	onContinue,
	canContinue = true,
	showMascot = true,
}: OnboardingLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			{/* Header */}
			<div className="flex items-center justify-between p-4">
				{onBack ? (
					<Button variant="ghost" size="icon" onClick={onBack}>
						<ChevronLeft className="h-5 w-5" />
					</Button>
				) : (
					<div className="w-10" />
				)}

				<ProgressBar
					currentStep={currentStep}
					totalSteps={totalSteps}
					className="mx-4 flex-1"
				/>

				<div className="w-10" />
			</div>

			{/* Content */}
			<div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6">
				{showMascot && (
					<div className="mb-8 flex flex-col items-center">
						<AnimatedMascot size="lg" className="mb-4" />
						<SpeechBubble text={mascotText} />
					</div>
				)}

				<div className="mb-8 w-full space-y-4">{children}</div>

				<Button
					onClick={onContinue}
					disabled={!canContinue}
					className="w-full rounded-xl bg-gray-800 py-3 font-semibold text-white hover:bg-gray-900"
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
