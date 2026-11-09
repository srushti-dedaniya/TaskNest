import { Router } from 'express'
import * as reviews from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { z } from 'zod'

const router = Router()
router.use(requireAuth)

router.post(
  '/:submissionId',
  requireAdmin,
  validate(
    z.object({
      decision: z.enum(['approved', 'rejected']),
      feedback: z.string().trim().min(5, 'Feedback is required').max(3000),
      pointsAwarded: z.number().int().min(0).optional()
    })
  ),
  reviews.evaluateSubmission
)

export default router

