"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SlideInProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
	direction?: "left" | "right" | "up" | "down";
	distance?: number;
	className?: string;
}

export function SlideIn({
	children,
	delay = 0,
	duration = 0.8,
	direction = "left",
	distance = 100,
	className = "",
}: SlideInProps) {
	const directionOffset = {
		left: { x: -distance, y: 0 },
		right: { x: distance, y: 0 },
		up: { x: 0, y: -distance },
		down: { x: 0, y: distance },
	};

	return (
		<motion.div
			className={className}
			initial={{
				opacity: 0,
				...directionOffset[direction],
			}}
			animate={{
				opacity: 1,
				x: 0,
				y: 0,
			}}
			transition={{
				duration,
				delay,
				ease: [0.25, 0.25, 0, 1],
			}}
		>
			{children}
		</motion.div>
	);
}
