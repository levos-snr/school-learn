"use client";

interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
	className?: string;
}

export function ProgressBar({
	currentStep,
	totalSteps,
	className = "",
}: ProgressBarProps) {
	const progress = (currentStep / totalSteps) * 100;

	return (
		<div className={`w-full ${className}`}>
			<div className="h-2 w-full rounded-full bg-gray-200">
				<div
					className="h-2 rounded-full bg-kenya-green transition-all duration-500 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}
