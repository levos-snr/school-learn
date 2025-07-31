"use client";

import { CheckCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LevelCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	features: string[];
	buttonText: string;
	buttonVariant: "primary" | "secondary";
	iconBgColor: string;
	iconColor: string;
	delay?: string;
	featured?: boolean;
	href?: string;
}

export function LevelCard({
	icon: Icon,
	title,
	description,
	features,
	buttonText,
	buttonVariant,
	iconBgColor,
	iconColor,
	delay = "",
	featured = false,
}: LevelCardProps) {
	const cardStyle = featured
		? {
				backgroundColor: "var(--color-card)",
				border:
					"2px solid color-mix(in oklch, var(--kenya-red) 20%, transparent)",
			}
		: { backgroundColor: "var(--color-card)" };

	return (
		<Card
			className={`learning-card cursor-pointer text-center transition-shadow hover:shadow-xl ${delay}`}
			style={cardStyle}
		>
			<CardContent className="p-8">
				<div
					className="floating-icon-block mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
					style={{ backgroundColor: iconBgColor }}
				>
					<Icon className={`h-8 w-8 ${iconColor}`} />
				</div>
				<h3 className="mb-4 font-bold text-2xl">{title}</h3>
				<p className="mb-6" style={{ color: "var(--color-muted-foreground)" }}>
					{description}
				</p>
				<ul className="mb-6 space-y-2 text-left">
					{features.map((feature) => (
						<li key={feature} className="flex items-center">
							<CheckCircle className="mr-2 h-4 w-4 text-kenya-green" />
							{feature}
						</li>
					))}
				</ul>
				<Button
					className={`w-full ${
						buttonVariant === "primary"
							? "cta-button-primary"
							: "cta-button-secondary"
					} floating-button-block`}
				>
					{buttonText}
				</Button>
			</CardContent>
		</Card>
	);
}
