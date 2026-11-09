import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['approved', 'rejected'], required: true },
    feedback: { type: String, required: true, trim: true, maxlength: 3000 },
    pointsAwarded: { type: Number, default: 0, min: 0 },
    pointsPossible: { type: Number, default: 0 },
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

/* One evaluation per submission — enforces "never award points twice" */
reviewSchema.index({ submission: 1 }, { unique: true })
export default mongoose.model('Review', reviewSchema)
