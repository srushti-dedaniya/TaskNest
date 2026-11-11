/**
 * Verified TaskNest Documentation & Knowledge Base
 * Authoritative source of truth for features, navigation, workflows, and FAQs.
 */

export const TASKNEST_KNOWLEDGE_DOCS = `
TaskNest is a task management and intern performance portal.
Roles:
1. Intern: Solves daily sprint tasks and weekly milestone goals, submits deliverables (GitHub repo and optional live link), tracks points (XP) and leaderboard rankings, views faculty feedback, and manages their profile.
2. Faculty (Admin role): Creates and assigns tasks to one or multiple interns, reviews code and project deliverables, writes constructive feedback, approves or rejects submissions, awards XP points, and tracks intern performance.
3. Admin: Manages intern accounts, monitors tasks across all cohorts, and reviews overall platform statistics and activity.

Key Navigation & Workflows:
- Submitting a Task (Intern):
  Navigate to "Daily Tasks" or "Weekly Goals" from the sidebar. Select your task and click "Submit Task". Provide your repository link (e.g. GitHub or GitLab), an optional live demo URL, and notes detailing your work. Click "Submit Task for Review".
- Viewing Assigned Tasks (Intern):
  Go to the Intern Dashboard, "Daily Tasks" (/intern/daily-tasks), or "Weekly Goals" (/intern/weekly-goals). You will see all tasks assigned to you with due dates, priority tiers, points, and status.
- What "Waiting for Review" Means:
  When your deliverable is submitted, its status becomes "Waiting for Review" (or submitted). This means your work has been sent to the faculty review queue. Once a faculty member evaluates it, you will receive an in-app notification and an email with their decision and feedback.
- Checking Points & Performance (Intern):
  Your total XP points appear in the top navigation header badge, on your Intern Dashboard, and on the "Points & Performance" page (/intern/points). Points are awarded automatically when faculty approves your submission.
- Finding Faculty Feedback (Intern):
  Open "My Submissions" (/intern/submissions) from the sidebar. Click on any evaluated submission to open "Submission Details" to see the approval status, points awarded, and detailed feedback from faculty.
- Updating Profile (Intern & Faculty):
  Click "Profile" in the navigation bar or sidebar. You can update your full name, institution, field of study, and bio, or change your account password.
- Assigning a Task to Multiple Interns (Faculty/Admin):
  Open "Manage Tasks" and click "Create Task" (or click "+ Assign Task" in the header). Fill in task details. Under "Assignment & Schedule", select "Individual Selection". Use the searchable multi-select dropdown with checkboxes to select 2, 3, or more interns (or use "Select All"). Selected interns appear as removable tags. Click "Assign Task". Each assigned intern receives an independent assignment record, in-app notification, and email.
- Reviewing Submissions (Faculty/Admin):
  Open "Submissions" (/admin/reviews) from the sidebar. Click "Evaluate" on any pending submission. Review the code repository and live demo, choose "Approve" (with points) or "Request Revision / Reject", enter constructive feedback, and click "Submit Evaluation".
- Tracking Intern Performance (Faculty/Admin):
  Open "Intern Management" (/admin/interns) from the sidebar. You can view all registered interns, their current XP points, completed deliverables, institution, and field of study. Click any intern to view their detailed profile.
- Finding an Intern (Faculty/Admin):
  Use the search bar in "Intern Management" or the global search bar in the top navigation header to filter by intern name, email, or institution.
- Tracking Pending Submissions (Faculty/Admin):
  Check the "Pending Submissions" counter on the Faculty Dashboard, or open the "Submissions" page and filter by "Pending Review".
- Managing Users (Admin):
  Open "Intern Management" (/admin/interns) to inspect all registered intern accounts, track their progress, and review their submitted work.
- Monitoring Tasks (Admin):
  Navigate to "Manage Tasks" (/admin/tasks) to view, search, edit, or delete existing daily sprint tasks and weekly milestone goals.
- Viewing Platform Activity (Admin):
  Open the "Admin Dashboard" (/admin/dashboard) for real-time overview metrics: active tasks, pending reviews, registered interns, and recent platform events.
- Email Verification:
  New interns must verify their email address by clicking the link sent to their inbox before logging in. If the link expires, they can request a new verification email from the login page.
`

export const ROLE_SUGGESTED_QUESTIONS = {
  intern: [
    'How do I submit a task?',
    'Where can I see my assigned tasks?',
    'What does Waiting for Review mean?',
    'How can I check my points?',
    'Where can I find faculty feedback?',
    'How can I update my profile?',
  ],
  faculty: [
    'How do I assign a task to multiple interns?',
    'How can I review submissions?',
    'Where can I see intern performance?',
    'How do I find an intern?',
    'How can I track pending submissions?',
  ],
  admin: [
    'How do I manage users?',
    'How can I monitor tasks?',
    'Where can I view platform activity?',
    'How do I assign a task to multiple interns?',
    'How can I review submissions?',
    'Where can I see intern performance?',
  ],
}

