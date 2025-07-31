"use client";

interface LetsStartStepProps {
	onContinue: () => void;
}

export function LetsStartStep({ onContinue }: LetsStartStepProps) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
			<div className="max-w-md space-y-8 text-center">
				{/* Mascot */}
				<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-kenya-green to-green-600 shadow-lg">
					<div className="flex space-x-1">
						<div className="h-3 w-3 rounded-full bg-white" />
						<div className="h-3 w-3 rounded-full bg-white" />
					</div>
					<div className="absolute mt-4 h-2 w-4 rounded-full bg-white" />
				</div>

				<div className="space-y-4">
					<h1 className="font-bold text-3xl text-gray-900">
						Let's start learning
					</h1>
					<p className="text-gray-600 text-lg">
						We'll create a personalized learning path just for you.
					</p>
				</div>

				<button
					type="button"
					onClick={onContinue}
					className="w-full rounded-xl bg-gray-800 py-4 font-semibold text-white transition-colors hover:bg-gray-900"
				>
					Get started
				</button>
			</div>
		</div>
	);
}
