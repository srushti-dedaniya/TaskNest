import { Router } from 'express'
import {
  register, login, logout, refresh, me, updateProfile, forgotPassword, resetPassword,
  verifyEmail, resendVerification,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js'
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  verifyEmailSchema, resendVerificationSchema,
} from '../validators/authValidator.js'

const router = Router()

// Rate limiters for security
const verifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many verification attempts from this network.',
})

const resendLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many verification resend requests from this network.',
})

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts.',
})

router.post('/register', authLimiter, validate(registerSchema), register)
router.get('/verify-email', verifyLimiter, verifyEmail)
router.post('/verify-email', verifyLimiter, validate(verifyEmailSchema), verifyEmail)
router.post('/resend-verification', resendLimiter, validate(resendVerificationSchema), resendVerification)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/refresh', authLimiter, refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.put('/me', requireAuth, updateProfile)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword)

export default router
