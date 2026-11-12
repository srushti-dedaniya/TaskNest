import EmailOutbox from '../models/EmailOutbox.js'
import { sendEmail } from '../config/email.js'

let workerInterval = null
let isWorkerRunning = false

/**
 * Validates a standard email address format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 120 || trimmed.length < 3) return false
  // Standard RFC 5322 regex approximation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/**
 * Calculates exponential backoff delay in milliseconds
 * @param {number} attempt
 * @returns {number}
 */
function getBackoffMs(attempt) {
  // Attempt 1: 1 min, Attempt 2: 4 mins, Attempt 3: 16 mins
  const minutes = Math.min(Math.pow(4, Math.max(0, attempt - 1)), 60)
  return minutes * 60 * 1000
}

/**
 * Determines whether a Resend or network error is permanent (should NOT be retried)
 * @param {string} errorMsg
 * @param {string|number} [errorCode]
 * @returns {boolean}
 */
function isPermanentFailure(errorMsg = '', errorCode = '') {
  const text = (errorMsg || '').toLowerCase()
  const code = String(errorCode || '').toLowerCase()

  if (
    code === '400' ||
    code === '422' ||
    code === 'validation_error' ||
    text.includes('invalid') ||
    text.includes('not a valid email') ||
    text.includes('malformed') ||
    text.includes('missing required') ||
    text.includes('only send testing emails to your own email address') ||
    text.includes('please verify a domain')
  ) {
    return true
  }

  return false
}

/**
 * Dispatches a single EmailOutbox document via the centralized Resend transport
 * @param {import('mongoose').Document} item
 * @returns {Promise<Object>}
 */
export async function dispatchOutboxItem(item) {
  item.status = 'processing'
  item.attempts = (item.attempts || 0) + 1
  item.lastAttemptAt = new Date()
  await item.save()

  try {
    const result = await sendEmail({
      to: item.recipient,
      subject: item.subject,
      html: item.html,
      text: item.text,
      from: item.from,
    })

    if (result.success && result.delivered) {
      item.status = 'accepted'
      item.providerMessageId = result.id
      item.error = null
      item.errorCode = null
      await item.save()

      return { success: true, delivered: true, id: result.id, outboxId: item._id }
    }

    // In-memory test simulation mode
    if (result.journaled) {
      item.status = 'accepted'
      item.providerMessageId = result.id
      item.error = null
      await item.save()

      return { success: true, delivered: false, journaled: true, id: result.id, outboxId: item._id }
    }

    // Provider reported an error
    const errorMsg = result.error || 'Resend delivery failed'
    const isPermanent = isPermanentFailure(errorMsg, result.code)

    item.error = errorMsg
    item.errorCode = result.code ? String(result.code) : 'PROVIDER_ERROR'
    item.isPermanentError = isPermanent

    if (isPermanent || item.attempts >= item.maxAttempts) {
      item.status = 'failed'
    } else {
      item.status = 'pending'
      item.nextAttemptAt = new Date(Date.now() + getBackoffMs(item.attempts))
    }

    await item.save()
    return { success: false, delivered: false, error: errorMsg, isPermanent, outboxId: item._id }
  } catch (err) {
    const errorMsg = err?.message || 'Unexpected error during email dispatch'
    const isPermanent = isPermanentFailure(errorMsg)

    item.error = errorMsg
    item.isPermanentError = isPermanent

    if (isPermanent || item.attempts >= item.maxAttempts) {
      item.status = 'failed'
    } else {
      item.status = 'pending'
      item.nextAttemptAt = new Date(Date.now() + getBackoffMs(item.attempts))
    }

    await item.save()
    return { success: false, delivered: false, error: errorMsg, outboxId: item._id }
  }
}

/**
 * Enqueues an email into the database-backed outbox with idempotency protection.
 * Performs immediate fast-path transmission by default.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} [options.recipientName] - Human name
 * @param {string} options.subject - Subject line
 * @param {string} options.type - One of the 18 notification types
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Plaintext fallback
 * @param {string} [options.from] - Sender override
 * @param {string} [options.idempotencyKey] - Unique key preventing duplicate sends
 * @param {Object} [options.metadata] - Extra context (taskId, userId, etc.)
 * @param {boolean} [options.immediate=true] - Attempt fast-path transmission immediately
 * @returns {Promise<{success: boolean, delivered: boolean, id?: string, outboxId?: string, duplicate?: boolean, error?: string}>}
 */
