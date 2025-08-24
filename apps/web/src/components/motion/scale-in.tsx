"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  initialScale?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 0.5, initialScale = 0.9, className = "" }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        scale: initialScale,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
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

