"use client"

import { ArrowRight, Award, BookOpen, Brain, Play, Target } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { FloatingElement } from "@/components/motion/floating-element"
import { SlideIn } from "@/components/motion/slide-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn delay={0.1}>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Master knowledge
              <br />
              <SlideIn delay={0.3} direction="right">
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  through practice
                </span>
              </SlideIn>
            </h1>
          </FadeIn>

          <FadeIn delay={0.5}>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Comprehensive learning platform for junior high, senior high, and university students. Learn, practice,
              test, and excel in your academic journey with Kenya's premier educational technology.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <FadeIn>
              <Link href="/sign-up">
                <Button size="lg" className="group">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </FadeIn>
            <FadeIn>
              <Button size="lg" variant="outline" className="group bg-transparent">
                <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Watch Demo
              </Button>
            </FadeIn>
          </StaggerContainer>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 -z-10">
          <FloatingElement delay={0} intensity={12} className="absolute left-[10%] top-[20%] hidden lg:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </FloatingElement>

          <FloatingElement delay={1} intensity={10} className="absolute right-[15%] top-[25%] hidden lg:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <Brain className="h-6 w-6 text-secondary-foreground" />
            </div>
          </FloatingElement>

          <FloatingElement delay={2} intensity={15} className="absolute left-[20%] bottom-[30%] hidden lg:block">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
              <Award className="h-7 w-7 text-accent-foreground" />
            </div>
          </FloatingElement>

          <FloatingElement delay={1.5} intensity={8} className="absolute right-[25%] bottom-[35%] hidden lg:block">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </FloatingElement>
        </div>
      </div>
    </section>
  )
}

