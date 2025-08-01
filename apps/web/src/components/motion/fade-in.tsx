"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
	direction?: "up" | "down" | "left" | "right";
	className?: string;
}

export function FadeIn({
	children,
	delay = 0,
	duration = 0.6,
	direction = "up",
	className = "",
}: FadeInProps) {
	const directionOffset = {
		up: { y: 40, x: 0 },
		down: { y: -40, x: 0 },
		left: { y: 0, x: 40 },
		right: { y: 0, x: -40 },
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
				y: 0,
				x: 0,
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