export async function enqueueEmail({
  to,
  recipientName = '',
  subject,
  type,
  html,
  text = '',
  from,
  idempotencyKey,
  metadata = {},
  immediate = true,
}) {
  const cleanRecipient = (to || '').trim().toLowerCase()

  if (!isValidEmail(cleanRecipient)) {
    const errorMsg = `Invalid recipient email address: "${to}"`
    console.error(`[emailOutbox:invalidRecipient] ${errorMsg}`)
    return { success: false, delivered: false, error: errorMsg }
  }

  const defaultFrom = process.env.EMAIL_FROM || 'TaskNest <onboarding@resend.dev>'
  const resolvedFrom = from || defaultFrom

  // Idempotency check: if an email with this key was already enqueued or sent, do not duplicate
  if (idempotencyKey) {
    const existing = await EmailOutbox.findOne({ idempotencyKey })
    if (existing) {
      console.log(
        `[emailOutbox:idempotent] Skipping duplicate send for key "${idempotencyKey}" (status: ${existing.status})`
      )
      return {
        success: existing.status === 'accepted' || existing.status === 'delivered',
        delivered: existing.status === 'accepted' || existing.status === 'delivered',
        duplicate: true,
        id: existing.providerMessageId,
        outboxId: existing._id,
        status: existing.status,
      }
    }
  }

  let outboxDoc
  try {
    outboxDoc = await EmailOutbox.create({
      idempotencyKey: idempotencyKey || undefined,
      recipient: cleanRecipient,
      recipientName,
      from: resolvedFrom,
      subject,
      type,
      html,
      text,
      status: 'pending',
      nextAttemptAt: new Date(),
      metadata,
    })
  } catch (err) {
    // Duplicate key caught by MongoDB unique index during race condition
    if (err.code === 11000 && idempotencyKey) {
      const existing = await EmailOutbox.findOne({ idempotencyKey })
      return {
        success: existing?.status === 'accepted' || existing?.status === 'delivered',
        delivered: existing?.status === 'accepted' || existing?.status === 'delivered',
        duplicate: true,
        id: existing?.providerMessageId,
        outboxId: existing?._id,
      }
    }
    throw err
  }

  // Fast-path immediate transmission
  if (immediate) {
    return await dispatchOutboxItem(outboxDoc)
  }

  return { success: true, delivered: false, queued: true, outboxId: outboxDoc._id }
}

/**
 * Processes queued and retryable emails from the outbox.
 * Also reclaims any stranded 'processing' emails from crashed server instances.
 */
export async function processOutboxQueue() {
  if (isWorkerRunning) return
  isWorkerRunning = true

  try {
    // 1. Reclaim stalled 'processing' documents (stranded for > 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    await EmailOutbox.updateMany(
      { status: 'processing', lastAttemptAt: { $lt: fiveMinutesAgo } },
      { $set: { status: 'pending' } }
    )

    // 2. Query next pending items due for transmission
    const pendingItems = await EmailOutbox.find({
      status: 'pending',
      isPermanentError: false,
      nextAttemptAt: { $lte: new Date() },
    })
      .sort({ nextAttemptAt: 1 })
      .limit(10)

    for (const item of pendingItems) {
      await dispatchOutboxItem(item)
    }
  } catch (err) {
    console.error('[emailOutbox:workerError]', err.message)
  } finally {
    isWorkerRunning = false
  }
}

/**
 * Starts the periodic background outbox retry worker
 * @param {Object} [options]
 * @param {number} [options.intervalMs=45000]
 */
export function startOutboxWorker({ intervalMs = 45000 } = {}) {
  if (workerInterval) return

  // Run initial pass after 5 seconds
  setTimeout(() => processOutboxQueue().catch(() => {}), 5000)

  workerInterval = setInterval(() => {
    processOutboxQueue().catch((err) => {
      console.error('[emailOutbox:cronError]', err.message)
    })
  }, intervalMs)

  if (workerInterval.unref) workerInterval.unref()
  console.log(`[emailOutbox] Background queue worker active (poll interval: ${intervalMs}ms)`)
}

/**
 * Stops the background worker gracefully
 */
export function stopOutboxWorker() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
    console.log('[emailOutbox] Background queue worker stopped.')
  }
}

/**
 * Processes webhook events from Resend (delivery, bounce, complaint)
 * @param {Object} eventPayload
 */
export async function recordWebhookEvent(eventPayload) {
  const { type: eventType, data } = eventPayload || {}
  const providerMessageId = data?.email_id || data?.id

  if (!providerMessageId) return { updated: false, reason: 'Missing email_id' }

  const item = await EmailOutbox.findOne({ providerMessageId })
  if (!item) return { updated: false, reason: 'No matching outbox record found' }

  item.webhookEvents.push({
    event: eventType,
    timestamp: new Date(),
    payload: eventPayload,
  })

  if (eventType === 'email.delivered') {
    item.status = 'delivered'
  } else if (eventType === 'email.bounced') {
    item.status = 'bounced'
    item.isPermanentError = true
  } else if (eventType === 'email.complained') {
    item.status = 'complained'
  }

  await item.save()
  console.log(`[emailOutbox:webhook] ${providerMessageId} updated to status "${item.status}"`)

  return { updated: true, status: item.status, outboxId: item._id }
}

export default {
  enqueueEmail,
  dispatchOutboxItem,
  processOutboxQueue,
  startOutboxWorker,
  stopOutboxWorker,
  recordWebhookEvent,
  isValidEmail,
}