export const FAQ_DATABASE = [
  // --- INTERN WORKFLOWS ---
  {
    id: 'intern-submit-task',
    roles: ['intern'],
    keywords: ['submit', 'task', 'submission', 'turn in', 'upload', 'deliverable', 'github', 'repo', 'link', 'work', 'solution'],
    patterns: [
      /how (do|can) i submit (a )?task/i,
      /submit (my )?(work|deliverable|task|solution)/i,
      /where (do|can) i upload/i,
      /how to submit/i,
    ],
    question: 'How do I submit a task?',
    answer:
      'Open Daily Tasks or Weekly Goals, select your task and click Submit Task. Add your work or GitHub repository link, an optional live demo link, and notes, then click Submit Task for Review.',
  },
  {
    id: 'intern-see-assigned-tasks',
    roles: ['intern'],
    keywords: ['assigned', 'tasks', 'see', 'find', 'view', 'my tasks', 'daily', 'weekly', 'goals', 'dashboard', 'where'],
    patterns: [
      /where can i see (my )?(assigned )?tasks/i,
      /view (my )?tasks/i,
      /where are my tasks/i,
      /see my assigned tasks/i,
    ],
    question: 'Where can I see my assigned tasks?',
    answer:
      'You can see your assigned tasks in the Intern Dashboard, in "Daily Tasks" (/intern/daily-tasks), and in "Weekly Goals" (/intern/weekly-goals) from the sidebar navigation. Each task card displays its due date, priority, and available points.',
  },
  {
    id: 'intern-waiting-for-review',
    roles: ['intern'],
    keywords: ['waiting', 'review', 'submitted', 'pending', 'mean', 'status', 'queue', 'under review'],
    patterns: [
      /what does waiting for review mean/i,
      /waiting for review/i,
      /submission status pending/i,
      /what happens after i submit/i,
    ],
    question: 'What does Waiting for Review mean?',
    answer:
      '"Waiting for Review" means your deliverable has been successfully received and is currently in the faculty review queue. Once a faculty member reviews your code, you will receive an in-app notification and email with their feedback and awarded points.',
  },
  {
    id: 'intern-check-points',
    roles: ['intern'],
    keywords: ['points', 'check', 'score', 'xp', 'performance', 'leaderboard', 'rank', 'earnings'],
    patterns: [
      /how (can|do) i check (my )?points/i,
      /where (are|can i see) (my )?points/i,
      /how does xp work/i,
      /check my points/i,
    ],
    question: 'How can I check my points?',
    answer:
      'You can check your total XP points in the top navigation header badge, on your Intern Dashboard, or on the dedicated "Points & Performance" page (/intern/points). Points are awarded immediately once faculty approves your task submission.',
  },
  {
    id: 'intern-faculty-feedback',
    roles: ['intern'],
    keywords: ['feedback', 'faculty', 'review', 'comments', 'grade', 'find', 'see', 'evaluation'],
    patterns: [
      /where can i find (faculty )?feedback/i,
      /how (do|can) i see feedback/i,
      /view review/i,
      /faculty comments/i,
    ],
    question: 'Where can I find faculty feedback?',
    answer:
      'To view faculty feedback, go to "My Submissions" (/intern/submissions) in the sidebar. Click on any evaluated submission to open "Submission Details" to read the faculty feedback, evaluation status, and awarded points.',
  },
  {
    id: 'intern-update-profile',
    roles: ['intern', 'admin', 'faculty'],
    keywords: ['profile', 'update', 'edit', 'change', 'name', 'password', 'bio', 'institution'],
    patterns: [
      /how (can|do) i update (my )?profile/i,
      /edit profile/i,
      /change password/i,
      /update my profile/i,
    ],
    question: 'How can I update my profile?',
    answer:
      'Click your profile name in the top navigation header or "Profile" in the navigation bar. You can update your display name, institution, field of study, and bio, as well as securely change your account password.',
  },

  // --- FACULTY WORKFLOWS ---
  {
    id: 'faculty-assign-multi-interns',
    roles: ['faculty', 'admin'],
    keywords: ['assign', 'multiple', 'interns', 'task', 'create', 'selection', 'checkboxes', 'chips', 'dropdown', 'many'],
    patterns: [
      /how (do|can) i assign (a|one)? task to multiple interns/i,
      /assign (to )?multiple interns/i,
      /select multiple interns/i,
      /assign task/i,
    ],
    question: 'How do I assign a task to multiple interns?',
    answer:
      'Open Manage Tasks, select Create Task (or click "+ Assign Task" in the header), fill in the details, choose "Individual Selection", pick the interns you want to assign it to using the multi-select checkboxes or "Select All", and click Assign Task.',
  },
  {
    id: 'faculty-review-submissions',
    roles: ['faculty', 'admin'],
    keywords: ['review', 'submissions', 'evaluate', 'grade', 'approve', 'reject', 'feedback', 'queue', 'verify'],
    patterns: [
      /how (can|do) i review submissions/i,
      /evaluate (a )?submission/i,
      /review queue/i,
      /approve task/i,
    ],
    question: 'How can I review submissions?',
    answer:
      'Open "Submissions" (/admin/reviews) from the sidebar. Click "Evaluate" on any pending submission to review the intern\'s code repository, live link, and notes. Choose "Approve" (with points) or "Request Revision", write feedback, and click Submit Evaluation.',
  },
  {
    id: 'faculty-intern-performance',
    roles: ['faculty', 'admin'],
    keywords: ['intern', 'performance', 'see', 'track', 'progress', 'xp', 'leaderboard', 'stats', 'analytics'],
    patterns: [
      /where can i see intern performance/i,
      /track intern (performance|progress)/i,
      /intern scores/i,
      /see intern performance/i,
    ],
    question: 'Where can I see intern performance?',
    answer:
      'Open "Intern Management" (/admin/interns) from the sidebar to view all interns, their earned XP points, completed deliverables, institution, and field of study. Click on any intern to view their full progress details and submission history.',
  },
  {
    id: 'faculty-find-intern',
    roles: ['faculty', 'admin'],
    keywords: ['find', 'search', 'intern', 'lookup', 'filter', 'student'],
    patterns: [
      /how (do|can) i find an intern/i,
      /search for intern/i,
      /find intern/i,
      /filter interns/i,
    ],
    question: 'How do I find an intern?',
    answer:
      'Go to "Intern Management" (/admin/interns) and type in the search bar to filter interns by name, email, or institution. You can also use the global search bar in the top navigation header.',
  },
  {
    id: 'faculty-track-pending-submissions',
    roles: ['faculty', 'admin'],
    keywords: ['track', 'pending', 'submissions', 'waiting', 'unreviewed', 'queue', 'needs review'],
    patterns: [
      /how can i track pending submissions/i,
      /pending submissions/i,
      /unreviewed submissions/i,
      /track pending/i,
    ],
    question: 'How can I track pending submissions?',
    answer:
      'On your Faculty Dashboard, check the "Pending Submissions" overview card. Alternatively, open "Submissions" (/admin/reviews) in the sidebar and filter by "Pending Review" to inspect all deliverables awaiting evaluation.',
  },

  // --- ADMIN WORKFLOWS ---
  {
    id: 'admin-manage-users',
    roles: ['admin', 'faculty'],
    keywords: ['manage', 'users', 'interns', 'accounts', 'directory', 'roles', 'students'],
    patterns: [
      /how (do|can) i manage users/i,
      /manage (interns|users)/i,
      /user management/i,
    ],
    question: 'How do I manage users?',
    answer:
      'Go to "Intern Management" (/admin/interns) in the sidebar. You can inspect all registered intern accounts, view their individual performance, monitor active deliverables, and view detailed submission histories.',
  },
  {
    id: 'admin-monitor-tasks',
    roles: ['admin', 'faculty'],
    keywords: ['monitor', 'tasks', 'manage tasks', 'overview', 'delete task', 'edit task', 'cadence'],
    patterns: [
      /how (can|do) i monitor tasks/i,
      /manage tasks/i,
      /edit (or delete )?task/i,
      /monitor tasks/i,
    ],
    question: 'How can I monitor tasks?',
    answer:
      'Navigate to "Manage Tasks" (/admin/tasks) from the sidebar. You can monitor all active, daily, and weekly tasks across cohorts, filter by priority or cadence, edit task specifications, or remove outdated tasks.',
  },
  {
    id: 'admin-platform-activity',
    roles: ['admin', 'faculty'],
    keywords: ['platform', 'activity', 'stats', 'analytics', 'overview', 'metrics', 'events', 'dashboard'],
    patterns: [
      /where can i view platform activity/i,
      /platform activity/i,
      /view (system|platform) stats/i,
      /admin metrics/i,
    ],
    question: 'Where can I view platform activity?',
    answer:
      'Open the "Admin Dashboard" (/admin/dashboard) to view comprehensive platform analytics: active tasks, pending reviews, registered interns, and the live recent activity feed.',
  },

  // --- COMMON AUTH & SYSTEM FAQS ---
  {
    id: 'common-email-verification',
    roles: ['intern', 'faculty', 'admin'],
    keywords: ['email', 'verification', 'verify', 'link', 'activate', 'token', 'resend', 'not received'],
    patterns: [
      /how (do|can) i verify my email/i,
      /didn't receive verification email/i,
      /email verification/i,
      /resend verification/i,
    ],
    question: 'How do I verify my email address?',
    answer:
      'When you register, TaskNest sends a verification email with a secure link. Click the link to activate your account. If you did not receive it, check your spam folder or use the "Resend verification email" link on the login page.',
  },
  {
    id: 'common-reset-password',
    roles: ['intern', 'faculty', 'admin'],
    keywords: ['reset', 'password', 'forgot', 'login', 'recover'],
    patterns: [
      /how (do|can) i reset my password/i,
      /forgot password/i,
      /change password/i,
    ],
    question: 'How do I reset my password?',
    answer:
      'If you cannot log in, click "Forgot password?" on the login page and enter your registered email. If you are already logged in, you can update your password directly from your Profile page.',
  },
]

