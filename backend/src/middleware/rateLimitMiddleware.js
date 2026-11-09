import { ApiError } from '../utils/ApiError.js'

export function createRateLimiter({ windowMs = 15 * 60 * 1000, maxRequests = 20, message = 'Too many requests, please try again later.' }) {
  const store = new Map()

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key)
      }
    }
  }, windowMs).unref?.()

  return (req, _res, next) => {
    // In automated testing with fast sequential calls, allow test bypass if NODE_ENV === 'test' unless testing rate limits
    const clientKey = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    let record = store.get(clientKey)
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs }
      store.set(clientKey, record)
      return next()
    }

    record.count += 1
    if (record.count > maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000)
      throw new ApiError(429, `${message} Try again in ${waitSeconds}s.`, {
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: waitSeconds,
      })
    }

    next()
  }
}

