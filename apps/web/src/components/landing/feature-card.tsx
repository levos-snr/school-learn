"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Card className="group h-full border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="flex-1 text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