const STOPWORDS = new Set([
  'what',
  'does',
  'how',
  'can',
  'the',
  'a',
  'an',
  'is',
  'are',
  'in',
  'on',
  'at',
  'with',
  'for',
  'to',
  'of',
  'and',
  'or',
  'do',
  'my',
  'your',
  'i',
  'you',
  'we',
  'it',
  'be',
  'by',
])

/**
 * Normalizes text: trims, lowercases, removes punctuation, splits into words.
 */
function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
}

/**
 * Searches the verified FAQ database for the closest match.
 * @param {string} userMessage - The question asked by the user
 * @param {string} userRole - 'intern' | 'admin' | 'faculty'
 * @returns {{ matched: boolean, faq?: object, score: number, fallbackHelp: string }}
 */
export function findBestFaqMatch(userMessage = '', userRole = 'intern') {
  const normalizedRole = userRole === 'admin' ? 'faculty' : userRole
  const queryTokens = tokenize(userMessage)

  if (!queryTokens.length) {
    return {
      matched: false,
      score: 0,
      fallbackHelp: getRoleHelpOverview(userRole),
    }
  }

  // Meaningful tokens excluding common conversational stopwords
  const meaningfulQueryTokens = queryTokens.filter((t) => !STOPWORDS.has(t))

  let bestMatch = null
  let highestScore = 0

  for (const faq of FAQ_DATABASE) {
    let score = 0

    // Role affinity boost (only if there are actual topic hits)
    const roleMatches = faq.roles.includes(userRole) || faq.roles.includes(normalizedRole)

    // Pattern regex match (highest confidence)
    if (faq.patterns && faq.patterns.some((p) => p.test(userMessage))) {
      score += 20
    }

    // Direct question likeness on meaningful non-stopwords
    const faqQTokens = tokenize(faq.question).filter((t) => !STOPWORDS.has(t))
    const qOverlap = meaningfulQueryTokens.filter((t) => faqQTokens.includes(t)).length
    score += qOverlap * 4

    // Keyword hits
    let keywordHits = 0
    for (const kw of faq.keywords) {
      if (userMessage.toLowerCase().includes(kw)) {
        score += 3
        keywordHits++
      }
    }

    // Role boost only if there are substantive hits
    if (roleMatches && (score > 0)) {
      score += 2
    }

    if (score > highestScore) {
      highestScore = score
      bestMatch = faq
    }
  }

  // Threshold check (score >= 7 indicates strong correlation)
  if (bestMatch && highestScore >= 7) {
    return {
      matched: true,
      faq: bestMatch,
      score: highestScore,
      fallbackHelp: bestMatch.answer,
    }
  }

  return {
    matched: false,
    score: highestScore,
    fallbackHelp: getRoleHelpOverview(userRole),
  }
}

/**
 * Friendly, role-tailored fallback guide when no specific FAQ matches.
 */
export function getRoleHelpOverview(userRole = 'intern') {
  if (userRole === 'admin' || userRole === 'faculty') {
    return `I am here to help you navigate TaskNest as Faculty/Admin!

You can ask me questions such as:
• "How do I assign a task to multiple interns?"
• "How can I review submissions?"
• "Where can I see intern performance?"
• "How do I find an intern?"
• "How do I monitor tasks?"

You can also use the suggested questions below or ask about any feature on your dashboard.`
  }

  return `I am here to help you navigate TaskNest as an Intern!

You can ask me questions such as:
• "How do I submit a task?"
• "Where can I see my assigned tasks?"
• "What does Waiting for Review mean?"
• "How can I check my points?"
• "Where can I find faculty feedback?"
• "How can I update my profile?"

Select any suggested question below or type your question in simple English!`
}
