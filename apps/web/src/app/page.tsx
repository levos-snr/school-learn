"use client";

import Header from "@/components/header";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { LearningLevels } from "@/components/landing/learning-levels";
import { SocialProof } from "@/components/landing/social-proof";

/**
 * The landing page React component that composes the site's main sections.
 *
 * Renders the full landing page including header, hero, social proof, features,
 * learning levels, CTA, and footer. The component has no props and returns a
 * JSX element ready for client-side rendering.
 *
 * @returns The landing page JSX element.
 */
export default function LandingPage() {
	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: "var(--color-background)",
				color: "var(--color-foreground)",
			}}
		>
			<Header variant="landing" />
			<HeroSection />
			<SocialProof />
			<FeaturesSection />
			<LearningLevels />
			<CTASection />
			<Footer />
		</div>
	);
}
