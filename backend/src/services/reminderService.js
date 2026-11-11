import Task from '../models/Task.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import emailService from './emailService.js'

let schedulerTimer = null
let isCheckRunning = false

/**
 * Checks all active tasks and assignments against the current time (now).
 * Sends notifications and emails for upcoming and overdue deadlines idempotently.
 *
 * @param {Object} options
 * @param {Date} [options.now=new Date()] Reference time for calculating deadlines
 * @returns {Promise<Object>} Summary of actions taken
 */
export async function checkDeadlines({ now = new Date() } = {}) {
  if (isCheckRunning) {
    return { skipped: true, reason: 'Previous check is still in progress' }
  }

  isCheckRunning = true
  const nowTime = now.getTime()
  let remindersSentCount = 0
  let overdueUpdatedCount = 0
  let tasksChecked = 0

  try {
    // Find all tasks with a deadline
    const tasks = await Task.find({ deadline: { $exists: true, $ne: null } })
      .populate('assignments.intern', '_id name email role')
      .lean()

    tasksChecked = tasks.length

    for (const task of tasks) {
      if (!task.deadline) continue
      const deadlineDate = new Date(task.deadline)
      const deadlineTime = deadlineDate.getTime()
      const diffMs = deadlineTime - nowTime

      // Formatted date string in UTC (frontend converts to local browser time)
      const formattedDeadline = deadlineDate.toUTCString().replace(':00 GMT', ' UTC')

      for (const assignment of task.assignments || []) {
        // Skip completed or already submitted tasks (intern has completed work)
        if (assignment.status === 'completed' || assignment.status === 'submitted') {
          continue
        }

        const internUser = assignment.intern
        if (!internUser || !internUser._id) continue

        const internId = internUser._id
        const alreadySent = new Set(assignment.remindersSent || [])

        let stageToSend = null
        let notifTitle = ''
        let notifBody = ''

        // Rule 1: 24 hours before deadline (between 1h and 24h remaining)
        if (diffMs <= 24 * 3600 * 1000 && diffMs > 1 * 3600 * 1000) {
          if (!alreadySent.has('TASK_DEADLINE_24H')) {
            stageToSend = 'TASK_DEADLINE_24H'
            notifTitle = `Reminder: "${task.title}" is due in 24 hours`
            notifBody = `Your task is due on ${formattedDeadline}. Please submit your work before the deadline.`
          }
        }
        // Rule 2: 1 hour before deadline (between 0 and 1h remaining)
        else if (diffMs <= 1 * 3600 * 1000 && diffMs > 0) {
          if (!alreadySent.has('TASK_DEADLINE_1H')) {
            stageToSend = 'TASK_DEADLINE_1H'
            notifTitle = `Urgent: "${task.title}" is due in 1 hour!`
            notifBody = `Only 1 hour remaining to submit "${task.title}". Deadline: ${formattedDeadline}.`
          }
        }
        // Rule 3: At deadline (within 30 mins after deadline)
        else if (diffMs <= 0 && diffMs >= -30 * 60 * 1000) {
          if (!alreadySent.has('TASK_DEADLINE_NOW')) {
            stageToSend = 'TASK_DEADLINE_NOW'
            notifTitle = `Deadline reached: "${task.title}"`
            notifBody = `The deadline for "${task.title}" has just passed. Please submit your deliverable now.`
          }
        }
        // Rule 4: Overdue (past deadline / after 30 mins, or whenever overdue)
        else if (diffMs < -30 * 60 * 1000 || (diffMs < 0 && alreadySent.has('TASK_DEADLINE_NOW'))) {
          if (!alreadySent.has('TASK_OVERDUE')) {
            stageToSend = 'TASK_OVERDUE'
            notifTitle = `Action Required: "${task.title}" is Overdue`
            notifBody = `Your task "${task.title}" is overdue (deadline was ${formattedDeadline}). Please finalize and submit your work.`
          }
        }

        // If a new reminder stage has triggered
        if (stageToSend) {
          try {
            // 1. Atomically record reminder sent in database first to guarantee idempotency across concurrent instances
            const updateFields = {
              $addToSet: { 'assignments.$.remindersSent': stageToSend },
              $set: { 'assignments.$.lastReminderAt': now },
            }

            if (
              stageToSend === 'TASK_OVERDUE' &&
              assignment.status !== 'completed' &&
              assignment.status !== 'submitted'
            ) {
              updateFields.$set['assignments.$.status'] = 'overdue'
              overdueUpdatedCount++
            }

            const updateResult = await Task.updateOne(
              {
                _id: task._id,
                'assignments.intern': internId,
                'assignments.remindersSent': { $ne: stageToSend },
              },
              updateFields
            )

            // If already recorded by concurrent instance or previous run, skip
            if (updateResult.modifiedCount === 0) {
              continue
            }

            // 2. In-app notification
            await Notification.create({
              user: internId,
              title: notifTitle,
              body: notifBody,
              type: stageToSend,
              meta: { taskId: task._id },
            })

            // 3. Email notification (if user email exists)
            if (internUser.email) {
              await emailService
                .sendDeadlineReminder({
                  user: internUser,
                  task,
                  stage: stageToSend,
                  formattedDeadline,
                })
                .catch((e) => console.warn(`[reminder:email] Failed for ${internUser.email}:`, e.message))
            }

            remindersSentCount++
          } catch (err) {
            console.error(`[reminder:error] Task ${task._id} for intern ${internId}:`, err.message)
          }
        } else if (
          diffMs < 0 &&
          assignment.status !== 'completed' &&
          assignment.status !== 'submitted' &&
          assignment.status !== 'overdue'
        ) {
          // Keep assignment status aligned with overdue
          await Task.updateOne(
            { _id: task._id, 'assignments.intern': internId },
            { $set: { 'assignments.$.status': 'overdue' } }
          )
          overdueUpdatedCount++
        }
      }
    }
  } catch (error) {
    console.error('[reminder:checkDeadlines] Unhandled scheduler error:', error)
  } finally {
    isCheckRunning = false
  }

  return {
    tasksChecked,
    remindersSentCount,
    overdueUpdatedCount,
    processedAt: now,
  }
}

