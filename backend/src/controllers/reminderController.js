import { asyncHandler } from '../utils/ApiError.js'
import { checkDeadlines, getDeadlineOverview } from '../services/reminderService.js'
import Task from '../models/Task.js'

/**
 * Manually or programmatically trigger a deadline reminder check.
 * POST /api/reminders/check
 */
export const triggerCheck = asyncHandler(async (req, res) => {
  const referenceTime = req.body?.now ? new Date(req.body.now) : new Date()
  const result = await checkDeadlines({ now: referenceTime })
  res.json({ ok: true, result })
})

/**
 * Get faculty overview of approaching deadlines and overdue tasks.
 * GET /api/reminders/overview
 */
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await getDeadlineOverview()
  res.json({ ok: true, overview })
})

/**
 * Get the current user's deadline schedule and reminder status.
 * GET /api/reminders/my-schedule
 */
export const getMySchedule = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const now = new Date()

  // Find all tasks assigned to this intern
  const tasks = await Task.find({
    $or: [{ 'assignment.mode': 'all' }, { 'assignments.intern': userId }],
  })
    .sort({ deadline: 1 })
    .lean()

  const schedule = tasks.map((t) => {
    const assignment = (t.assignments || []).find(
      (a) => String(a.intern) === String(userId)
    )

    const deadlineDate = new Date(t.deadline)
    const diffMs = deadlineDate.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 3600)

    let urgency = 'normal'
    let label = 'Upcoming'

    if (assignment?.status === 'completed') {
      urgency = 'completed'
      label = 'Completed'
    } else if (assignment?.status === 'submitted') {
      urgency = 'submitted'
      label = 'Waiting for Review'
    } else if (diffMs < 0) {
      urgency = 'overdue'
      label = 'Overdue'
    } else if (diffHours <= 1) {
      urgency = 'critical'
      label = 'Due in 1 Hour'
    } else if (diffHours <= 24) {
      urgency = 'high'
      label = diffHours <= 12 ? 'Due Today' : 'Due Tomorrow'
    }

    return {
      taskId: t._id,
      title: t.title,
      code: t.code,
      type: t.type,
      priority: t.priority,
      points: t.points,
      deadline: t.deadline,
      diffMs,
      diffHours,
      status: assignment?.status || 'assigned',
      remindersSent: assignment?.remindersSent || [],
      lastReminderAt: assignment?.lastReminderAt || null,
      urgency,
      label,
    }
  })

  res.json({ ok: true, schedule })
})

