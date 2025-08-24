"use client";

import Header from "@/components/header";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { LearningLevels } from "@/components/landing/learning-levels";
import { SocialProof } from "@/components/landing/social-proof";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
     <Header variant="landing" />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
        <LearningLevels />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
