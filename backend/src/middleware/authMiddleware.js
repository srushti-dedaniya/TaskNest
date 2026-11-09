import { asyncHandler, ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/generateToken.js'
import User from '../models/User.js'

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = req.cookies?.access_token || bearerToken
  if (!token) throw ApiError.unauthorized()
  let payload
  try {
    payload = verifyAccessToken(token)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired', { code: 'TOKEN_EXPIRED' })
    }
    throw ApiError.unauthorized('Invalid session token')
  }
  const user = await User.findById(payload.sub)
  if (!user) throw ApiError.unauthorized('Account no longer exists')

  /* Ensure unverified interns cannot access protected features */
  if (user.role === 'intern' && user.isEmailVerified === false) {
    throw new ApiError(403, 'Institutional email pending verification. Please verify your email to access TaskNest.', {
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
    })
  }

  req.user = user
  next()
})
