import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'submission_update',
        'review_result',
        'points',
        'system',
        'TASK_DEADLINE_24H',
        'TASK_DEADLINE_1H',
        'TASK_DEADLINE_NOW',
        'TASK_OVERDUE',
        'task_deadline_24h',
        'task_deadline_1h',
        'task_deadline_now',
        'task_overdue',
      ],
      default: 'system',
      index: true,
    },
    meta: { taskId: mongoose.Schema.Types.ObjectId, submissionId: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
