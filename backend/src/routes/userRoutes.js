import { Router } from 'express'
import { listInterns, getIntern } from '../controllers/userController.js'
import { myPoints } from '../services/pointsService.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import * as notifications from '../controllers/notificationController.js'

const router = Router()
router.use(requireAuth)

/* Users */
router.get('/users', requireAdmin, listInterns)
router.get('/users/interns', requireAdmin, listInterns)
router.get('/interns', requireAdmin, listInterns)
router.get('/users/:internId', requireAdmin, getIntern)
router.get('/users/:internId/points', requireAdmin, myPoints)
router.get('/me/points', myPoints)

/* Notifications */
router.get('/notifications', notifications.listMine)
router.patch('/notifications/:id/read', notifications.markRead)
router.post('/notifications/read-all', notifications.markAllRead)

export default router
