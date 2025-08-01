"use client";

import { ArrowRight, Award, BookOpen, Brain, Play, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
	return (
		<section className="mx-auto max-w-7xl px-6 py-20 text-center">
			<div className="mx-auto max-w-4xl">
				<h1
					className="float-block mb-6 font-bold text-5xl md:text-7xl"
					style={{ color: "var(--color-foreground)" }}
				>
					Master knowledge
					<br />
					<span className="floating-text-block float-block-delay-1 text-kenya-green">
						through practice
					</span>
				</h1>
				<p
					className="float-block-slow float-block-delay-2 mx-auto mb-8 max-w-2xl text-xl"
					style={{ color: "var(--color-muted-foreground)" }}
				>
					Comprehensive learning platform for junior high, senior high, and
					university students. Learn, practice, test, and excel in your academic
					journey with Kenya's premier educational technology.
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link href="/signup">
						<Button
							size="lg"
							className="cta-button-primary floating-button-block float-block-delay-3"
						>
							Start Learning Free
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
					<Button
						size="lg"
						variant="outline"
						className="floating-button-block float-block-delay-4 bg-transparent"
					>
						<Play className="mr-2 h-4 w-4" />
						Watch Demo
					</Button>
				</div>
			</div>

			{/* Floating Elements */}
			<div className="relative mt-16">
				<div className="floating-icon-block float-block absolute top-10 left-1/4 flex h-16 w-16 items-center justify-center">
					<BookOpen className="h-8 w-8 text-kenya-green" />
				</div>
				<div className="floating-icon-block float-block-slow float-block-delay-1 absolute top-20 right-1/4 flex h-12 w-12 items-center justify-center">
					<Brain className="h-6 w-6 text-maasai-blue" />
				</div>
				<div className="floating-icon-block float-block-fast float-block-delay-2 absolute bottom-10 left-1/3 flex h-14 w-14 items-center justify-center">
					<Award className="h-7 w-7 text-acacia-gold" />
				</div>
				<div className="floating-icon-block float-block-delay-3 absolute top-32 right-1/3 flex h-10 w-10 items-center justify-center">
					<Target className="h-5 w-5 text-kenya-red" />
				</div>
			</div>
		</section>
	);
}
