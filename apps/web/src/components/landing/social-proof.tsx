"use client";

import { Star } from "lucide-react";

interface StatItemProps {
	value: string;
	label: string;
	color: string;
	delay?: string;
}

function StatItem({ value, label, color, delay = "" }: StatItemProps) {
	return (
		<div className={`${delay}`}>
			<div className={`font-bold text-3xl ${color}`}>{value}</div>
			<div className="text-gray-300">{label}</div>
		</div>
	);
}

export function SocialProof() {
	const stats = [
		{
			value: "50K+",
			label: "Active Students",
			color: "text-kenya-green",
			delay: "float-block",
		},
		{
			value: "1000+",
			label: "Courses",
			color: "text-acacia-gold",
			delay: "float-block-delay-1",
		},
		{
			value: "95%",
			label: "Pass Rate",
			color: "text-kenya-red",
			delay: "float-block-delay-2",
		},
		{
			value: "24/7",
			label: "Support",
			color: "text-sunset-orange",
			delay: "float-block-delay-3",
		},
	];

	// Create a stable array of star IDs for consistent keys
	const starIds = ["star-1", "star-2", "star-3", "star-4", "star-5"];

	return (
		<section className="bg-kenya-black py-16 text-kenya-white">
			<div className="mx-auto max-w-7xl px-6 text-center">
				<h2 className="float-block mb-8 font-bold text-3xl">
					Join thousands of Kenyan students excelling worldwide
				</h2>
				<div className="float-block-delay-1 mb-8 flex items-center justify-center space-x-2">
					{starIds.map((starId) => (
						<Star
							key={starId}
							className="h-6 w-6 fill-current text-acacia-gold"
						/>
					))}
					<span className="ml-4 text-lg">4.9/5 from 50,000+ students</span>
				</div>
				<div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
					{stats.map((stat) => (
						<StatItem key={stat.label} {...stat} />
					))}
				</div>
			</div>
		</section>
	);
}
