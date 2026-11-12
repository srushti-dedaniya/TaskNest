import { enqueueEmail } from './emailOutboxService.js'

/**
 * Universal responsive HTML template matching TaskNest's warm editorial aesthetic.
 */
function baseHtmlTemplate({ title, preheader, bodyHtml, ctaText, ctaUrl, footerNote, badgeText = 'Internship Portal' }) {
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
      <div class="category-tag">${badgeText}</div>
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
      ${footerNote || 'TaskNest Task Management &amp; Intern Fellowship Portal'}<br/>
      If you have questions, please reach out to your faculty administrator.
    </div>
  </div>
</body>
</html>`
}

function getBaseUrls() {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:3000'
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000'
  return { clientUrl, serverUrl }
}

export const emailService = {
  /* =====================================================================
   * CATEGORY A: ACCOUNT & SECURITY (Emails 1 - 6)
   * ===================================================================== */

  // 1. Registration Verification Email
  sendVerificationEmail: async (user, rawToken) => {
    const { clientUrl, serverUrl } = getBaseUrls()
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

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      type: 'REGISTRATION_VERIFICATION',
      text: `Hello ${user.name},\n\nPlease verify your TaskNest account by clicking this link:\n${verificationUrl}\n\nDirect fallback:\n${directApiUrl}\n\nValid for 24 hours.`,
      html: baseHtmlTemplate({
        title,
        preheader,
        bodyHtml,
        ctaText: 'Verify Email Address →',
        ctaUrl: verificationUrl,
        footerNote: `TaskNest Account Security • Direct API fallback: ${directApiUrl}`,
      }),
      idempotencyKey: `verify:${user._id || user.id}:${rawToken}`,
      metadata: { userId: user._id || user.id },
    })
  },

  // 2. Welcome Email (After Verification)
  sendWelcome: async (user) => {
    const { clientUrl } = getBaseUrls()
    const dashboardUrl = `${clientUrl}/intern/dashboard`

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: 'Welcome to TaskNest — Account Verified',
      type: 'WELCOME',
      text: `Hello ${user.name},\n\nYour TaskNest intern account is now verified. Access your dashboard: ${dashboardUrl}`,
      html: baseHtmlTemplate({
        title: 'Account Verified // Welcome to TaskNest',
        preheader: `Welcome to TaskNest, ${user.name}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your institutional email has been verified successfully. Your intern account is now fully active.</p>
          <p>You can now log in, view your daily tasks and weekly goals, submit your work deliverables, and earn XP points.</p>
        `,
        ctaText: 'Go to Intern Dashboard →',
        ctaUrl: dashboardUrl,
      }),
      idempotencyKey: `welcome:${user._id || user.id}`,
      metadata: { userId: user._id || user.id },
    })
  },

  // 3. OTP Email (One-Time Passcode)
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

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      type: 'OTP',
      text: `Hello ${user.name},\n\nYour ${purpose} code is: ${otpCode}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html: baseHtmlTemplate({
        title,
        preheader,
        bodyHtml,
        footerNote: 'TaskNest Identity & Access Security',
        badgeText: 'Security Authentication',
      }),
      idempotencyKey: `otp:${user._id || user.id}:${otpCode}`,
      metadata: { userId: user._id || user.id },
    })
  },

  // 4. Password Reset Email
  sendPasswordReset: async (user, resetToken) => {
    const { clientUrl } = getBaseUrls()
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: 'TaskNest — Reset Your Password',
      type: 'PASSWORD_RESET',
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
        badgeText: 'Credential Recovery',
      }),
      idempotencyKey: `pwd_reset:${user._id || user.id}:${resetToken}`,
      metadata: { userId: user._id || user.id },
    })
  },

  // 5. Password Change Confirmation
  sendPasswordChanged: async (user) => {
    const { clientUrl } = getBaseUrls()
    const loginUrl = `${clientUrl}/login`
    const timestampStr = new Date().toUTCString()

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: 'TaskNest Security Alert: Password Updated',
      type: 'PASSWORD_CHANGED',
      text: `Hello ${user.name},\n\nYour TaskNest account password was successfully updated on ${timestampStr}. If you did not make this change, please contact faculty immediately.\n\nLogin: ${loginUrl}`,
      html: baseHtmlTemplate({
        title: 'Password Successfully Updated',
        preheader: 'Your TaskNest account password was changed',
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>The password for your TaskNest account (<strong>${user.email}</strong>) was successfully changed on <strong>${timestampStr}</strong>.</p>
          <div style="background:#f9f7f2;padding:14px 18px;border-radius:12px;margin:16px 0;border-left:3px solid #74593f;font-size:13px;">
            If you made this change, no further action is required. If you did not initiate this change, please contact your faculty administrator immediately.
          </div>
        `,
        ctaText: 'Sign In to TaskNest →',
        ctaUrl: loginUrl,
        badgeText: 'Security Notice',
      }),
      idempotencyKey: `pwd_changed:${user._id || user.id}:${Date.now()}`,
      metadata: { userId: user._id || user.id },
    })
  },

  // 6. Account Security Notifications
  sendSecurityAlert: async (user, { title = 'Account Security Alert', description, actionRequired = false }) => {
    const { clientUrl } = getBaseUrls()
    const profileUrl = `${clientUrl}/intern/profile`
    const timestampStr = new Date().toUTCString()

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: `TaskNest Security Notice: ${title}`,
      type: 'SECURITY_ALERT',
      text: `Hello ${user.name},\n\n${description}\nRecorded at: ${timestampStr}\n\nReview your profile: ${profileUrl}`,
      html: baseHtmlTemplate({
        title,
        preheader: `Security alert: ${title}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>${description}</p>
          <div style="background:#f9f7f2;padding:12px 16px;border-left:4px solid #ba1a1a;border-radius:8px;font-size:13px;margin:16px 0;">
            <strong>Time:</strong> ${timestampStr}<br/>
            ${actionRequired ? '<strong>Action Required:</strong> Please review your active sessions and profile security.' : ''}
          </div>
        `,
        ctaText: 'Review Profile Settings →',
        ctaUrl: profileUrl,
        badgeText: 'Security Alert',
      }),
      idempotencyKey: `sec_alert:${user._id || user.id}:${Date.now()}`,
      metadata: { userId: user._id || user.id },
    })
  },

  /* =====================================================================
   * CATEGORY B: TASK NOTIFICATIONS (Emails 7 - 15)
   * ===================================================================== */

  // 7. New Task Assignment (Single Intern)
  sendTaskAssigned: async (user, task) => {
    const { clientUrl } = getBaseUrls()
    const taskId = task._id || task.id
    const taskUrl = `${clientUrl}/intern/tasks/${taskId}`
    const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Flexible'

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: `New Task Assigned: ${task.title}`,
      type: 'TASK_ASSIGNED',
      text: `Hello ${user.name},\n\nYou have been assigned a new task: "${task.title}" (+${task.points} points). Deadline: ${deadlineStr}.\n\nView task details: ${taskUrl}`,
      html: baseHtmlTemplate({
        title: 'New Task Assigned',
        preheader: `Task assigned: ${task.title} (+${task.points} points)`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has assigned a new deliverable to you:</p>
          <div style="background:#f9f7f2;padding:18px 22px;border-radius:14px;margin:18px 0;border-left:4px solid #74593f;">
            <div style="font-size:11px;color:#74593f;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
              ${task.code || 'TASK'} // ${task.priority || 'Medium'} Priority
            </div>
            <div style="font-size:18px;color:#201e19;font-weight:600;margin:6px 0;">
              ${task.title}
            </div>
            <div style="font-size:13px;color:#504d44;">
              Reward: <strong>+${task.points} XP</strong> • Due: <strong>${deadlineStr}</strong>
            </div>
          </div>
          <p style="font-size:13px;color:#504d44;">${task.description || ''}</p>
        `,
        ctaText: 'View Task & Start Work →',
        ctaUrl: taskUrl,
        badgeText: 'Task Assignment',
      }),
      idempotencyKey: `task_assigned:${taskId}:${user._id || user.id}`,
      metadata: { taskId, userId: user._id || user.id },
    })
  },

  // 8. Multiple-Intern Task Assignment Batch Helper
  sendMultipleInternTaskAssigned: async (interns, task) => {
    if (!Array.isArray(interns) || interns.length === 0) return []
    const results = []
    for (const intern of interns) {
      if (intern && intern.email) {
        const res = await emailService.sendTaskAssigned(intern, task).catch((err) => {
          console.warn(`[email:multiAssign] Failed for ${intern.email}:`, err.message)
          return { success: false, error: err.message }
        })
        results.push({ email: intern.email, result: res })
      }
    }
    return results
  },

  // 9. Task Reassignment
  sendTaskReassigned: async (user, task, { note = '' } = {}) => {
    const { clientUrl } = getBaseUrls()
    const taskId = task._id || task.id
    const taskUrl = `${clientUrl}/intern/tasks/${taskId}`

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: `Task Reassigned: ${task.title}`,
      type: 'TASK_REASSIGNED',
      text: `Hello ${user.name},\n\nYou have been reassigned to task: "${task.title}".\n\nView details: ${taskUrl}`,
      html: baseHtmlTemplate({
        title: 'Task Reassigned to You',
        preheader: `Task reassigned: ${task.title}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has reassigned you to the following deliverable:</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid #74593f;">
            <div style="font-size:18px;color:#201e19;font-weight:600;margin-bottom:4px;">${task.title}</div>
            <div style="font-size:13px;color:#504d44;">Reward: <strong>+${task.points} XP</strong></div>
            ${note ? `<div style="font-size:12px;color:#74593f;margin-top:6px;font-style:italic;">Note from faculty: "${note}"</div>` : ''}
          </div>
        `,
        ctaText: 'View Reassigned Task →',
        ctaUrl: taskUrl,
        badgeText: 'Task Reassignment',
      }),
      idempotencyKey: `task_reassigned:${taskId}:${user._id || user.id}:${Date.now()}`,
      metadata: { taskId, userId: user._id || user.id },
    })
  },

  // 10. Task Updates (Deadline changes, guidelines, points)
  sendTaskUpdated: async (user, task, { updateSummary = 'Details and guidelines updated' } = {}) => {
    const { clientUrl } = getBaseUrls()
    const taskId = task._id || task.id
    const taskUrl = `${clientUrl}/intern/tasks/${taskId}`
    const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Updated'

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: `Task Updated: ${task.title}`,
      type: 'TASK_UPDATED',
      text: `Hello ${user.name},\n\nAn assigned task has been updated: "${task.title}".\nChanges: ${updateSummary}\n\nView details: ${taskUrl}`,
      html: baseHtmlTemplate({
        title: 'Task Details Updated',
        preheader: `Update notice for ${task.title}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has updated the requirements or deadline for <strong>${task.title}</strong>:</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid #74593f;">
            <div style="font-size:14px;color:#201e19;font-weight:600;margin-bottom:6px;">Update Details:</div>
            <div style="font-size:13px;color:#504d44;">${updateSummary}</div>
            <div style="font-size:12px;color:#74593f;margin-top:8px;">Current Deadline: <strong>${deadlineStr}</strong> • Reward: <strong>+${task.points} XP</strong></div>
          </div>
        `,
        ctaText: 'View Updated Task →',
        ctaUrl: taskUrl,
        badgeText: 'Task Update',
      }),
      idempotencyKey: `task_updated:${taskId}:${user._id || user.id}:${task.updatedAt?.getTime?.() || Date.now()}`,
      metadata: { taskId, userId: user._id || user.id },
    })
  },

  // 11 - 14. Scheduled Reminders (24h, 1h, Deadline Reached, Overdue)
  sendDeadlineReminder: async ({ user, task, stage, formattedDeadline }) => {
    const { clientUrl } = getBaseUrls()
    const taskId = task._id || task.id
    const taskUrl = `${clientUrl}/intern/tasks/${taskId}`

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

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: cfg.subject,
      type: stage,
      text: `Hello ${user.name},\n\n${cfg.headline}\nTask: ${task.title}\nDeadline: ${formattedDeadline}\nAvailable Points: ${task.points} XP\n\nPlease submit here:\n${taskUrl}`,
      html: baseHtmlTemplate({
        title: cfg.title,
        preheader: `${cfg.title}: ${task.title}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p style="font-size:15px;color:#201e19;font-weight:500;">
            ${cfg.headline}
          </p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid ${cfg.badgeColor};">
            <div style="font-size:18px;color:#201e19;font-weight:600;margin:6px 0;">
              ${task.title}
            </div>
            <div style="font-size:13px;color:#504d44;margin-top:4px;">
              <strong>Deadline:</strong> ${formattedDeadline}<br/>
              <strong>Reward:</strong> +${task.points} XP Points
            </div>
          </div>
          <p style="font-size:13px;color:#6e6a5f;">
            Ensure you have committed your code to your repository and submit your deliverable link for faculty review.
          </p>
        `,
        ctaText: 'View Task & Submit →',
        ctaUrl: taskUrl,
        badgeText: 'Deadline Tracking',
      }),
      idempotencyKey: `reminder:${taskId}:${user._id || user.id}:${stage}`,
      metadata: { taskId, userId: user._id || user.id, stage },
    })
  },

  // 15. Task Completion Alerts (To Faculty and Intern)
  sendSubmissionReceived: async (recipient, task, internName) => {
    const { clientUrl } = getBaseUrls()
    const queueUrl = `${clientUrl}/admin/submissions`

    return await enqueueEmail({
      to: recipient.email,
      recipientName: recipient.name,
      subject: `Task Submission Received: ${task.title}`,
      type: 'TASK_COMPLETED',
      text: `Submission received for "${task.title}" by intern ${internName || recipient.name}.\n\nReview queue: ${queueUrl}`,
      html: baseHtmlTemplate({
        title: 'New Task Submission Received',
        preheader: `Submission received for ${task.title}`,
        bodyHtml: `
          <p>A new deliverable has been submitted for <strong>${task.title}</strong> by intern <strong>${internName || recipient.name}</strong>.</p>
          <p>It is now awaiting your review in the submission evaluations queue.</p>
        `,
        ctaText: 'Review Submission →',
        ctaUrl: queueUrl,
        badgeText: 'Deliverable Review',
      }),
      idempotencyKey: `sub_recv:${task._id || task.id}:${recipient._id || recipient.id}:${Date.now()}`,
      metadata: { taskId: task._id || task.id },
    })
  },

  // 16. Task Status Change (Review Evaluation Result)
  sendReviewEvaluated: async (user, task, review) => {
    const { clientUrl } = getBaseUrls()
    const pointsUrl = `${clientUrl}/intern/points`
    const isApproved = review.decision === 'approved'

    return await enqueueEmail({
      to: user.email,
      recipientName: user.name,
      subject: `Task Review: ${isApproved ? 'Approved (+Points Awarded)' : 'Changes Needed'} - ${task?.title || 'Task'}`,
      type: 'TASK_STATUS_CHANGED',
      text: `Hello ${user.name},\n\nYour submission for "${task?.title}" has been reviewed: ${review.decision.toUpperCase()}.\nPoints Awarded: +${review.pointsAwarded || 0} XP\nFeedback: ${review.feedback}\n\nView points: ${pointsUrl}`,
      html: baseHtmlTemplate({
        title: isApproved ? 'Submission Approved & Points Awarded' : 'Changes Needed on Task Submission',
        preheader: `Review complete for ${task?.title}: ${isApproved ? `+${review.pointsAwarded} points awarded` : 'Changes needed'}`,
        bodyHtml: `
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Faculty has reviewed your deliverable for <strong>${task?.title || 'Task'}</strong>.</p>
          <div style="background:#f9f7f2;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid ${isApproved ? '#2e7d32' : '#ba1a1a'};">
            <div style="font-size:12px;color:#74593f;font-weight:700;text-transform:uppercase;">
              Status: <strong>${isApproved ? 'Approved' : 'Changes Needed'}</strong>
            </div>
            ${
              isApproved
                ? `<div style="font-size:22px;color:#201e19;font-weight:700;margin:6px 0;">+${review.pointsAwarded || 0} XP Awarded</div>`
                : `<div style="font-size:14px;color:#ba1a1a;margin:6px 0;">Please review the faculty feedback below and resubmit your updated work.</div>`
            }
            <div style="font-size:13px;color:#504d44;margin-top:8px;font-style:italic;">
              "${review.feedback || 'No comments provided'}"
            </div>
          </div>
        `,
        ctaText: 'View Points & Performance →',
        ctaUrl: pointsUrl,
        badgeText: 'Evaluation Rubric',
      }),
      idempotencyKey: `review_eval:${review._id || review.id || Date.now()}:${user._id || user.id}`,
      metadata: { taskId: task?._id, reviewId: review?._id },
    })
  },

  /* =====================================================================
   * CATEGORY C: SYSTEM & ANNOUNCEMENT NOTIFICATIONS (Emails 17 - 18)
   * ===================================================================== */

  // 17. Faculty Announcements
  sendFacultyAnnouncement: async (recipient, { title, content, authorName = 'Faculty Administrator' }) => {
    const { clientUrl } = getBaseUrls()
    const dashboardUrl = `${clientUrl}/intern/dashboard`

    return await enqueueEmail({
      to: recipient.email,
      recipientName: recipient.name,
      subject: `Faculty Announcement: ${title}`,
      type: 'ANNOUNCEMENT_FACULTY',
      text: `Announcement: ${title}\nFrom: ${authorName}\n\n${content}\n\nDashboard: ${dashboardUrl}`,
      html: baseHtmlTemplate({
        title,
        preheader: `Announcement from ${authorName}`,
        bodyHtml: `
          <div style="font-size:11px;color:#74593f;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
            Broadcast by ${authorName}
          </div>
          <div style="font-size:14px;line-height:1.7;color:#201e19;white-space:pre-wrap;">
            ${content}
          </div>
        `,
        ctaText: 'Open Dashboard →',
        ctaUrl: dashboardUrl,
        badgeText: 'Faculty Notice',
      }),
      idempotencyKey: `announcement_faculty:${recipient._id || recipient.id}:${Date.now()}`,
      metadata: { authorName },
    })
  },

  // 18. Admin Announcements / System Alerts
  sendAdminAnnouncement: async (recipient, { title, content, priority = 'Normal' }) => {
    const { clientUrl } = getBaseUrls()
    const dashboardUrl = `${clientUrl}/intern/dashboard`

    return await enqueueEmail({
      to: recipient.email,
      recipientName: recipient.name,
      subject: `TaskNest System Notice: ${title}`,
      type: 'ANNOUNCEMENT_ADMIN',
      text: `System Notice: ${title} (${priority})\n\n${content}\n\nPortal: ${dashboardUrl}`,
      html: baseHtmlTemplate({
        title,
        preheader: `System Announcement: ${title}`,
        bodyHtml: `
          <div style="font-size:11px;color:#74593f;font-weight:700;text-transform:uppercase;margin-bottom:8px;">
            Priority: <strong>${priority}</strong>
          </div>
          <div style="font-size:14px;line-height:1.7;color:#201e19;white-space:pre-wrap;">
            ${content}
          </div>
        `,
        ctaText: 'Access Portal →',
        ctaUrl: dashboardUrl,
        badgeText: 'System Announcement',
      }),
      idempotencyKey: `announcement_admin:${recipient._id || recipient.id}:${Date.now()}`,
      metadata: { priority },
    })
  },
}

export default emailService
