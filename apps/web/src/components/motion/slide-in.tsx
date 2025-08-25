"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface SlideInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "left" | "right" | "up" | "down"
  distance?: number
  className?: string
}

const directionVariants = {
  left: (distance: number) => ({ x: -distance, y: 0 }),
  right: (distance: number) => ({ x: distance, y: 0 }),
  up: (distance: number) => ({ x: 0, y: -distance }),
  down: (distance: number) => ({ x: 0, y: distance }),
}

export function SlideIn({
  children,
  delay = 0,
  duration = 0.7,
  direction = "left",
  distance = 60,
  className = "",
}: SlideInProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionVariants[direction](distance),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

