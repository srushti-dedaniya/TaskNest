import nodemailer from 'nodemailer'

let transporter = null
const sentEmailsJournal = []

function getTransporter() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS

  const isEnabled = process.env.EMAIL_ENABLED === 'true' || Boolean(host && user)

  if (!isEnabled) return null

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'TaskNest <no-reply@tasknest.org>'
  const tx = getTransporter()

  const record = {
    messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    from,
    to,
    subject,
    text,
    html,
    accepted: [to],
    rejected: [],
    timestamp: new Date(),
    deliveredVia: tx ? 'smtp' : 'in-memory-journal',
  }

  // Always keep in journal for audit and automated testing verification
  sentEmailsJournal.push(record)

  if (!tx) {
    console.log(`[email:simulated] to=${to} subject="${subject}" (in-memory journal recorded)`)
    return { success: true, delivered: false, journaled: true, record }
  }

  try {
    const info = await tx.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
    record.messageId = info.messageId || record.messageId
    record.accepted = info.accepted || [to]
    record.rejected = info.rejected || []
    record.response = info.response
    console.log(`[email:dispatched] to=${to} messageId=${record.messageId}`)
    return { success: true, delivered: true, info }
  } catch (err) {
    record.error = err.message
    record.rejected = [to]
    console.error(`[email:error] to=${to} subject="${subject}":`, err.message)
    return { success: false, delivered: false, error: err.message }
  }
}

export function getSentEmails() {
  return [...sentEmailsJournal]
}

export function getSentEmailsFor(to) {
  return sentEmailsJournal.filter((e) => e.to.toLowerCase() === to.toLowerCase())
}

export function getLatestEmail(to) {
  const matched = to ? getSentEmailsFor(to) : sentEmailsJournal
  return matched[matched.length - 1] || null
}

export function clearSentEmails() {
  sentEmailsJournal.length = 0
}
