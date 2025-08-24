"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

interface StatItemProps {
  value: string
  label: string
  color: string
}

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
}

function StatItem({ value, label, color }: StatItemProps) {
  return (
    <motion.div variants={statVariants} className="text-center">
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  )
}

export function SocialProof() {
  const stats = [
    {
      value: "50K+",
      label: "Active Students",
      color: "text-primary",
    },
    {
      value: "1000+",
      label: "Courses",
      color: "text-secondary-foreground",
    },
    {
      value: "95%",
      label: "Pass Rate",
      color: "text-accent-foreground",
    },
    {
      value: "24/7",
      label: "Support",
      color: "text-primary",
    },
  ]

  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="container mx-auto px-6 text-center">
        <FadeIn delay={0.1}>
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Join thousands of Kenyan students excelling worldwide</h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mb-8 flex items-center justify-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-4 text-sm text-muted-foreground">4.9/5 from 50,000+ students</span>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

