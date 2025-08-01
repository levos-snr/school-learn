"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	iconColor: string;
	iconBgColor: string;
}

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: "easeOut",
		},
	},
};

const hoverVariants = {
	hover: {
		y: -8,
		scale: 1.02,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
};

export function FeatureCard({
	icon: Icon,
	title,
	description,
	iconColor,
	iconBgColor,
}: FeatureCardProps) {
	return (
		<motion.div variants={cardVariants} whileHover="hover">
			<motion.div variants={hoverVariants}>
				<Card className="group h-full border-0 bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
					<CardContent className="p-6">
						<div
							className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
							style={{ backgroundColor: iconBgColor }}
						>
							<Icon className={`h-6 w-6 ${iconColor}`} />
						</div>
						<h3 className="mb-3 font-bold text-foreground text-xl transition-colors group-hover:text-primary">
							{title}
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							{description}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
