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
      <div class="category-tag">Internship Portal</div>
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
              <strong>Direct Link:</strong><br/>
              <a href="${ctaUrl}" style="color:#74593f;">${ctaUrl}</a>
            </div>`
          : ''
      }
    </div>
    <div class="footer">
      ${footerNote || 'TaskNest Task Management & Intern Portal'}<br/>
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

    const subject = 'TaskNest — Verify Your Intern Email Address'
    const title = 'Verify Your Intern Account'
    const preheader = `Verify email address for ${user.name}`
    const bodyHtml = `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for registering with <strong>TaskNest</strong>. Please verify your email address to access your intern dashboard and view assigned tasks.</p>
      <p style="background:#f9f7f2;padding:12px 16px;border-left:3px solid #74593f;border-radius:4px;font-size:13px;">
        <strong>Note:</strong> This verification link is valid for <strong>24 hours</strong>. Once verified, you can log in and submit your work.
      </p>
    `

    return await sendEmail({
      to: user.email,
      subject,
      text: `Hello ${user.name},\n\nPlease verify your TaskNest account by clicking this link:\n${verificationUrl}\n\nDirect link:\n${directApiUrl}\n\nThis verification link is valid for 24 hours.`,
      html: baseHtmlTemplate({
        title,
        preheader,
        bodyHtml,
        ctaText: 'Verify Email Address →',
        ctaUrl: verificationUrl,
        footerNote: `TaskNest Account Security • Direct link: ${directApiUrl}`,
      }),
    })
  },

  sendOtpEmail: async (user, otpCode, purpose = 'Verification') => {
    const subject = `TaskNest — Your ${purpose} Code: ${otpCode}`
    const title = `${purpose} One-Time Passcode`
    const preheader = `Your single-use security code is ${otpCode}`
    const bodyHtml = `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Use the one-time passcode below to complete your ${purpose.toLowerCase()}:</p>
      <div style="background:#f9f7f2;padding:18px 24px;border-radius:12px;margin:20px 0;text-align:center;">
        <span style="font-family:monospace;font-size:32px;letter-spacing:0.25em;color:#201e19;font-weight:700;">${otpCode}</span>
      </div>
      <p style="font-size:12px;color:#74593f;">This code is valid for 10 minutes. For your security, do not share this code with anyone.</p>
    `

    return await sendEmail({
      to: user.email,
      subject,
      text: `Hello ${user.name},\n\nYour ${purpose} code is: ${otpCode}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html: baseHtmlTemplate({
        title,
        preheader,
        bodyHtml,
        footerNote: 'TaskNest Identity & Access Security',
      }),
    })
  },

  sendWelcome: async (user) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const dashboardUrl = `${clientUrl}/intern/dashboard`

    return await sendEmail({
      to: user.email,
      subject: 'Welcome to TaskNest — Account Verified',
      text: `Hello ${user.name},\n\nYour TaskNest intern account is now verified. Access your dashboard: ${dashboardUrl}`,
      html: baseHtmlTemplate({
        title: 'Account Verified // Welcome to TaskNest',
        preheader: `Welcome to TaskNest, ${user.name}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your institutional email has been verified successfully. Your intern account is now active.</p>
          <p>You can now log in, view your daily tasks and weekly goals, submit your work, and track your points.</p>
        `,
        ctaText: 'Go to Intern Dashboard →',
        ctaUrl: dashboardUrl,
      }),
    })
  },

  sendTaskAssigned: async (user, task) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const taskUrl = `${clientUrl}/intern/tasks/${task._id || task.id}`

    return await sendEmail({
      to: user.email,
      subject: `New Task Assigned: ${task.title}`,
      text: `Hello ${user.name},\n\nYou have been assigned a new task: ${task.title} (+${task.points} points). Deadline: ${new Date(task.deadline).toISOString().slice(0, 10)}.\n\nView details: ${taskUrl}`,
      html: baseHtmlTemplate({
        title: 'New Task Assigned',
        preheader: `Task assigned: ${task.title} (+${task.points} points)`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has assigned a new task to you:</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;">
            <div style="font-size:11px;color:#74593f;font-weight:700;text-transform:uppercase;">${task.code || 'TASK'} // ${task.priority || 'Medium'} Priority</div>
            <div style="font-size:18px;color:#201e19;font-weight:600;margin:6px 0;">${task.title}</div>
            <div style="font-size:13px;color:#504d44;">Reward: <strong>+${task.points} points</strong> • Due: <strong>${new Date(task.deadline).toLocaleDateString()}</strong></div>
          </div>
          <p>${task.description}</p>
        `,
        ctaText: 'View Task Details →',
        ctaUrl: taskUrl,
      }),
    })
  },

  sendSubmissionReceived: async (recipient, task, internName) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const queueUrl = `${clientUrl}/admin/submissions`

    return await sendEmail({
      to: recipient.email,
      subject: `Task Submission Received: ${task.title}`,
      text: `Submission received for "${task.title}" by intern ${internName || recipient.name}.`,
      html: baseHtmlTemplate({
        title: 'New Task Submission Received',
        preheader: `Submission received for ${task.title}`,
        bodyHtml: `
          <p>A new submission has been submitted for <strong>${task.title}</strong> by intern <strong>${internName || recipient.name}</strong>.</p>
          <p>It is now awaiting your review in the submission reviews queue.</p>
        `,
        ctaText: 'Review Submission →',
        ctaUrl: queueUrl,
      }),
    })
  },

  sendReviewEvaluated: async (user, task, review) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const pointsUrl = `${clientUrl}/intern/points`
    const isApproved = review.decision === 'approved'

    return await sendEmail({
      to: user.email,
      subject: `Task Review: ${isApproved ? 'Approved (+Points Awarded)' : 'Changes Needed'} - ${task?.title || 'Task'}`,
      text: `Hello ${user.name},\n\nYour submission for "${task?.title}" has been reviewed: ${review.decision.toUpperCase()}.\nPoints Awarded: +${review.pointsAwarded || 0} XP\nFeedback: ${review.feedback}\n\nView points: ${pointsUrl}`,
      html: baseHtmlTemplate({
        title: isApproved ? 'Submission Approved & Points Awarded' : 'Changes Needed on Task Submission',
        preheader: `Review complete for ${task?.title}: ${isApproved ? `+${review.pointsAwarded} points awarded` : 'Changes needed'}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has reviewed your submission for <strong>${task?.title || 'Task'}</strong>.</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;">
            <div style="font-size:12px;color:#74593f;font-weight:700;text-transform:uppercase;">
              Status: <strong>${isApproved ? 'Approved' : 'Changes Needed'}</strong>
            </div>
            ${
              isApproved
                ? `<div style="font-size:22px;color:#201e19;font-weight:700;margin:6px 0;">+${review.pointsAwarded} Points Awarded</div>`
                : `<div style="font-size:14px;color:#ba1a1a;margin:6px 0;">Please review the faculty feedback below and submit updated work.</div>`
            }
            <div style="font-size:13px;color:#504d44;margin-top:8px;font-style:italic;">
              "${review.feedback}"
            </div>
          </div>
        `,
        ctaText: 'View Points & Performance →',
        ctaUrl: pointsUrl,
      }),
    })
  },

  sendPasswordReset: async (user, resetToken) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

    return await sendEmail({
      to: user.email,
      subject: 'TaskNest — Reset Your Password',
      text: `Hello ${user.name},\n\nA password reset was requested for your account. Click this link:\n${resetUrl}\n\nValid for 30 minutes. If you did not request this, please ignore this email.`,
      html: baseHtmlTemplate({
        title: 'Reset Your Password',
        preheader: `Password reset request for ${user.email}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your TaskNest account password.</p>
          <p style="background:#f9f7f2;padding:12px 16px;border-left:3px solid #74593f;border-radius:4px;font-size:13px;">
            This single-use reset link expires in <strong>30 minutes</strong>.
          </p>
        `,
        ctaText: 'Reset Password →',
        ctaUrl: resetUrl,
      }),
    })
  },

  sendDeadlineReminder: async ({ user, task, stage, formattedDeadline }) => {
    const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
    const taskUrl = `${clientUrl}/intern/tasks/${task._id}`

    const stageConfig = {
      TASK_DEADLINE_24H: {
        subject: `TaskNest Reminder: "${task.title}" is due in 24 hours`,
        title: 'Task Due Tomorrow (24h Reminder)',
        headline: 'Your task deadline is approaching in 24 hours.',
        badgeColor: '#74593f',
      },
      TASK_DEADLINE_1H: {
        subject: `TaskNest Urgent: "${task.title}" is due in 1 hour`,
        title: 'Urgent: Task Due in 1 Hour',
        headline: 'Final reminder: only 1 hour remaining to submit your deliverable.',
        badgeColor: '#ba1a1a',
      },
      TASK_DEADLINE_NOW: {
        subject: `TaskNest Alert: "${task.title}" deadline reached`,
        title: 'Task Deadline Reached',
        headline: 'The scheduled deadline for this task has arrived.',
        badgeColor: '#ba1a1a',
      },
      TASK_OVERDUE: {
        subject: `TaskNest Action Required: "${task.title}" is Overdue`,
        title: 'Task Overdue — Action Required',
        headline: 'This task has passed its deadline and is now marked overdue.',
        badgeColor: '#93000a',
      },
    }

    const cfg = stageConfig[stage] || stageConfig.TASK_DEADLINE_24H

    return await sendEmail({
      to: user.email,
      subject: cfg.subject,
      text: `Hello ${user.name},\n\n${cfg.headline}\nTask: ${task.title}\nDeadline: ${formattedDeadline}\nAvailable Points: ${task.points} XP\n\nPlease view the task and submit your work here:\n${taskUrl}`,
      html: baseHtmlTemplate({
        title: cfg.title,
        preheader: `${cfg.title}: ${task.title}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p style="font-size:15px;color:#201e19;font-weight:500;">
            ${cfg.headline}
          </p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid ${cfg.badgeColor};">
            <div style="font-size:12px;color:#74593f;font-weight:700;text-transform:uppercase;">
              Deliverable Details
            </div>
            <div style="font-size:18px;color:#201e19;font-weight:600;margin:6px 0;">
              ${task.title}
            </div>
            <div style="font-size:13px;color:#504d44;margin-top:4px;">
              <strong>Deadline:</strong> ${formattedDeadline}<br/>
              <strong>Reward:</strong> +${task.points} XP Points
            </div>
          </div>
          <p style="font-size:13px;color:#6e6a5f;">
            Make sure to push your code to your repository and submit your deliverable link for faculty review.
          </p>
        `,
        ctaText: 'View Task & Submit →',
        ctaUrl: taskUrl,
      }),
    })
  },
}

export default emailService
