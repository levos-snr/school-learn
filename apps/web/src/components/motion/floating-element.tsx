"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FloatingElementProps {
  children: ReactNode
  delay?: number
  duration?: number
  intensity?: number
  className?: string
}

export function FloatingElement({
  children,
  delay = 0,
  duration = 4,
  intensity = 8,
  className = "",
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        repeatType: "reverse",
      }}
    >
      {children}
    </motion.div>
  )
}

