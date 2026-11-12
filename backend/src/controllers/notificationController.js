import { ApiError, asyncHandler } from '../utils/ApiError.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import emailService from '../services/emailService.js'

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

export const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, targetRole = 'all', priority = 'Normal' } = req.body
  if (!title || !content) {
    throw ApiError.badRequest('Announcement title and content are required')
  }

  const query = targetRole === 'all' ? {} : { role: targetRole }
  const recipients = await User.find(query, '_id name email role')

  if (recipients.length) {
    await Notification.insertMany(
      recipients.map((u) => ({
        user: u._id,
        title,
        body: content,
        type: 'system',
      }))
    )

    // Dispatch branded announcement emails via outbox
    for (const recipient of recipients) {
      if (recipient.email) {
        await emailService
          .sendFacultyAnnouncement(recipient, {
            title,
            content,
            authorName: req.user.name || 'Faculty Governance',
          })
          .catch((err) => {
            console.warn(`[announcement:email] Failed for ${recipient.email}:`, err.message)
          })
      }
    }
  }

  res.status(201).json({
    message: `Announcement broadcast to ${recipients.length} recipients`,
    recipientCount: recipients.length,
  })
})
