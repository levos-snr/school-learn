"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerContainerProps {
	children: ReactNode;
	staggerDelay?: number;
	className?: string;
}

export function StaggerContainer({
	children,
	staggerDelay = 0.1,
	className = "",
}: StaggerContainerProps) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}
