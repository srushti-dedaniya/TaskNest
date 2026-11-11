import { ApiError } from '../utils/ApiError.js'

// Map of userId -> array of request timestamps (epoch ms)
const userRequestTimestamps = new Map()

const WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20

// Periodic cleanup every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [userId, timestamps] of userRequestTimestamps.entries()) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS)
    if (valid.length === 0) {
      userRequestTimestamps.delete(userId)
    } else {
      userRequestTimestamps.set(userId, valid)
    }
  }
}, 5 * 60 * 1000).unref()

export function aiRateLimiter(req, _res, next) {
  const userId = req.user?._id?.toString() || req.ip || 'anonymous'
  const now = Date.now()

  const timestamps = userRequestTimestamps.get(userId) || []
  const recent = timestamps.filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return next(
      ApiError.badRequest(
        'Rate limit reached: You have sent too many questions in a short period. Please wait a minute before asking again.'
      )
    )
  }

  recent.push(now)
  userRequestTimestamps.set(userId, recent)
  next()
}

