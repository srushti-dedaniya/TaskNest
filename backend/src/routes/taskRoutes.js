import { Router } from 'express'
import * as tasks from '../controllers/taskController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator.js'

const router = Router()
router.use(requireAuth)

router.get('/', tasks.listTasks)
router.post('/', requireAdmin, validate(createTaskSchema), tasks.createTask)
router.get('/:taskId', tasks.getTask)
router.patch('/:taskId', requireAdmin, validate(updateTaskSchema), tasks.updateTask)
router.delete('/:taskId', requireAdmin, tasks.deleteTask)

export default router

