import { ApiError, asyncHandler } from '../utils/ApiError.js'
import User from '../models/User.js'
import Submission from '../models/Submission.js'
import Review from '../models/Review.js'
import Task from '../models/Task.js'

export const listInterns = asyncHandler(async (req, res) => {
  const filter = { role: 'intern' }
  const { q } = req.query
  if (q && q.trim()) {
    const rx = { $regex: q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    filter.$or = [{ name: rx }, { email: rx }, { institution: rx }, { fieldOfStudy: rx }]
  }
  const interns = await User.find(filter)
    .sort({ points: -1 })
    .select('name email avatar institution fieldOfStudy points lastLoginAt createdAt')
    .lean()
  const [subCounts, reviewCounts] = await Promise.all([
    Submission.aggregate([{ $group: { _id: '$intern', count: { $sum: 1 } } }]),
    Review.aggregate([
      { $lookup: { from: 'submissions', localField: 'submission', foreignField: '_id', as: 'sub' } },
      { $unwind: '$sub' },
      { $match: { decision: 'approved' } },
      { $group: { _id: '$sub.intern', count: { $sum: 1 } } },
    ]),
  ])
  const byIntern = Object.fromEntries(subCounts.map((r) => [String(r._id), r.count]))
  const byInternReviews = Object.fromEntries(reviewCounts.map((r) => [String(r._id), r.count]))
  res.json({
    interns: interns.map((u) => ({
      ...u,
      submissions: byIntern[String(u._id)] ?? 0,
      reviews: byInternReviews[String(u._id)] ?? 0,
    })),
  })
})

export const getIntern = asyncHandler(async (req, res) => {
  const intern = await User.findById(req.params.internId)
    .select('-password -tokenVersion')
    .lean()
  if (!intern || intern.role !== 'intern') throw ApiError.notFound('Intern not found')
  const [submissions, reviews, tasks] = await Promise.all([
    Submission.find({ intern: intern._id }).populate('task', 'title points').sort({ submittedAt: -1 }).lean(),
    Review.find({ decision: 'approved' })
      .populate({ path: 'submission', match: { intern: intern._id }, select: 'task' })
      .select('decision pointsAwarded reviewedAt submission')
      .lean(),
    Task.find({ 'assignments.intern': intern._id }).select('title deadline points type').lean(),
  ])
  res.json({
    intern,
    stats: {
      points: intern.points,
      submissions: submissions.length,
      approved: reviews.filter((r) => r.submission).length,
      assignedTasks: tasks.length,
    },
    submissions,
    reviews: reviews.filter((r) => r.submission),
  })
})
