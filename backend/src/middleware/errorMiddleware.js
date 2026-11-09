import { ApiError, asyncHandler } from '../utils/ApiError.js'

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500
  if (status === 500) {
    if (err.name === 'ValidationError') {
      status = 400
      err.message = err.details?.message || Object.values(err.errors || {}).map((e) => e.message).join(', ') || err.message
    } else if (err.name === 'CastError') {
      status = 400
      err.message = `Invalid value for ${err.path}`
    } else if (err.code === 11000 && err.keyValue) {
      status = 409
      err.message = `Duplicate value for ${Object.keys(err.keyValue).join(', ')}`
    } else {
      console.error('[error]', err)
      err.message = 'Internal server error'
    }
  }
  const body = {
    message: err.message,
    code: err.details?.code || err.code,
    details: err.details,
    ...(err.details && typeof err.details === 'object' ? err.details : {}),
  }
  res.status(status).json(body)
}
