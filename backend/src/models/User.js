import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['intern', 'admin'], default: 'intern', index: true },
    isEmailVerified: { type: Boolean, default: false, index: true },
    emailVerification: {
      tokenHash: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
    lastVerificationSentAt: { type: Date },
    resetToken: {
      hash: { type: String, select: false },
      expires: { type: Date, select: false },
    },
    avatar: { type: String, default: '' },
    institution: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    points: { type: Number, default: 0, min: 0 },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
)

userSchema.index({ role: 1, points: -1 })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeJSON = function() {
  const obj = this.toObject({ virtuals: true })
  delete obj.password
  delete obj.tokenVersion
  delete obj.emailVerification
  delete obj.resetToken
  obj.createdAt = obj.createdAt?.toISOString()
  return obj
}

export default mongoose.model('User', userSchema)
