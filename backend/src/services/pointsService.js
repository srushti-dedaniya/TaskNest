import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Review from '../models/Review.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

/* Points ledger = approved reviews (unique per submission → award happens at most once) */
export const myPoints = asyncHandler(async (req, res) => {
  const userId = req.params.internId && req.user.role === 'admin' ? req.params.internId : req.user._id
  const user = await User.findById(userId).select('name points')
  if (!user) throw ApiError.notFound('Intern not found')

  const ledger = await Review.find({ decision: 'approved' })
    .populate({ path: 'submission', match: { intern: user._id }, populate: { path: 'task', select: 'title' } })
    .sort({ reviewedAt: -1 })
    .limit(100)
    .lean()

  const entries = ledger.filter((r) => r.submission)
  const total = entries.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0)
  const approvedCount = entries.length
  const pending = await Submission.countDocuments({ intern: user._id, status: { $in: ['submitted', 'under_review'] } })
  const taskCount = await Task.countDocuments({})

  res.json({
    user: { id: user._id, name: user.name, points: user.points },
    total,
    ledger: entries.map((r) => ({
      id: r._id,
      task: r.submission.task?.title ?? 'Task',
      pointsAwarded: r.pointsAwarded,
      reviewedAt: r.reviewedAt,
      feedback: r.feedback,
    })),
    stats: { approvedCount, pending, taskCount },
  })
})
