import { z } from 'zod'

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .min(3, 'Email is required')
  .max(120)
  .email('Provide a valid email address')

const password = (label = 'Password') =>
  z
    .string({ required_error: `${label} is required` })
    .min(8, `${label} must be at least 8 characters`)
    .max(100, `${label} must be at most 100 characters`)

export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name is too short').max(80),
  email,
  password: password(),
  confirmPassword: z.string().optional(),
  institution: z.string().trim().max(120).optional().or(z.literal('')),
  fieldOfStudy: z.string().trim().max(120).optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(10, 'Reset token required'),
  password: password('New password'),
})

export const verifyEmailSchema = z.object({
  token: z.string({ required_error: 'Verification token is required' }).min(10, 'Invalid token'),
})

export const resendVerificationSchema = z.object({
  email,
})
