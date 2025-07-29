"use client";

import {
	Award,
	BookOpen,
	Download,
	FlaskConical,
	Target,
	Zap,
} from "lucide-react";
import { FeatureCard } from "./feature-card";

export function FeaturesSection() {
	const features = [
		{
			icon: BookOpen,
			title: "Interactive Learning",
			description:
				"Engage with dynamic content, animations, and interactive exercises designed for Kenyan curriculum.",
			iconColor: "text-kenya-green",
			iconBgColor: "color-mix(in oklch, var(--kenya-green) 10%, transparent)",
			delay: "float-block",
		},
		{
			icon: Target,
			title: "Practice Tests",
			description:
				"Test your knowledge with KCSE, KCPE, and university entrance exam practice questions.",
			iconColor: "text-kenya-red",
			iconBgColor: "color-mix(in oklch, var(--kenya-red) 10%, transparent)",
			delay: "float-block-delay-1",
		},
		{
			icon: Download,
			title: "Past Papers",
			description:
				"Access and download thousands of KNEC past papers and marking schemes.",
			iconColor: "text-acacia-gold",
			iconBgColor: "color-mix(in oklch, var(--acacia-gold) 20%, transparent)",
			delay: "float-block-delay-2",
		},
		{
			icon: FlaskConical,
			title: "Virtual Practicals",
			description:
				"Conduct virtual science experiments and practicals in a safe, interactive environment.",
			iconColor: "text-maasai-blue",
			iconBgColor: "color-mix(in oklch, var(--maasai-blue) 10%, transparent)",
			delay: "float-block-delay-3",
		},
		{
			icon: Zap,
			title: "Smart Revision",
			description:
				"AI-powered revision system that adapts to your learning pace and identifies weak areas.",
			iconColor: "text-sunset-orange",
			iconBgColor: "color-mix(in oklch, var(--sunset-orange) 10%, transparent)",
			delay: "float-block-delay-4",
		},
		{
			icon: Award,
			title: "Progress Tracking",
			description:
				"Monitor your learning progress with detailed analytics and achievement badges.",
			iconColor: "text-kenya-green",
			iconBgColor: "color-mix(in oklch, var(--kenya-green) 10%, transparent)",
			delay: "float-block",
		},
	];

	return (
		<section id="features" className="mx-auto max-w-7xl px-6 py-20">
			<div className="mb-16 text-center">
				<h2
					className="float-block mb-4 font-bold text-4xl"
					style={{ color: "var(--color-foreground)" }}
				>
					Learning features that
					<span className="floating-text-block float-block-delay-1 text-kenya-green">
						{" "}
						work
					</span>
				</h2>
				<p
					className="float-block-slow float-block-delay-2 mx-auto max-w-2xl text-xl"
					style={{ color: "var(--color-muted-foreground)" }}
				>
					Everything you need to succeed in your academic journey, from
					interactive lessons to practical assessments.
				</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{features.map((feature) => (
					<FeatureCard key={feature.title} {...feature} />
				))}
			</div>
		</section>
	);
}
