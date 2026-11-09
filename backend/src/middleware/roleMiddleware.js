import { ApiError } from '../utils/ApiError.js'

export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (req.user.role !== role) return next(ApiError.forbidden())
    next()
  }
}

export const requireIntern = requireRole('intern')
export const requireAdmin = requireRole('admin')
