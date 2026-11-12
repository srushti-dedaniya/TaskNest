import crypto from 'node:crypto'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/generateToken.js'
import User from '../models/User.js'
import emailService from '../services/emailService.js'

const IS_PROD = process.env.NODE_ENV === 'production'
const BASE_COOKIE = { httpOnly: true, sameSite: IS_PROD ? 'none' : 'lax', secure: IS_PROD, path: '/' }

function setAuthCookies(res, user) {
  res.cookie('access_token', signAccessToken(user), { ...BASE_COOKIE, maxAge: 15 * 60 * 1000 })
  res.cookie('refresh_token', signRefreshToken(user), { ...BASE_COOKIE, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, institution, fieldOfStudy } = req.body
  if (req.body.confirmPassword && req.body.confirmPassword !== password) {
    throw ApiError.badRequest('Validation failed', [{ field: 'confirmPassword', message: 'Passwords do not match' }])
  }
  const exists = await User.findOne({ email })
  if (exists) throw ApiError.conflict('An account with this email already exists')

  /* Generate single-use cryptographic verification token */
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  /* Public registration creates unverified Intern accounts only */
  const user = await User.create({
    name,
    email,
    password,
    role: 'intern',
    isEmailVerified: false,
    emailVerification: { tokenHash, expiresAt },
    lastVerificationSentAt: new Date(),
    institution,
    fieldOfStudy,
  })

  /* Send branded HTML verification email */
  const emailRes = await emailService.sendVerificationEmail(user, rawToken).catch((err) => {
    console.error('[authController] Failed to dispatch verification email:', err?.message || err)
    return { success: false, error: err?.message }
  })

  let registerMessage = 'Intern registered successfully. A verification link has been dispatched to your email.'
  if (emailRes?.error && emailRes.error.includes('only send testing emails to your own email address')) {
    registerMessage =
      'Intern registered successfully. In Resend testing mode, emails are delivered to the registered account email (srushtidedaniya@gmail.com).'
  }

  res.status(201).json({
    message: registerMessage,
    email: user.email,
    isEmailVerified: false,
    emailDelivered: emailRes?.delivered ?? false,
    user: user.toSafeJSON(),
  })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body?.token || req.query?.token
  const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'

  if (!token || typeof token !== 'string') {
    if (req.method === 'GET') {
      return res.redirect(`${clientUrl}/verify-email?error=missing_token`)
    }
    throw ApiError.badRequest('Verification token is required')
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')

  const user = await User.findOne({
    'emailVerification.tokenHash': tokenHash,
  }).select('+emailVerification.tokenHash +emailVerification.expiresAt')

  if (!user) {
    if (req.method === 'GET') {
      return res.redirect(`${clientUrl}/verify-email?error=invalid_token`)
    }
    throw ApiError.badRequest('Verification token is invalid or has already been used.')
  }

  if (user.emailVerification?.expiresAt && user.emailVerification.expiresAt < new Date()) {
    if (req.method === 'GET') {
      return res.redirect(`${clientUrl}/verify-email?error=expired_token&email=${encodeURIComponent(user.email)}`)
    }
    throw ApiError.badRequest('Verification token has expired. Please request a new verification link.')
  }

  /* Set account as verified and clear tokens */
  user.isEmailVerified = true
  user.emailVerification = undefined
  await user.save()

  /* Dispatch welcome email */
  await emailService.sendWelcome(user).catch(() => {})

  const authToken = signAccessToken(user)
  setAuthCookies(res, user)

  if (req.method === 'GET') {
    return res.redirect(`${clientUrl}/verify-email?status=success&token=${encodeURIComponent(token.trim())}&jwt=${encodeURIComponent(authToken)}`)
  }

  res.json({
    message: 'Email successfully verified. You can now access your intern dashboard.',
    user: user.toSafeJSON(),
    token: authToken,
  })
})

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email }).select('+emailVerification.tokenHash +emailVerification.expiresAt')

  /* Return positive message even if email not found to prevent user enumeration */
  if (!user) {
    return res.json({
      message: 'If your institutional email is registered, a new verification link has been dispatched.',
    })
  }

  if (user.isEmailVerified) {
    return res.json({
      message: 'This institutional account is already verified. You may sign in directly.',
      alreadyVerified: true,
    })
  }

  /* 60-second resend cooldown */
  const COOLDOWN_MS = 60 * 1000
  if (user.lastVerificationSentAt) {
    const elapsed = Date.now() - new Date(user.lastVerificationSentAt).getTime()
    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
      throw new ApiError(429, `Please wait ${waitSeconds} seconds before requesting another verification email.`, {
        code: 'RESEND_COOLDOWN',
        retryAfter: waitSeconds,
      })
    }
  }

  /* Generate new token and update expiration */
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  user.emailVerification = { tokenHash, expiresAt }
  user.lastVerificationSentAt = new Date()
  await user.save()

  const emailRes = await emailService.sendVerificationEmail(user, rawToken).catch((err) => {
    console.error('[authController] Resend email failed:', err?.message || err)
    return { success: false, error: err?.message }
  })

  let resendMessage = 'A fresh verification link has been dispatched to your institutional inbox.'
  if (emailRes?.error) {
    if (emailRes.error.includes('only send testing emails to your own email address')) {
      resendMessage =
        'In Resend testing mode, verification emails can only be delivered to the Resend account owner email (srushtidedaniya@gmail.com). To send to other domains, please verify a domain in the Resend dashboard.'
    } else {
      resendMessage = `Verification token generated, but email dispatch reported: ${emailRes.error}`
    }
  }

  res.json({
    message: resendMessage,
    email: user.email,
    delivered: emailRes?.delivered ?? false,
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or passphrase credentials')
  }

  /* Unverified interns must not access protected features */
  if (user.role === 'intern' && user.isEmailVerified === false) {
    throw new ApiError(403, 'Institutional email pending verification. Please verify your email before accessing TaskNest.', {
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
      unverified: true,
    })
  }

  user.lastLoginAt = new Date()
  await user.save()
  const token = signAccessToken(user)
  setAuthCookies(res, user)
  res.json({ user: user.toSafeJSON(), token })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('access_token', BASE_COOKIE)
  res.clearCookie('refresh_token', BASE_COOKIE)
  res.json({ message: 'Logged out' })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) throw ApiError.unauthorized('No refresh token')
  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw ApiError.unauthorized('Refresh token invalid or expired')
  }
  const user = await User.findById(payload.sub)
  if (!user) throw ApiError.unauthorized('Account no longer exists')
  if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
    throw ApiError.unauthorized('Session revoked')
  }
  setAuthCookies(res, user)
  res.json({ user: user.toSafeJSON() })
})

