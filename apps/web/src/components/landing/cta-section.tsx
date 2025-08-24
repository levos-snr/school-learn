"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary/80 py-20 text-primary-foreground">
      <div className="container mx-auto px-6 text-center">
        <FadeIn delay={0.1}>
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Ready to transform your learning?</h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mb-8 text-lg opacity-90 sm:text-xl">
            Join thousands of Kenyan students who are already excelling with Masomo. Start your journey today.
          </p>
        </FadeIn>

        <StaggerContainer className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <FadeIn>
            <Link href="/sign-up">
              <Button size="lg" className="group bg-background text-foreground hover:bg-background/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </FadeIn>
          <FadeIn>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              Contact Sales
            </Button>
          </FadeIn>
        </StaggerContainer>
      </div>
    </section>
  )
}

