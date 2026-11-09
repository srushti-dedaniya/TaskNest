import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './config/database.js'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskSubmissionRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()

const origin = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim())
app.use(
  cors({
    origin: (reqOrigin, cb) => {
      if (!reqOrigin || origin.includes(reqOrigin) || reqOrigin?.startsWith('http://localhost')) return cb(null, true)
      return cb(new Error(`CORS origin not allowed: ${reqOrigin}`))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/healthz', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))
app.use('/api/auth', authRoutes)
app.use('/api', taskRoutes)
app.use('/api', userRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = Number(process.env.PORT || 5000)

async function start() {
  try {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment')
    }
    await connectDatabase()
    return app.listen(PORT, () => console.log(`[api] TaskNest API listening on http://localhost:${PORT}`))
  } catch (err) {
    console.error('[fatal] Could not start server:', err.message)
    process.exit(1)
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)
if (isDirectRun) {
  start()
}

export default app
export { app, start }
