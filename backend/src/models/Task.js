import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'submitted', 'completed', 'overdue'],
      default: 'assigned',
      index: true,
    },
    remindersSent: {
      type: [String],
      default: [],
    },
    lastReminderAt: {
      type: Date,
    },
  },
  { _id: false }
)

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    code: { type: String, trim: true, uppercase: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    instructions: { type: [String], default: [] },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    points: { type: Number, required: true, min: 0, max: 100000 },
    deadline: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignment: {
      mode: { type: String, enum: ['all', 'individual'], default: 'all' },
      interns: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    },
    assignments: { type: [assignmentSchema], default: [] },
  },
  { timestamps: true }
)

taskSchema.index({ title: 'text', description: 'text' })
taskSchema.methods.audienceIds = function() {
  return this.assignment.mode === 'all'
    ? null
    : this.assignment.interns.map(String)
}

export default mongoose.model('Task', taskSchema)
