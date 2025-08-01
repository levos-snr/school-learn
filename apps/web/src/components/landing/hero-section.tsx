"use client";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Award, BookOpen, Brain, Play, Target } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { FloatingElement } from "@/components/motion/floating-element";
import { SlideIn } from "@/components/motion/slide-in";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { Button } from "@/components/ui/button";

export function HeroSection() {
	const { isSignedIn } = useUser();
	return (
		<section className="mx-auto max-w-7xl px-6 py-20 text-center">
			<div className="mx-auto max-w-4xl">
				<FadeIn delay={0.2}>
					<h1
						className="mb-6 font-bold text-5xl md:text-7xl"
						style={{ color: "var(--color-foreground)" }}
					>
						Master knowledge
						<br />
						<SlideIn delay={0.5} direction="right">
							<span className="text-kenya-green">through practice</span>
						</SlideIn>
					</h1>
				</FadeIn>
				<FadeIn delay={0.8}>
					<p
						className="mx-auto mb-8 max-w-2xl text-xl"
						style={{ color: "var(--color-muted-foreground)" }}
					>
						Comprehensive learning platform for junior high, senior high, and
						university students. Learn, practice, test, and excel in your
						academic journey with Kenya's premier educational technology.
					</p>
				</FadeIn>
				<StaggerContainer
					staggerDelay={0.2}
					className="flex flex-col justify-center gap-4 sm:flex-row"
				>
					{/* Only show "Start Learning Free" button if user is NOT signed in */}
					{!isSignedIn && (
						<FadeIn delay={1.2}>
							<Link href="/sign-up">
								<Button
									size="lg"
									className="cta-button-primary floating-button-block"
								>
									Start Learning Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</FadeIn>
					)}
					<FadeIn delay={1.4}>
						<Button
							size="lg"
							variant="outline"
							className="floating-button-block bg-transparent"
						>
							<Play className="mr-2 h-4 w-4" />
							Watch Demo
						</Button>
					</FadeIn>
				</StaggerContainer>
			</div>
			{/* Floating Elements */}
			<div className="relative mt-16">
				<FloatingElement
					delay={0}
					intensity={15}
					className="absolute top-10 left-1/4"
				>
					<div className="flex h-16 w-16 items-center justify-center">
						<BookOpen className="h-8 w-8 text-kenya-green" />
					</div>
				</FloatingElement>
				<FloatingElement
					delay={1}
					intensity={12}
					className="absolute top-20 right-1/4"
				>
					<div className="flex h-12 w-12 items-center justify-center">
						<Brain className="h-6 w-6 text-maasai-blue" />
					</div>
				</FloatingElement>
				<FloatingElement delay={2} intensity={18} className="absolute left-1/3">
					<div className="flex h-14 w-14 items-center justify-center">
						<Award className="h-7 w-7 text-acacia-gold" />
					</div>
				</FloatingElement>
				<FloatingElement
					delay={1.5}
					intensity={10}
					className="absolute top-32 right-1/3"
				>
					<div className="flex h-10 w-10 items-center justify-center">
						<Target className="h-5 w-5 text-kenya-red" />
					</div>
				</FloatingElement>
			</div>
		</section>
	);
}
