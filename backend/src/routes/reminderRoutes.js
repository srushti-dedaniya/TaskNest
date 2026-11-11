import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import * as reminderController from '../controllers/reminderController.js'

const router = Router()

router.use(requireAuth)

// Intern personal deadline schedule
router.get('/my-schedule', reminderController.getMySchedule)

// Faculty / Admin overview
router.get('/overview', requireAdmin, reminderController.getOverview)

// Trigger a check manually or programmatically
router.post('/check', requireAdmin, reminderController.triggerCheck)

export default router