/**
 * Starts the automatic background scheduler running every intervalMs.
 */
export function startDeadlineScheduler({ intervalMs = 60 * 1000 } = {}) {
  if (schedulerTimer) return schedulerTimer

  console.log(`[reminder-scheduler] Started. Interval: ${intervalMs / 1000}s`)

  // Initial check after short delay (5 seconds after startup)
  setTimeout(() => {
    checkDeadlines().catch((err) =>
      console.warn('[reminder-scheduler] Initial run warning:', err.message)
    )
  }, 5000).unref()

  // Recurring interval
  schedulerTimer = setInterval(() => {
    checkDeadlines().catch((err) =>
      console.warn('[reminder-scheduler] Recurring run warning:', err.message)
    )
  }, intervalMs)

  schedulerTimer.unref() // allows process to exit gracefully
  return schedulerTimer
}

/**
 * Stops the background scheduler.
 */
export function stopDeadlineScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
    console.log('[reminder-scheduler] Stopped.')
  }
}

/**
 * Gathers aggregate statistics on deadlines across all tasks for Faculty/Admin view.
 */
export async function getDeadlineOverview(now = new Date()) {
  const nowTime = now.getTime()

  const tasks = await Task.find({ deadline: { $exists: true } })
    .populate('assignments.intern', '_id name email avatar institution')
    .sort({ deadline: 1 })
    .lean()

  const approachingTasks = []
  const overdueTasks = []

  for (const t of tasks) {
    if (!t.deadline) continue
    const diffMs = new Date(t.deadline).getTime() - nowTime
    const unsubmittedInterns = (t.assignments || []).filter(
      (a) => a.status !== 'completed' && a.status !== 'submitted'
    )

    if (diffMs < 0 && unsubmittedInterns.length > 0) {
      overdueTasks.push({
        ...t,
        diffMs,
        unsubmittedInterns,
      })
    } else if (diffMs > 0 && diffMs <= 24 * 3600 * 1000 && unsubmittedInterns.length > 0) {
      approachingTasks.push({
        ...t,
        diffMs,
        unsubmittedInterns,
      })
    }
  }

  return {
    approachingCount: approachingTasks.length,
    overdueCount: overdueTasks.length,
    approachingTasks,
    overdueTasks,
  }
}

