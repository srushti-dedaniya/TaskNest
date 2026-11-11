import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { aiRateLimiter } from '../middleware/aiRateLimitMiddleware.js'
import { askHelpSchema, generateTaskDescriptionSchema } from '../validators/aiValidator.js'
import * as aiController from '../controllers/aiController.js'

const router = Router()

// All AI assistant routes require authentication
router.use(requireAuth)

// Main help endpoint
router.post('/help', aiRateLimiter, validate(askHelpSchema), aiController.askHelp)

// Fetch suggested questions for the authenticated user's role
router.get('/suggested-questions', aiController.getSuggestedQuestions)

// AI Task Description Generator for Faculty/Admin
router.post(
  '/generate-task-description',
  requireAdmin,
  aiRateLimiter,
  validate(generateTaskDescriptionSchema),
  aiController.handleGenerateTaskDescription
)

export default router

