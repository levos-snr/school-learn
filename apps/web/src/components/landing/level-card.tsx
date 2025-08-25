"use client"

import { CheckCircle, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface LevelCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  buttonText: string
  featured?: boolean
  href?: string
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

export function LevelCard({ icon: Icon, title, description, features, buttonText, featured = false }: LevelCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Card
        className={`group h-full cursor-pointer text-center transition-all duration-300 hover:shadow-xl ${
          featured ? "border-primary/50 bg-primary/5 shadow-lg" : "border-border bg-card shadow-sm"
        }`}
      >
        <CardContent className="flex h-full flex-col p-8">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
              featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-8 w-8" />
          </div>

          <h3 className="mb-4 text-2xl font-bold">{title}</h3>

          <p className="mb-6 flex-1 text-muted-foreground">{description}</p>

          <ul className="mb-6 space-y-2 text-left">
            {features.map((feature) => (
              <li key={feature} className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full ${
              featured
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

