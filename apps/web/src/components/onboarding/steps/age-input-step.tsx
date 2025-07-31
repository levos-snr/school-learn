"use client";

import type React from "react";
import { useState } from "react";

interface AgeInputStepProps {
	onContinue: (age: string) => void;
}

export function AgeInputStep({ onContinue }: AgeInputStepProps) {
	const [age, setAge] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (age) {
			onContinue(age);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-white">
			{/* Header */}
			<div className="p-4">
				<h1 className="font-bold text-3xl">Brilliant</h1>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col items-center justify-center px-6">
				<div className="w-full max-w-md space-y-6">
					<h2 className="text-center font-semibold text-2xl text-gray-900">
						Enter your age
					</h2>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="relative">
							<select
								value={age}
								onChange={(e) => setAge(e.target.value)}
								className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="">Age</option>
								{Array.from({ length: 83 }, (_, i) => i + 13).map(
									(ageOption) => (
										<option key={ageOption} value={ageOption}>
											{ageOption}
										</option>
									),
								)}
							</select>
							<div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-4 transform">
								<svg
									className="h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-label="Dropdown arrow"
								>
									<title>Dropdown arrow</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>

						<p className="text-red-500 text-sm">
							We didn't get this information from Google.
						</p>

						<button
							type="submit"
							disabled={!age}
							className="w-full rounded-lg bg-black py-4 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Submit
						</button>
					</form>

					<p className="text-center text-gray-500 text-sm">
						We need your age for essential product functions like resetting your
						password and notifications.
					</p>
				</div>
			</div>
		</div>
	);
}
