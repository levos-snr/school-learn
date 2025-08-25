"use client"

import { Award, BookOpen, Download, FlaskConical, Target, Zap } from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { FeatureCard } from "./feature-card"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Engage with dynamic content, animations, and interactive exercises designed for Kenyan curriculum.",
    },
    {
      icon: Target,
      title: "Practice Tests",
      description: "Test your knowledge with KCSE, KCPE, and university entrance exam practice questions.",
    },
    {
      icon: Download,
      title: "Past Papers",
      description: "Access and download thousands of KNEC past papers and marking schemes.",
    },
    {
      icon: FlaskConical,
      title: "Virtual Practicals",
      description: "Conduct virtual science experiments and practicals in a safe, interactive environment.",
    },
    {
      icon: Zap,
      title: "Smart Revision",
      description: "AI-powered revision system that adapts to your learning pace and identifies weak areas.",
    },
    {
      icon: Award,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and achievement badges.",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <FadeIn delay={0.1}>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Learning features that <span className="text-primary">work</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to succeed in your academic journey, from interactive lessons to practical
              assessments.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

