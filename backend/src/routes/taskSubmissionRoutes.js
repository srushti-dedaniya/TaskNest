import { Router } from 'express'
import * as tasks from '../controllers/taskController.js'
import * as subs from '../controllers/submissionController.js'
import * as reviews from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator.js'
import { createSubmissionSchema } from '../validators/submissionValidator.js'
import { z } from 'zod'

const router = Router()
router.use(requireAuth)

/* Tasks */
router.get('/tasks', tasks.listTasks)
router.post('/tasks', requireAdmin, validate(createTaskSchema), tasks.createTask)
router.get('/tasks/:taskId', tasks.getTask)
router.patch('/tasks/:taskId', requireAdmin, validate(updateTaskSchema), tasks.updateTask)
router.delete('/tasks/:taskId', requireAdmin, tasks.deleteTask)

/* Submissions */
router.post('/submissions', validate(createSubmissionSchema), subs.createSubmission)
router.get('/submissions', (req, res, next) => (req.user.role === 'admin' ? subs.listAllSubmissions(req, res, next) : subs.listMySubmissions(req, res, next)))
router.get('/submissions/:submissionId', subs.getSubmission)

/* Reviews (admin evaluate submission — award-once guaranteed by unique index) */
router.post(
  '/submissions/:submissionId/review',
  requireAdmin,
  validate(z.object({ decision: z.enum(['approved', 'rejected']), feedback: z.string().trim().min(1, 'Feedback is required').max(3000), pointsAwarded: z.coerce.number().int().min(0).optional() })),
  reviews.evaluateSubmission
)

/* Admin overview */
router.get('/stats/admin', requireAdmin, tasks.statsOverview)

export default router
