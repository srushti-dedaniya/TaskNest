import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Review from '../models/Review.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import emailService from '../services/emailService.js'

export const evaluateSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params
  const { decision, feedback, pointsAwarded } = req.body

  const sub = await Submission.findById(submissionId).populate('task', 'title points')
  if (!sub) throw ApiError.notFound('Submission not found')
  if (sub.status === 'approved' || sub.status === 'rejected') {
    throw ApiError.conflict('This submission has already been evaluated')
  }

  const pointsPossible = sub.task?.points ?? 0
  let award = 0
  if (decision === 'approved') {
    award = pointsAwarded === undefined || pointsAwarded === null ? pointsPossible : Number(pointsAwarded)
    if (!Number.isFinite(award) || award < 0 || award > pointsPossible) {
      throw ApiError.badRequest(`pointsAwarded must be between 0 and ${pointsPossible}`)
    }
  }

  /* Review.submission unique index → second evaluation throws MongoServerError 11000 */
  let review
  try {
    review = await Review.create({
      submission: sub._id,
      reviewer: req.user._id,
      decision,
      feedback,
      pointsAwarded: award,
      pointsPossible,
    })
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict('This submission has already been evaluated')
    }
    throw err
  }

  sub.status = decision
  await sub.save()

  if (decision === 'approved' && award > 0) {
    await User.updateOne({ _id: sub.intern }, { $inc: { points: award } })
  }

  const task = await Task.findById(sub.task)
  if (task) {
    const assignment = task.assignments.find((a) => String(a.intern) === String(sub.intern))
    if (assignment) {
      assignment.status = decision === 'approved' ? 'completed' : 'assigned'
      await task.save()
    }
  }

  await Notification.create({
    user: sub.intern,
    title: decision === 'approved' ? `Approved: ${task?.title ?? 'Task'}` : `Rejected: ${task?.title ?? 'Task'}`,
    body: feedback,
    type: decision === 'approved' ? 'points' : 'review_result',
    meta: { submissionId: sub._id, taskId: task?._id },
  })
  const internUser = await User.findById(sub.intern, 'name email')
  if (internUser) {
    await emailService
      .sendReviewEvaluated(internUser, task, { decision, pointsAwarded: award, feedback })
      .catch((err) => {
        console.warn('[reviewController] Failed to send evaluation email:', err.message)
      })
  }

  res.status(201).json({ review, submission: sub })
})
