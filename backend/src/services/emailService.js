import { sendEmail } from '../config/email.js'

function baseHtmlTemplate({ title, preheader, bodyHtml, ctaText, ctaUrl, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f4ed; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #201e19; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e8e2d4; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(53,51,45,0.06); }
    .header { padding: 32px 40px 24px; background: linear-gradient(180deg, #fff8f2 0%, #ffffff 100%); border-bottom: 1px solid #f0ebe0; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background-color: #201e19; color: #ffffff; font-weight: bold; font-size: 16px; margin-bottom: 12px; }
    .brand-name { font-size: 22px; font-weight: 600; color: #201e19; letter-spacing: -0.02em; display: inline-block; vertical-align: middle; margin-left: 10px; }
    .category-tag { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #74593f; background-color: #f5efe6; padding: 4px 10px; border-radius: 12px; margin-top: 8px; }
    .content { padding: 32px 40px; }
    .headline { font-size: 24px; font-weight: 500; color: #201e19; line-height: 1.3; margin: 0 0 16px; }
    .body-text { font-size: 14px; line-height: 1.6; color: #504d44; margin: 0 0 24px; }
    .button-wrap { margin: 32px 0; text-align: center; }
    .btn { display: inline-block; padding: 14px 32px; background-color: #201e19; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 9999px; letter-spacing: 0.02em; box-shadow: 0 4px 12px rgba(32,30,25,0.15); }
    .btn:hover { background-color: #38352e; }
    .fallback-box { background-color: #f9f7f2; border: 1px solid #ede7db; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #6e6a5f; word-break: break-all; margin-top: 24px; }
    .footer { padding: 24px 40px; background-color: #fbf9f4; border-top: 1px solid #f0ebe0; font-size: 11px; line-height: 1.5; color: #8e8a7e; text-align: center; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo-badge">T</div>
        <span class="brand-name">TaskNest</span>
      </div>
      <div class="category-tag">Architectural Fellowship Enclave</div>
    </div>
    <div class="content">
      <h1 class="headline">${title}</h1>
      <div class="body-text">
        ${bodyHtml}
      </div>
      ${
        ctaText && ctaUrl
          ? `<div class="button-wrap">
              <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
            </div>
            <div class="fallback-box">
              <strong>Secure Fallback Link:</strong><br/>
              <a href="${ctaUrl}" style="color:#74593f;">${ctaUrl}</a>
            </div>`
          : ''
      }
    </div>
    <div class="footer">
      ${footerNote || 'TaskNest Architectural Fellowship Registry • Cryptographic Enclave Protocol'}<br/>
      If you did not initiate this request, no action is required.
    </div>
  </div>
</body>
</html>`
}

export const emailService = {
  sendVerificationEmail: async (user, rawToken) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000'
    const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`
    const directApiUrl = `${serverUrl}/api/auth/verify-email?token=${rawToken}`

    const subject = 'TaskNest — Verify Your Institutional Email Address'
    const title = 'Verify Fellowship Enclave Access'
    const preheader = `Complete matriculation for candidate ${user.name}`
    const bodyHtml = `
      <p>Greetings <strong>${user.name}</strong>,</p>
      <p>You have initiated matriculation into the <strong>TaskNest Architectural Fellowship Atelier</strong>. To protect the cryptographic integrity of our cohort and unlock sprint deliverables, please verify your institutional email address.</p>
      <p style="background:#f9f7f2;padding:12px 16px;border-left:3px solid #74593f;border-radius:4px;font-size:13px;">
        <strong>Notice on Security Invariants:</strong> This single-use cryptographic verification token expires in <strong>24 hours</strong>. Unverified accounts cannot access repository blueprints or dispatch sprint deliverables.
      </p>
    `

    return sendEmail({
      to: user.email,
      subject,
      text: `Hello ${user.name},\n\nPlease verify your TaskNest fellowship email by clicking this link:\n${verificationUrl}\n\nDirect verification URL:\n${directApiUrl}\n\nThis verification link is valid for 24 hours.`,
      html: baseHtmlTemplate({
        title,
        preheader,
        bodyHtml,
        ctaText: 'Verify Fellowship Email Access →',
        ctaUrl: verificationUrl,
        footerNote: `TaskNest Identity & Enclave Access // Token SEC-256 Validated • Direct API link: ${directApiUrl}`,
      }),
    })
  },

  sendWelcome: async (user) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const dashboardUrl = `${clientUrl}/intern/dashboard`

    return sendEmail({
      to: user.email,
      subject: 'Welcome to TaskNest Architectural Fellowship',
      text: `Greetings ${user.name},\n\nYour TaskNest fellow account is now verified and active. Enter the studio: ${dashboardUrl}`,
      html: baseHtmlTemplate({
        title: 'Matriculation Complete // Welcome Fellow',
        preheader: `Welcome to TaskNest Cohort Atelier, ${user.name}`,
        bodyHtml: `
          <p>Greetings <strong>${user.name}</strong>,</p>
          <p>Your institutional email has been verified. You now maintain active fellow clearance across the TaskNest computational cluster.</p>
          <p>You may now access assigned sprint deliverables, inspect low-level kernel blueprints, and dispatch verified monographs for faculty assessment.</p>
        `,
        ctaText: 'Enter Fellow Atelier →',
        ctaUrl: dashboardUrl,
      }),
    })
  },

  sendTaskAssigned: async (user, task) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const taskUrl = `${clientUrl}/intern/tasks/${task._id || task.id}`

    return sendEmail({
      to: user.email,
      subject: `New Task Assigned: ${task.title}`,
      text: `Hello ${user.name},\n\nYou have been assigned deliverable: ${task.title} (+${task.points} XP). Deadline: ${new Date(task.deadline).toISOString().slice(0, 10)}.\n\nView details: ${taskUrl}`,
      html: baseHtmlTemplate({
        title: 'New Sprint Task Assigned',
        preheader: `Deliverable assigned: ${task.title} (+${task.points} XP)`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has assigned a new deliverable to your fellowship queue:</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;">
            <div style="font-size:11px;color:#74593f;font-weight:700;text-transform:uppercase;">${task.code || 'SPEC'} // ${task.priority || 'Medium'} Priority</div>
            <div style="font-size:18px;color:#201e19;font-weight:600;margin:6px 0;">${task.title}</div>
            <div style="font-size:13px;color:#504d44;">Available Reward: <strong>+${task.points} XP</strong> • Due: <strong>${new Date(task.deadline).toLocaleDateString()}</strong></div>
          </div>
          <p>${task.description}</p>
        `,
        ctaText: 'Inspect Deliverable Spec →',
        ctaUrl: taskUrl,
      }),
    })
  },

  sendSubmissionReceived: async (recipient, task, internName) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const queueUrl = `${clientUrl}/admin/submissions`

    return sendEmail({
      to: recipient.email,
      subject: `Deliverable Received: ${task.title}`,
      text: `Deliverable submission received for "${task.title}" by fellow ${internName || recipient.name}.`,
      html: baseHtmlTemplate({
        title: 'Deliverable Dispatched to Queue',
        preheader: `Submission received for ${task.title}`,
        bodyHtml: `
          <p>A new implementation bundle has been dispatched to the faculty review queue for <strong>${task.title}</strong> by fellow <strong>${internName || recipient.name}</strong>.</p>
          <p>Test suites and benchmark telemetry have been bound for faculty peer evaluation.</p>
        `,
        ctaText: 'Open Review Workbench →',
        ctaUrl: queueUrl,
      }),
    })
  },

  sendReviewEvaluated: async (user, task, review) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const pointsUrl = `${clientUrl}/intern/points`
    const isApproved = review.decision === 'approved'

    return sendEmail({
      to: user.email,
      subject: `Evaluation ${isApproved ? 'Approved (+XP Awarded)' : 'Revision Requested'}: ${task?.title || 'Deliverable'}`,
      text: `Hello ${user.name},\n\nYour deliverable for "${task?.title}" has been evaluated: ${review.decision.toUpperCase()}.\nPoints Awarded: +${review.pointsAwarded || 0} XP\nFeedback: ${review.feedback}\n\nView points ledger: ${pointsUrl}`,
      html: baseHtmlTemplate({
        title: isApproved ? 'Attestation Approved & Points Awarded' : 'Revisions Requested on Deliverable',
        preheader: `Evaluation complete for ${task?.title}: ${isApproved ? `+${review.pointsAwarded} XP awarded` : 'Revisions requested'}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has completed evaluation of your deliverable for <strong>${task?.title || 'Deliverable'}</strong>.</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;">
            <div style="font-size:12px;color:#74593f;font-weight:700;text-transform:uppercase;">
              Attestation Result: <strong>${review.decision.toUpperCase()}</strong>
            </div>
            ${
              isApproved
                ? `<div style="font-size:22px;color:#201e19;font-weight:700;margin:6px 0;">+${review.pointsAwarded} XP Awarded</div>`
                : `<div style="font-size:14px;color:#ba1a1a;margin:6px 0;">Please revise according to faculty feedback and resubmit.</div>`
            }
            <div style="font-size:13px;color:#504d44;margin-top:8px;font-style:italic;">
              "${review.feedback}"
            </div>
          </div>
        `,
        ctaText: 'View Fellowship Points Ledger →',
        ctaUrl: pointsUrl,
      }),
    })
  },

  sendPasswordReset: async (user, resetToken) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

    return sendEmail({
      to: user.email,
      subject: 'TaskNest — Reset Your Passphrase',
      text: `Hello ${user.name},\n\nA passphrase reset was requested for your account. Click this link:\n${resetUrl}\n\nValid for 30 minutes. If you did not request this, please ignore this email.`,
      html: baseHtmlTemplate({
        title: 'Passphrase Reset Challenge',
        preheader: `Password reset request for ${user.email}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>An enclave passphrase reset challenge was initiated for your institutional identity.</p>
          <p style="background:#f9f7f2;padding:12px 16px;border-left:3px solid #74593f;border-radius:4px;font-size:13px;">
            This single-use reset link expires in <strong>30 minutes</strong>.
          </p>
        `,
        ctaText: 'Reset Enclave Passphrase →',
        ctaUrl: resetUrl,
      }),
    })
  },
}

export default emailService
