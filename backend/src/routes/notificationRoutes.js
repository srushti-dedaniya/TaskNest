import { Router } from 'express'
import * as notifications from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', notifications.listMine)
router.patch('/:id/read', notifications.markRead)
router.post('/read-all', notifications.markAllRead)

export default router

