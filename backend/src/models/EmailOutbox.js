import mongoose from 'mongoose'

const emailOutboxSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        'REGISTRATION_VERIFICATION',
        'WELCOME',
        'OTP',
        'PASSWORD_RESET',
        'PASSWORD_CHANGED',
        'SECURITY_ALERT',
        'TASK_ASSIGNED',
        'TASK_REASSIGNED',
        'TASK_UPDATED',
        'TASK_DEADLINE_24H',
        'TASK_DEADLINE_1H',
        'TASK_DEADLINE_NOW',
        'TASK_OVERDUE',
        'TASK_COMPLETED',
        'TASK_STATUS_CHANGED',
        'ANNOUNCEMENT_FACULTY',
        'ANNOUNCEMENT_ADMIN',
        'ACCOUNT_NOTIFICATION',
      ],
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'accepted', 'delivered', 'failed', 'bounced', 'complained'],
      default: 'pending',
      index: true,
    },
    providerMessageId: {
      type: String,
      sparse: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 4,
    },
    lastAttemptAt: {
      type: Date,
    },
    nextAttemptAt: {
      type: Date,
      index: true,
      default: Date.now,
    },
    error: {
      type: String,
      default: null,
    },
    errorCode: {
      type: String,
      default: null,
    },
    isPermanentError: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhookEvents: [
      {
        event: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        payload: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
)

emailOutboxSchema.index({ status: 1, nextAttemptAt: 1 })
emailOutboxSchema.index({ recipient: 1, type: 1, createdAt: -1 })

export default mongoose.model('EmailOutbox', emailOutboxSchema)

