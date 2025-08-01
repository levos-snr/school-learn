"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer } from "@/components/motion/stagger-container";

interface StatItemProps {
	value: string;
	label: string;
	color: string;
}

const statVariants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.6,
			ease: "easeOut",
		},
	},
};

function StatItem({ value, label, color }: StatItemProps) {
	return (
		<motion.div variants={statVariants}>
			<div className={`font-bold text-3xl ${color}`}>{value}</div>
			<div className="text-gray-300">{label}</div>
		</motion.div>
	);
}

export function SocialProof() {
	const stats = [
		{
			value: "50K+",
			label: "Active Students",
			color: "text-kenya-green",
		},
		{
			value: "1000+",
			label: "Courses",
			color: "text-acacia-gold",
		},
		{
			value: "95%",
			label: "Pass Rate",
			color: "text-kenya-red",
		},
		{
			value: "24/7",
			label: "Support",
			color: "text-sunset-orange",
		},
	];

	const starIds = ["star-1", "star-2", "star-3", "star-4", "star-5"];

	return (
		<section className="bg-kenya-black py-16 text-kenya-white">
			<div className="mx-auto max-w-7xl px-6 text-center">
				<FadeIn delay={0.2}>
					<h2 className="mb-8 font-bold text-3xl">
						Join thousands of Kenyan students excelling worldwide
					</h2>
				</FadeIn>
				<FadeIn delay={0.4}>
					<div className="mb-8 flex items-center justify-center space-x-2">
						{starIds.map((starId) => (
							<Star
								key={starId}
								className="h-6 w-6 fill-current text-acacia-gold"
							/>
						))}
						<span className="ml-4 text-lg">4.9/5 from 50,000+ students</span>
					</div>
				</FadeIn>
				<StaggerContainer className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
					{stats.map((stat) => (
						<StatItem key={stat.label} {...stat} />
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}
