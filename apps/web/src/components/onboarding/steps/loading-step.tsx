"use client";

import { useEffect } from "react";

interface LoadingStepProps {
	onComplete: () => void;
}

export function LoadingStep({ onComplete }: LoadingStepProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onComplete();
		}, 3000); // Show loading for 3 seconds

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
			<div className="space-y-8 text-center">
				{/* Loading Animation */}
				<div className="relative">
					<div className="mx-auto h-32 w-32">
						{/* Spinning circles */}
						<div className="absolute inset-0 rounded-full border-4 border-gray-200" />
						<div className="absolute inset-0 animate-spin rounded-full border-4 border-kenya-green border-t-transparent" />

						{/* Center mascot */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-kenya-green to-green-600 shadow-lg">
								<div className="flex space-x-1">
									<div className="h-2 w-2 rounded-full bg-white" />
									<div className="h-2 w-2 rounded-full bg-white" />
								</div>
								<div className="-translate-x-1/2 absolute bottom-2 left-1/2 h-1 w-3 transform rounded-full bg-white" />
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h1 className="font-bold text-2xl text-gray-900">
						Finding learning path recommendations for you...
					</h1>
					<div className="flex items-center justify-center space-x-1">
						<div className="h-2 w-2 animate-bounce rounded-full bg-kenya-green" />
						<div
							className="h-2 w-2 animate-bounce rounded-full bg-kenya-green"
							style={{ animationDelay: "0.1s" }}
						/>
						<div
							className="h-2 w-2 animate-bounce rounded-full bg-kenya-green"
							style={{ animationDelay: "0.2s" }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
