"use client"

import { BookOpen, GraduationCap, Users } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { LevelCard } from "./level-card"

export function LearningLevels() {
  const levels = [
    {
      icon: BookOpen,
      title: "Primary & Junior Secondary",
      description: "Foundation courses covering CBC curriculum with interactive animations and engaging content.",
      features: ["Mathematics & Science", "English & Kiswahili", "Social Studies"],
      buttonText: "Explore Courses",
      href: "/courses/primary",
    },
    {
      icon: GraduationCap,
      title: "Senior Secondary",
      description: "Advanced preparation for KCSE with comprehensive practice tests and past papers.",
      features: ["KCSE Preparation", "University Entry Prep", "Subject Specialization"],
      buttonText: "Get Started",
      featured: true,
      href: "/courses/secondary",
    },
    {
      icon: Users,
      title: "University",
      description: "Advanced courses, research materials, and professional development resources.",
      features: ["Degree Programs", "Research Projects", "Career Preparation"],
      buttonText: "Start Learning",
      href: "/courses/university",
    },
  ]

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <FadeIn delay={0.1}>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Learn at <span className="text-primary">your level</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground">
              Tailored content for every stage of your Kenyan educational journey
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid gap-8 md:grid-cols-3">
          {levels.map((level) => (
            <Link key={level.title} href={level.href}>
              <LevelCard {...level} />
            </Link>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

