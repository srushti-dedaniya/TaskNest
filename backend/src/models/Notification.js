import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ['task_assigned', 'submission_update', 'review_result', 'points', 'system'],
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
