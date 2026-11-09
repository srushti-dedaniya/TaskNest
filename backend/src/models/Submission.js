import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    repoUrl: { type: String, required: true, trim: true },
    liveUrl: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    attachmentPath: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },
    submittedAt: { type: Date, default: Date.now, index: true },
    attempted: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
)

submissionSchema.index(
  { task: 1, intern: 1 },
  { unique: true }
)

export default mongoose.model('Submission', submissionSchema)