export const me = asyncHandler((req, res) => {
  res.json({ user: req.user.toSafeJSON() })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'institution', 'fieldOfStudy', 'bio']
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key]
  }
  if (req.body.currentPassword && req.body.newPassword) {
    const ok = await req.user.comparePassword(req.body.currentPassword).catch(() => false)
    if (!ok) throw ApiError.unauthorized('Current password is incorrect')
    const strong = typeof req.body.newPassword === 'string' && req.body.newPassword.length >= 8
    if (!strong) throw ApiError.badRequest('New password must be at least 8 characters')
    req.user.password = req.body.newPassword
    req.user.tokenVersion = (req.user.tokenVersion ?? 0) + 1
    await req.user.save()
    await emailService.sendPasswordChanged(req.user).catch(() => {})
    return res.json({ user: req.user.toSafeJSON(), passwordChanged: true })
  }
  await req.user.save()
  res.json({ user: req.user.toSafeJSON() })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = {
      hash: crypto.createHash('sha256').update(token).digest('hex'),
      expires: Date.now() + 30 * 60 * 1000,
    }
    await user.save()
    await emailService.sendPasswordReset(user, token).catch(() => {})
  }
  res.json({ message: 'If that email is registered, reset instructions have been sent.' })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({ 'resetToken.hash': hash, 'resetToken.expires': { $gt: Date.now() } })
  if (!user) throw ApiError.badRequest('Reset token is invalid or expired')
  user.password = password
  user.resetToken = undefined
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()

  /* Dispatch security confirmation email */
  await emailService.sendPasswordChanged(user).catch((err) => {
    console.warn('[authController] Failed to send password changed confirmation:', err.message)
  })

  res.json({ message: 'Password updated. You can now sign in with your new passphrase.' })
})
