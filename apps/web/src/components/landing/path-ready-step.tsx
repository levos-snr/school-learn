"use client";

interface PathReadyStepProps {
	onBack: () => void;
	onContinue: () => void;
	onTryLesson: () => void;
}

export function PathReadyStep({ onContinue, onTryLesson }: PathReadyStepProps) {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			{/* Header with Back Button */}
			<div className="flex items-center justify-between p-4">
				<button
					onClick={onBack}
					className="rounded-lg p-2 transition-colors hover:bg-gray-200"
					aria-label="Go back"
				>
					<svg
						className="h-6 w-6 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<div className="mx-4 flex-1">
					{/* Progress Bar */}
					<div className="h-2 w-full rounded-full bg-gray-200">
						<div className="h-2 w-full rounded-full bg-green-500" />
					</div>
				</div>
				<div className="w-10" /> {/* Spacer for balance */}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col items-center justify-center px-6">
				<div className="space-y-8 text-center">
					{/* 3D Illustration */}
					<div className="relative">
						<div className="relative mx-auto h-32 w-32">
							{/* Base blocks */}
							<div className="-translate-x-1/2 absolute bottom-0 left-1/2 transform">
								<div className="h-8 w-16 rounded-lg bg-blue-600 shadow-lg" />
								<div className="-mt-2 ml-2 h-6 w-12 rounded-lg bg-blue-500 shadow-lg" />
								<div className="-mt-1 ml-1 h-4 w-8 rounded-lg bg-blue-400 shadow-lg" />
							</div>
							{/* Mascot on top */}
							<div className="-translate-x-1/2 -translate-y-4 absolute top-0 left-1/2 transform">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
									<div className="flex space-x-1">
										<div className="h-2 w-2 rounded-full bg-white" />
										<div className="h-2 w-2 rounded-full bg-white" />
									</div>
									<div className="-translate-x-1/2 absolute bottom-2 left-1/2 h-1 w-3 transform rounded-full bg-white" />
								</div>
							</div>
							{/* Floating elements */}
							<div className="absolute top-4 right-0 h-4 w-6 rounded bg-yellow-400 shadow-lg" />
							<div className="absolute top-8 left-0 h-6 w-4 rounded bg-green-400 shadow-lg" />
						</div>
					</div>
					<div className="space-y-4">
						<h1 className="font-bold text-3xl text-gray-900">
							Your personalized learning path
							<br />
							is ready.
						</h1>
					</div>
					<div className="w-full max-w-sm space-y-4">
						<button
							onClick={onContinue}
							className="w-full rounded-xl bg-gray-800 py-4 font-semibold text-white transition-colors hover:bg-gray-900"
						>
							Create a free profile
						</button>
						<button
							onClick={onTryLesson}
							className="w-full py-2 font-medium text-gray-700 transition-colors hover:text-gray-900"
						>
							Try a lesson first
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
