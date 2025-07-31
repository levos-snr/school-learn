"use client";

import type { ReactNode } from "react";

interface OptionCardProps {
	icon: ReactNode;
	title: string;
	description?: string;
	isSelected?: boolean;
	onClick: () => void;
	className?: string;
}

export function OptionCard({
	icon,
	title,
	description,
	isSelected = false,
	onClick,
	className = "",
}: OptionCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
				isSelected
					? "border-kenya-green bg-kenya-green/5 shadow-md"
					: "border-gray-200 bg-white hover:border-gray-300"
			} ${className} `}
		>
			<div className="flex items-center space-x-3">
				<div
					className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? "bg-kenya-green text-white" : "bg-gray-100 text-gray-600"} `}
				>
					{icon}
				</div>
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900">{title}</h3>
					{description && (
						<p className="mt-1 text-gray-600 text-sm">{description}</p>
					)}
				</div>
			</div>
		</button>
	);
}
