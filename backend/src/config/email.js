import { Resend } from 'resend'

const sentEmailsJournal = []

/**
 * Resolves the Resend API client or returns null if no key is configured.
 * Supports RESEND_API_KEY or falls back to an existing EMAIL_PASS starting with 're_'.
 */
function getResendClient() {
  const apiKey =
    process.env.RESEND_API_KEY ||
    (process.env.EMAIL_PASS?.startsWith('re_') ? process.env.EMAIL_PASS : null)

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

/**
 * Centralized email sending function using the official Resend HTTPS API.
 * Never connects over raw SMTP ports (25, 465, 587) to prevent Render connection timeouts.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML formatted body
 * @param {string} [options.from] - Custom sender (defaults to process.env.EMAIL_FROM)
 * @returns {Promise<{success: boolean, delivered: boolean, id?: string, error?: string, journaled?: boolean}>}
 */
export async function sendEmail({ to, subject, text, html, from: customFrom }) {
  const defaultFrom = process.env.EMAIL_FROM || 'TaskNest <onboarding@resend.dev>'
  const from = customFrom || defaultFrom
  const recipientList = Array.isArray(to) ? to : [to]
  const primaryRecipient = recipientList[0] || ''

  const record = {
    messageId: `resend-init-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    from,
    to: recipientList.join(', '),
    subject,
    text,
    html,
    accepted: [...recipientList],
    rejected: [],
    timestamp: new Date(),
    deliveredVia: 'https-api',
  }

  // Record into in-memory journal for auditing and automated test validation
  sentEmailsJournal.push(record)

  const resend = getResendClient()

  // If no Resend API key is configured, simulate cleanly in memory
  if (!resend) {
    const isExplicitlyDisabled = process.env.EMAIL_ENABLED === 'false'
    console.log(
      `[email:simulated] to=${primaryRecipient} subject="${subject}" (${
        isExplicitlyDisabled ? 'EMAIL_ENABLED=false' : 'No RESEND_API_KEY configured'
      })`
    )
    record.deliveredVia = 'in-memory-journal'
    return {
      success: true,
      delivered: false,
      journaled: true,
      id: record.messageId,
      record,
    }
  }

  try {
    // 10-second HTTPS timeout controller to prevent any hanging connections on cloud containers
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Resend HTTPS API request timed out after 10000ms'))
      }, 10000)
      if (timer.unref) timer.unref()
    })

    const payload = {
      from,
      to: recipientList,
      subject,
      text: text || undefined,
      html: html || undefined,
    }

    const sendPromise = resend.emails.send(payload)

    // Race between Resend SDK HTTPS dispatch and our 10-second timeout
    const result = await Promise.race([sendPromise, timeoutPromise])

    if (result?.error) {
      const errorMsg = result.error.message || 'Resend API rejected email delivery'
      record.error = errorMsg
      record.rejected = recipientList
      console.error(
        `[email:error] to=${primaryRecipient} subject="${subject}": ${errorMsg}`
      )
      return {
        success: false,
        delivered: false,
        error: errorMsg,
        code: result.error.name || result.error.statusCode,
      }
    }

    const resendId = result?.data?.id || record.messageId
    record.messageId = resendId
    console.log(`[email:dispatched] to=${primaryRecipient} resendId=${resendId}`)

    return {
      success: true,
      delivered: true,
      id: resendId,
      data: result?.data,
    }
  } catch (err) {
    const safeError = err?.message || 'Failed to dispatch email over HTTPS'
    record.error = safeError
    record.rejected = recipientList
    console.error(
      `[email:error] to=${primaryRecipient} subject="${subject}": ${safeError}`
    )
    return {
      success: false,
      delivered: false,
      error: safeError,
    }
  }
}

/**
 * Return all sent emails from memory journal (used by test suites and diagnostics)
 */
export function getSentEmails() {
  return [...sentEmailsJournal]
}

/**
 * Filter sent emails by recipient
 */
export function getSentEmailsFor(to) {
  if (!to) return []
  return sentEmailsJournal.filter(
    (e) => (e.to || '').toLowerCase().includes(to.toLowerCase())
  )
}

/**
 * Get the latest recorded email for a recipient
 */
export function getLatestEmail(to) {
  const matched = to ? getSentEmailsFor(to) : sentEmailsJournal
  return matched[matched.length - 1] || null
}

/**
 * Clear the in-memory email journal
 */
export function clearSentEmails() {
  sentEmailsJournal.length = 0
}

export default {
  sendEmail,
  getSentEmails,
  getSentEmailsFor,
  getLatestEmail,
  clearSentEmails,
}
