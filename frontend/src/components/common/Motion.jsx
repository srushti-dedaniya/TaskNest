import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { pageVariants, fadeInUp, staggerContainer } from '../../utils/motion.js'

/**
 * Standard page-level transition wrapper.
 * Provides subtle fade-in and upward slide while respecting reduced-motion preferences.
 */
export function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered container for grids and card lists.
 */
export function StaggerList({ children, className = '', stagger = 0.05, delay = 0 }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={staggerContainer(stagger, delay)}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Item inside a StaggerList.
 */
export function StaggerItem({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  )
}

/**
 * CountUp component for animating statistics.
 * Accurately parses numeric values, preserving prefixes/suffixes (e.g. "+350 XP", "98.4%", "1,420+").
 * Never fabricates values — uses the exact target passed.
 */
export function CountUp({ value, duration = 0.8, className = '' }) {
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value)
      return
    }

    if (value === null || value === undefined) {
      setDisplayValue(value)
      return
    }

    const str = String(value).trim()
    // Extract leading non-digits, digits (including decimals and commas), and trailing chars
    const match = str.match(/^([^0-9.]*)([0-9,.]+)(.*)$/)
    if (!match) {
      setDisplayValue(value)
      return
    }

    const prefix = match[1] || ''
    const rawNumberStr = match[2].replace(/,/g, '')
    const suffix = match[3] || ''
    const target = parseFloat(rawNumberStr)

    if (isNaN(target)) {
      setDisplayValue(value)
      return
    }

    const isDecimal = rawNumberStr.includes('.')
    const decimals = isDecimal ? rawNumberStr.split('.')[1].length : 0
    const hasCommas = match[2].includes(',')

    const startTime = performance.now()
    const startVal = isFirstRender.current ? 0 : target * 0.5
    isFirstRender.current = false

    let animId
    const step = (now) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (target - startVal) * easeOut

      let formatted = current.toFixed(decimals)
      if (hasCommas) {
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        formatted = parts.join('.')
      }

      setDisplayValue(`${prefix}${formatted}${suffix}`)

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      } else {
        // Guarantee exact target string on completion
        setDisplayValue(str)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [value, duration, shouldReduceMotion])

  return <span className={className}>{displayValue}</span>
}

/**
 * Animated progress bar with smooth width interpolation.
 */
export function AnimatedProgressBar({
  progress = 0,
  max = 100,
  className = '',
  barClassName = 'bg-secondary'
}) {
  const shouldReduceMotion = useReducedMotion()
  const percentage = Math.min(Math.max((progress / (max || 1)) * 100, 0), 100)

  return (
    <div className={`w-full overflow-hidden rounded-full ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={shouldReduceMotion ? { width: `${percentage}%` } : { width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  )
}

/**
 * Skeleton shimmer placeholder for loading states.
 * Warm beige/ivory theme compliant.
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-container-high/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-surface-bright/40 before:to-transparent ${className}`}
    />
  )
}

