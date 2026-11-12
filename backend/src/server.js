import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './config/database.js'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskSubmissionRoutes.js'
import userRoutes from './routes/userRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import reminderRoutes from './routes/reminderRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { startDeadlineScheduler, stopDeadlineScheduler } from './services/reminderService.js'
import { startOutboxWorker, stopOutboxWorker, recordWebhookEvent } from './services/emailOutboxService.js'

const app = express()

const origin = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))

app.use(
  cors({
    origin: (reqOrigin, cb) => {
      const cleanReqOrigin = reqOrigin ? reqOrigin.replace(/\/$/, '') : reqOrigin
      if (
        !cleanReqOrigin ||
        origin.includes(cleanReqOrigin) ||
        cleanReqOrigin.startsWith('http://localhost') ||
        cleanReqOrigin.startsWith('http://127.0.0.1')
      ) {
        return cb(null, true)
      }
      return cb(new Error(`CORS origin not allowed: ${reqOrigin}`))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/healthz', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api', aiRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api', reminderRoutes)
app.use('/api/notifications', notificationRoutes)
app.post('/api/webhooks/resend', express.json(), async (req, res) => {
  try {
    const result = await recordWebhookEvent(req.body)
    res.json({ received: true, result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
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
    // Optional legacy port forwarder (5173 -> 3000) so verification email links dispatched to 5173 forward to 3000
    let server
    let forwarder
    try {
      const httpModule = await import('node:http')
      forwarder = httpModule.default.createServer((req, res) => {
        const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost'
        res.writeHead(302, { Location: `http://${host}:3000${req.url}`, 'Access-Control-Allow-Origin': '*' })
        res.end()
      })
      forwarder.on('error', (e) => console.log('[forwarder-5173] note:', e.message))
      forwarder.listen(5173, () => console.log('[forwarder-5173] Active: http://localhost:5173 -> http://localhost:3000'))
    } catch (e) {
      // ignore
    }

    server = app.listen(PORT, () => {
      console.log(`[api] TaskNest API listening on http://localhost:${PORT}`)
      startDeadlineScheduler()
      startOutboxWorker()
    })

    const shutdown = () => {
      stopDeadlineScheduler()
      stopOutboxWorker()
      if (forwarder) forwarder.close()
      if (server) server.close()
    }
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)

    return server
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
