import { ApiError } from '../utils/ApiError.js'

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.') || '_',
        message: i.message,
      }))
      const summaryMsg = details.map((d) => d.message).join('; ')
      return next(ApiError.badRequest(summaryMsg ? `Validation failed: ${summaryMsg}` : 'Validation failed', details))
    }
    req[source] = result.data
    next()
  }
}
