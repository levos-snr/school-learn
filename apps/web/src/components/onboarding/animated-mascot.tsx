"use client";

import { useEffect, useState } from "react";

interface AnimatedMascotProps {
	isActive?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function AnimatedMascot({
	isActive = true,
	size = "md",
	className = "",
}: AnimatedMascotProps) {
	const [isBlinking, setIsBlinking] = useState(false);
	const [isTalking, setIsTalking] = useState(false);

	// Blinking animation
	useEffect(() => {
		if (!isActive) return;

		const blinkInterval = setInterval(
			() => {
				setIsBlinking(true);
				setTimeout(() => setIsBlinking(false), 150);
			},
			3000 + Math.random() * 2000,
		);

		return () => clearInterval(blinkInterval);
	}, [isActive]);

	// Talking animation when active
	useEffect(() => {
		if (!isActive) return;

		const talkInterval = setInterval(
			() => {
				setIsTalking(true);
				setTimeout(() => setIsTalking(false), 500 + Math.random() * 1000);
			},
			2000 + Math.random() * 3000,
		);

		return () => clearInterval(talkInterval);
	}, [isActive]);

	const sizeClasses = {
		sm: "w-12 h-12",
		md: "w-16 h-16",
		lg: "w-24 h-24",
	};

	return (
		<div className={`${sizeClasses[size]} ${className} relative`}>
			<div
				className={`flex h-full w-full transform items-center justify-center rounded-2xl bg-gradient-to-br from-kenya-green to-green-600 transition-all duration-300 ${isActive ? "float-block" : ""} ${isTalking ? "scale-105" : "scale-100"} `}
				style={{
					boxShadow: isActive ? "0 0 20px rgba(34, 197, 94, 0.3)" : "none",
				}}
			>
				{/* Eyes */}
				<div className="flex space-x-1">
					<div
						className={`h-2 w-2 rounded-full bg-white transition-all duration-150 ${isBlinking ? "h-0.5" : "h-2"} `}
					/>
					<div
						className={`h-2 w-2 rounded-full bg-white transition-all duration-150 ${isBlinking ? "h-0.5" : "h-2"} `}
					/>
				</div>

				{/* Mouth */}
				<div
					className={`-translate-x-1/2 absolute bottom-2 left-1/2 h-1 w-3 transform rounded-full bg-white transition-all duration-200 ${isTalking ? "h-2 w-2" : "h-1 w-3"} `}
				/>
			</div>

			{/* Glow effect when active */}
			{isActive && (
				<div className="absolute inset-0 animate-pulse rounded-2xl bg-kenya-green opacity-20" />
			)}
		</div>
	);
}
