"use client"

import { motion, useInView } from "framer-motion"
import { useRef, ReactNode } from "react"

export function FadeIn({ 
  children, 
  className,
  delay = 0,
  duration = 0.8,
  direction = "up"
}: { 
  children: ReactNode, 
  className?: string,
  delay?: number,
  duration?: number,
  direction?: "up" | "down" | "left" | "right" | "none"
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] as const } 
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInStagger({ 
  children, 
  className, 
  faster = false,
  delay = 0 
}: { 
  children: ReactNode, 
  className?: string, 
  faster?: boolean,
  delay?: number 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ staggerChildren: faster ? 0.12 : 0.2, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const }
  }
}

export function FadeInItem({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div variants={fadeInVariants} className={className}>
      {children}
    </motion.div>
  )
}
