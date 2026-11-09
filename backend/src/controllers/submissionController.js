import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import Review from '../models/Review.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { sendEmail } from '../config/email.js'

async function notifyAdmins(title, body, type, meta) {
  const admins = await User.find({ role: 'admin' }, '_id')
  if (admins.length) {
    await Notification.insertMany(admins.map((a) => ({ user: a._id, title, body, type, meta })))
  }
}

export const createSubmission = asyncHandler(async (req, res) => {
  const { taskId, repoUrl, liveUrl, notes, attachmentPath } = req.body
  const task = await Task.findById(taskId)
  if (!task) throw ApiError.notFound('Task not found')

  const internId = req.user._id
  const inAudience =
    task.assignment.mode === 'all'
      ? req.user.role === 'intern'
      : task.assignments.some((a) => String(a.intern) === String(internId))
  if (!inAudience) {
    throw ApiError.forbidden(
      req.user.role === 'admin' ? 'Admin accounts cannot submit deliverables' : 'This task is not assigned to you'
    )
  }

  const existing = await Submission.findOne({ task: task._id, intern: internId })
  let submission
  if (existing && existing.status !== 'rejected') {
    throw ApiError.conflict('You already have a submission for this task')
  }
  if (existing) {
    existing.set({ repoUrl, liveUrl, notes, attachmentPath, status: 'submitted', submittedAt: new Date() })
    existing.attempted = (existing.attempted ?? 1) + 1
    submission = await existing.save()
    /* Rejected resubmission: clear the stale review so the submission can be re-evaluated */
    await Review.deleteOne({ submission: submission._id })
  } else {
    submission = await Submission.create({ task: task._id, intern: internId, repoUrl, liveUrl, notes, attachmentPath })
  }

  const assignment = task.assignments.find((a) => String(a.intern) === String(internId))
  if (assignment) {
    assignment.status = 'submitted'
    await task.save()
  }

  await notifyAdmins(
    `New submission for review`,
    `${req.user.name} submitted ${task.title}.`,
    'submission_update',
    { submissionId: submission._id, taskId: task._id }
  )
  await sendEmail({
    to: req.user.email,
    subject: 'Submission received',
    text: `Your submission for "${task.title}" was received and is awaiting review.`,
  })

  res.status(201).json({ submission })
})

export const listMySubmissions = asyncHandler(async (req, res) => {
  const subs = await Submission.find({ intern: req.user._id })
    .sort({ submittedAt: -1 })
    .populate('task', 'title type points deadline')
    .lean()
  const reviews = await Review.find({ submission: { $in: subs.map((s) => s._id) } }).lean()
  const bySub = Object.fromEntries(reviews.map((r) => [String(r.submission), r]))
  res.json({ submissions: subs.map((s) => ({ ...s, review: bySub[String(s._id)] ?? null })) })
})

export const listAllSubmissions = asyncHandler(async (req, res) => {
  const filter = {}
  if (['submitted', 'under_review', 'approved', 'rejected'].includes(req.query.status)) {
    filter.status = req.query.status
  }
  const subs = await Submission.find(filter)
    .sort({ submittedAt: -1 })
    .limit(300)
    .populate('intern', 'name email avatar')
    .populate('task', 'title points')
    .lean()
  const reviews = await Review.find({ submission: { $in: subs.map((s) => s._id) } }).select('submission decision pointsAwarded').lean()
  const bySub = Object.fromEntries(reviews.map((r) => [String(r.submission), r]))
  res.json({ submissions: subs.map((s) => ({ ...s, review: bySub[String(s._id)] ?? null })) })
})

export const getSubmission = asyncHandler(async (req, res) => {
  const sub = await Submission.findById(req.params.submissionId)
    .populate('intern', 'name email avatar institution fieldOfStudy points')
    .populate('task', 'title type points deadline instructions')
    .lean()
  if (!sub) throw ApiError.notFound('Submission not found')
  const review = await Review.findOne({ submission: sub._id })
    .populate('reviewer', 'name')
    .lean()
  const isOwner = String(sub.intern?._id ?? sub.intern) === String(req.user._id)
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden()
  res.json({ submission: { ...sub, review: review ?? null } })
})
