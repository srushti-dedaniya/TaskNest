import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import Submission from '../models/Submission.js'
import Review from '../models/Review.js'
import Notification from '../models/Notification.js'
import { sendEmail } from '../config/email.js'

async function notifyAndEmail(users, title, body, type, meta = {}) {
  if (!users.length) return
  await Notification.insertMany(
    users.map((u) => ({ user: u._id, title, body, type, meta }))
  )
  await Promise.all(users.map((u) => sendEmail({ to: u.email, subject: title, text: body })))
}

async function buildAssignments(task) {
  const isAll = task.assignment.mode === 'all'
  let interns = []

  if (isAll) {
    interns = await User.find({ role: 'intern' }).select('_id')
  } else {
    const rawIds = (task.assignment.interns || [])
      .map(String)
      .filter((id) => id && /^[0-9a-fA-F]{24}$/.test(id))
    const uniqueIds = [...new Set(rawIds)]
    interns = await User.find({ _id: { $in: uniqueIds }, role: 'intern' }).select('_id')
  }

  // Preserve existing progress/status per intern
  const existingMap = new Map((task.assignments || []).map((a) => [String(a.intern), a.status]))
  task.assignments = interns.map((u) => ({
    intern: u._id,
    status: existingMap.get(String(u._id)) || 'assigned',
  }))
  task.assignment.interns = task.assignments.map((a) => a.intern)
}

export const createTask = asyncHandler(async (req, res) => {
  const task = new Task({ ...req.body, createdBy: req.user._id })
  await buildAssignments(task)
  await task.save()

  const audience = await User.find(
    task.assignment.mode === 'all' ? { role: 'intern' } : { _id: { $in: task.assignment.interns }, role: 'intern' },
    '_id name email'
  )
  await notifyAndEmail(
    audience,
    `New task assigned: ${task.title}`,
    `${task.title} — ${task.points} points available, deadline ${
      task.deadline.toISOString().slice(0, 10)
    }.`,
    'task_assigned',
    { taskId: task._id }
  )

  res.status(201).json({ task })
})

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const listTasks = asyncHandler(async (req, res) => {
  const { type, q, sort } = req.query
  const conditions = []

  if (req.user.role !== 'admin') {
    conditions.push({
      $or: [{ 'assignment.mode': 'all' }, { 'assignments.intern': req.user._id }],
    })
  }

  if (type === 'daily' || type === 'weekly') {
    conditions.push({ type })
  }

  if (q && q.trim()) {
    const rx = { $regex: escapeRegex(q.trim()), $options: 'i' }
    conditions.push({
      $or: [{ title: rx }, { description: rx }, { code: rx }],
    })
  }

  const filter = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { $and: conditions }

  const sortMap = {
    deadline: { deadline: 1 },
    '-points': { points: -1 },
    newest: { createdAt: -1 },
  }

  const tasks = await Task.find(filter)
    .populate('assignment.interns', 'name email avatar institution')
    .sort(sortMap[sort] || sortMap.newest)
    .limit(200)

  res.json({ tasks })
})

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId)
    .populate('assignment.interns', 'name email avatar institution fieldOfStudy points')
    .lean()
  if (!task) throw ApiError.notFound('Task not found')
  const subs = await Submission.find({ task: task._id })
    .select('_id intern status submittedAt notes repoUrl liveUrl')
    .populate('intern', 'name email avatar')
  res.json({ task, submissions: subs })
})

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId)
  if (!task) throw ApiError.notFound('Task not found')
  const assignmentChanged = req.body.assignment !== undefined
  Object.assign(task, req.body)
  if (assignmentChanged) {
    await buildAssignments(task)
  }
  await task.save()
  res.json({ task })
})

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId)
  if (!task) throw ApiError.notFound('Task not found')
  const submissions = await Submission.find({ task: task._id }).select('_id').lean()
  await Promise.all([
    Submission.deleteMany({ task: task._id }),
    Review.deleteMany({ submission: { $in: submissions.map((s) => s._id) } }),
    Notification.deleteMany({ 'meta.taskId': task._id }),
  ])
  res.json({ message: 'Task deleted' })
})

export const statsOverview = asyncHandler(async (req, res) => {
  const [interns, tasks, subsByStatus, recent] = await Promise.all([
    User.countDocuments({ role: 'intern' }),
    Task.countDocuments({}),
    Submission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Submission.find({}).sort({ submittedAt: -1 }).limit(6).populate('intern', 'name').populate('task', 'title').lean(),
  ])
  const subs = {}
  for (const row of subsByStatus) subs[row._id] = row.count
  res.json({ interns, tasks, submissions: subs, recent })
})
