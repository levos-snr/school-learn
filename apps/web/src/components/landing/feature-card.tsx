"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	iconColor: string;
	iconBgColor: string;
	delay?: string;
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
	iconColor,
	iconBgColor,
	delay = "",
}: FeatureCardProps) {
	return (
		<Card className={`learning-card ${delay}`}>
			<CardContent className="p-6">
				<div
					className="floating-icon-block mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
					style={{ backgroundColor: iconBgColor }}
				>
					<Icon className={`h-6 w-6 ${iconColor}`} />
				</div>
				<h3 className="mb-2 font-semibold text-xl">{title}</h3>
				<p style={{ color: "var(--color-muted-foreground)" }}>{description}</p>
			</CardContent>
		</Card>
	);
}
