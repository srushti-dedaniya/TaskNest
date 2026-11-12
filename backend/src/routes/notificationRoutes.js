import { Router } from 'express'
import * as notifications from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', notifications.listMine)
router.patch('/:id/read', notifications.markRead)
router.post('/read-all', notifications.markAllRead)
router.post('/broadcast', requireAdmin, notifications.broadcastAnnouncement)

export default router

