/**
 * Reusable motion variants & configurations for TaskNest.
 * Designed for subtle, 60fps micro-interactions matching the warm beige/ivory theme.
 * Respects prefers-reduced-motion.
 */

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const easeEditorial = [0.25, 0.1, 0.25, 1]

// Page Entrance
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeEditorial }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.18, ease: 'easeOut' }
  }
}

// Stagger Containers
export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0.02) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
})

// Item Appearances
export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: easeEditorial }
  }
}

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easeEditorial }
  }
}

// Micro-interaction props
export const cardHoverMotion = {
  whileHover: {
    y: -3,
    transition: { duration: 0.22, ease: 'easeOut' }
  },
  whileTap: { scale: 0.995 }
}

export const buttonTapMotion = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.15 }
}

// Dropdown & Modal Variants
export const dropdownVariants = {
  closed: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: easeEditorial }
  }
}

export const modalBackdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.2 } }
}

export const modalDialogVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: 14,
    transition: { duration: 0.18, ease: 'easeOut' }
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: easeEditorial }
  }
}

// Badge pulse or notification slide
export const notificationBannerVariants = {
  initial: { opacity: 0, y: -10, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: easeEditorial }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.2 }
  }
}

