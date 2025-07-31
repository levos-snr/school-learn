"use client";

interface CourseDetailStepProps {
	onBack: () => void;
	onContinue: () => void;
}

export function CourseDetailStep({
	onBack,
	onContinue,
}: CourseDetailStepProps) {
	const courses = [
		{
			id: "thinking",
			title: "Thinking in Code",
			subtitle: "Programming with Variables",
			icon: "💻",
			iconBg: "bg-purple-100",
			badge: "START HERE",
			badgeColor: "bg-purple-500 text-white",
			featured: true,
		},
		{
			id: "python",
			title: "Programming with Python",
			icon: "🐍",
			iconBg: "bg-blue-100",
		},
		{
			id: "functions",
			title: "Programming with Functions",
			subtitle: "Greedy Algorithms",
			icon: "⚡",
			iconBg: "bg-yellow-100",
		},
		{
			id: "ai",
			title: "How AI Works",
			subtitle: "Computer Science Fundamentals",
			icon: "🤖",
			iconBg: "bg-gray-100",
		},
		{
			id: "neural",
			title: "Introduction to Neural Networks",
			icon: "🧠",
			iconBg: "bg-purple-100",
		},
	];

	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			{/* Header */}
			<div className="flex items-center justify-between p-4">
				<button type="button" onClick={onBack} className="p-2">
					<svg
						className="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-label="Go back"
					>
						<title>Go back</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<div className="flex-1" />
			</div>

			{/* Course Header */}
			<div className="mb-8 px-6 text-center">
				<div className="mb-2 flex items-center justify-center space-x-2">
					<span className="text-2xl">💜</span>
					<h1 className="font-bold text-2xl">Programming & CS</h1>
				</div>
				<p className="text-gray-600">Speak the language of computers</p>
			</div>

			{/* Course Grid */}
			<div className="flex-1 px-6">
				<div className="mx-auto grid max-w-md grid-cols-1 gap-4">
					{courses.map((course, index) => (
						<div
							key={course.id}
							className={`relative rounded-xl border p-4 transition-all duration-200 ${course.featured ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-white"} ${index === 0 ? "ring-2 ring-purple-200" : ""} `}
						>
							{course.badge && (
								<div
									className={`absolute top-2 right-2 rounded px-2 py-1 font-bold text-xs ${course.badgeColor}`}
								>
									{course.badge}
								</div>
							)}
							<div className="flex items-center space-x-3">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-lg ${course.iconBg}`}
								>
									<span className="text-2xl">{course.icon}</span>
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900">
										{course.title}
									</h3>
									{course.subtitle && (
										<p className="mt-1 text-gray-600 text-sm">
											{course.subtitle}
										</p>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Continue Button */}
			<div className="p-6">
				<button
					type="button"
					onClick={onContinue}
					className="w-full rounded-xl bg-gray-800 py-3 font-semibold text-white transition-colors hover:bg-gray-900"
				>
					Continue
				</button>
			</div>
		</div>
	);
}
