import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Notification from '../models/Notification.js'

export const listMine = asyncHandler(async (req, res) => {
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ])
  res.json({ notifications: items, unread })
})

export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  )
  if (!n) throw ApiError.notFound('Notification not found')
  res.json({ notification: n })
})

export const markAllRead = asyncHandler(async (req, res) => {
  const r = await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
  res.json({ updated: r.modifiedCount })
})
