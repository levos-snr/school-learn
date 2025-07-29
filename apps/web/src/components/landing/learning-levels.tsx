"use client";

import { BookOpen, GraduationCap, Users } from "lucide-react";
import { LevelCard } from "./level-card";

export function LearningLevels() {
	const levels = [
		{
			icon: BookOpen,
			title: "Primary & Junior Secondary",
			description:
				"Foundation courses covering CBC curriculum with interactive animations and engaging content.",
			features: [
				"Mathematics & Science",
				"English & Kiswahili",
				"Social Studies",
			],
			buttonText: "Explore Courses",
			buttonVariant: "secondary" as const,
			iconBgColor: "var(--kenya-green)",
			iconColor: "text-kenya-white",
			delay: "float-block",
		},
		{
			icon: GraduationCap,
			title: "Senior Secondary",
			description:
				"Advanced preparation for KCSE with comprehensive practice tests and past papers.",
			features: [
				"KCSE Preparation",
				"University Entry Prep",
				"Subject Specialization",
			],
			buttonText: "Most Popular",
			buttonVariant: "primary" as const,
			iconBgColor: "var(--kenya-red)",
			iconColor: "text-kenya-white",
			delay: "float-block-delay-1",
			featured: true,
		},
		{
			icon: Users,
			title: "University",
			description:
				"Advanced courses, research materials, and professional development resources.",
			features: ["Degree Programs", "Research Projects", "Career Preparation"],
			buttonText: "Get Started",
			buttonVariant: "secondary" as const,
			iconBgColor: "var(--acacia-gold)",
			iconColor: "text-kenya-black",
			delay: "float-block-delay-2",
		},
	];

	return (
		<section
			className="py-20"
			style={{
				background:
					"linear-gradient(to right, color-mix(in oklch, var(--kenya-green) 5%, transparent), color-mix(in oklch, var(--acacia-gold) 5%, transparent))",
			}}
		>
			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-16 text-center">
					<h2
						className="float-block mb-4 font-bold text-4xl"
						style={{ color: "var(--color-foreground)" }}
					>
						Learn at
						<span className="floating-text-block float-block-delay-1 text-kenya-green">
							{" "}
							your level
						</span>
					</h2>
					<p
						className="float-block-slow float-block-delay-2 text-xl"
						style={{ color: "var(--color-muted-foreground)" }}
					>
						Tailored content for every stage of your Kenyan educational journey
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					{levels.map((level) => (
						<LevelCard key={level.title} {...level} />
					))}
				</div>
			</div>
		</section>
	);
}
