import 'dotenv/config'
import http from 'node:http'
import mongoose from 'mongoose'
import { connectDatabase } from '../src/config/database.js'
import { app } from '../src/server.js'
import User from '../src/models/User.js'
import { getLatestEmail } from '../src/config/email.js'

let server
let baseUrl
let adminToken
let internToken
let createdTaskId
let createdSubId

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // raw text or empty
  }
  return { status: res.status, ok: res.ok, data }
}

async function runTests() {
  console.log('--- Starting TaskNest Backend API Test Suite ---')
  await connectDatabase()

  // Start ephemeral server on random available port
  server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port
  baseUrl = `http://127.0.0.1:${port}`
  console.log(`[test] test server running on ${baseUrl}`)

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  // 1. Health check
  {
    console.log('\n[Suite 1: Healthcheck & System]')
    const res = await request('GET', '/healthz')
    assert(res.status === 200 && res.data.ok === true, 'GET /healthz returns 200 OK')
  }

  // 2. Authentication
  {
    console.log('\n[Suite 2: Authentication & RBAC]')
    // Admin login
    const adminRes = await request('POST', '/api/auth/login', {
      email: 'admin@tasknest.org',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345'
    })
    assert(adminRes.status === 200 && adminRes.data.user.role === 'admin', 'Admin login successful with role: admin')
    assert(!!adminRes.data.token, 'Admin login returns valid JWT token')
    adminToken = adminRes.data.token

    // Intern login
    const internRes = await request('POST', '/api/auth/login', {
      email: 'julian.vance@tasknest.org',
      password: 'Password@123'
    })
    assert(internRes.status === 200 && internRes.data.user.role === 'intern', 'Intern login successful with role: intern')
    assert(!!internRes.data.token, 'Intern login returns valid JWT token')
    internToken = internRes.data.token

    // Role-based route guard
    const usersAdminRes = await request('GET', '/api/users', null, adminToken)
    assert(usersAdminRes.status === 200, 'Admin can access GET /api/users')

    const usersInternRes = await request('GET', '/api/users', null, internToken)
    assert(usersInternRes.status === 403, 'Intern is forbidden (403) from accessing GET /api/users')

    // Public register (must create intern role only)
    const testEmail = `newintern.${Date.now()}@tasknest.org`
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Candidate',
      email: testEmail,
      password: 'SecurePassword123!',
      institution: 'Systems Lab',
      role: 'admin' // Attempting privilege escalation
    })
    assert(regRes.status === 201, 'Public registration returns 201 Created')
    assert(regRes.data.user.role === 'intern', 'Public registration forces role to intern (prevents privilege escalation)')
    assert(regRes.data.user.isEmailVerified === false, 'Public registration marks account as isEmailVerified: false')
  }

  // 2b. Email Verification Lifecycle
  {
    console.log('\n[Suite 2b: Cryptographic Email Verification Lifecycle]')
    const candidateEmail = `unverified.${Date.now()}@tasknest.org`
    const candidatePass = 'AttestationPass123!'

    // 1. Register candidate
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Verification Candidate',
      email: candidateEmail,
      password: candidatePass,
      institution: 'Cryptography Laboratory'
    })
    assert(regRes.status === 201, 'Registration returns 201 Created')
    assert(regRes.data.user.isEmailVerified === false, 'Account has isEmailVerified: false')

    // 2. Unverified login must be rejected
    const unverifiedLogin = await request('POST', '/api/auth/login', {
      email: candidateEmail,
      password: candidatePass
    })
    assert(unverifiedLogin.status === 403, 'Unverified intern login is rejected with 403 Forbidden')
    assert(unverifiedLogin.data.code === 'EMAIL_NOT_VERIFIED', 'Error code is EMAIL_NOT_VERIFIED')

    // 3. Inspect email journal for verification monograph and extract cryptographic token
    const verificationEmail = getLatestEmail(candidateEmail)
    assert(!!verificationEmail, 'Verification email was dispatched and journaled')
    const tokenMatch = /token=([0-9a-fA-F]{64})/.exec(verificationEmail.html || verificationEmail.text)
    assert(!!tokenMatch, 'Verification email contains secure 64-character hex token')
    const rawToken = tokenMatch ? tokenMatch[1] : null

    // 4. Rate-limiting cooldown on resend verification
    const rapidResend = await request('POST', '/api/auth/resend-verification', {
      email: candidateEmail
    })
    assert(rapidResend.status === 429, 'Rapid resend request is rate-limited with 429 Cooldown')
    assert(rapidResend.data.code === 'RESEND_COOLDOWN', 'Error code specifies RESEND_COOLDOWN')

    // 5. Invalid token fails
    const invalidVerify = await request('POST', '/api/auth/verify-email', {
      token: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    })
    assert(invalidVerify.status === 400, 'Invalid token verification rejected with 400 Bad Request')

    // 6. Valid token verification succeeds
    const validVerify = await request('POST', '/api/auth/verify-email', {
      token: rawToken
    })
    assert(validVerify.status === 200, 'Valid token verification succeeds with 200 OK')
    assert(validVerify.data.user.isEmailVerified === true, 'Response marks user as isEmailVerified: true')
    assert(!!validVerify.data.token, 'Verification endpoint returns active auth token')

    // 7. Verified candidate can now sign in
    const verifiedLogin = await request('POST', '/api/auth/login', {
      email: candidateEmail,
      password: candidatePass
    })
    assert(verifiedLogin.status === 200, 'Verified candidate can now login successfully (200 OK)')
    assert(verifiedLogin.data.user.isEmailVerified === true, 'Session user is confirmed email-verified')

    // 8. Re-using consumed token fails
    const reusedVerify = await request('POST', '/api/auth/verify-email', {
      token: rawToken
    })
    assert(reusedVerify.status === 400, 'Re-using already consumed token fails with 400 Bad Request')

    // 9. Resend on already verified account returns friendly status
    const verifiedResend = await request('POST', '/api/auth/resend-verification', {
      email: candidateEmail
    })
    assert(verifiedResend.status === 200, 'Resend on verified account returns 200 OK')
    assert(verifiedResend.data.alreadyVerified === true, 'Response confirms account is already verified')
  }

  // 3. Task Management & Assignment
  {
    console.log('\n[Suite 3: Task Creation & Assignment]')
    const deadline = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
    const taskRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Formal Zero-Knowledge Verification Suite',
        code: 'SPEC-9999',
        description: 'Verify deterministic ZK-SNARK state constraints with automated proof harness.',
        instructions: ['Implement circuit generator', 'Benchmark verification runtime'],
        type: 'daily',
        priority: 'high',
        points: 300,
        deadline,
        assignment: { mode: 'all' }
      },
      adminToken
    )
    assert(taskRes.status === 201, 'Admin can create task (POST /api/tasks)')
    assert(taskRes.data.task.points === 300, 'Task XP value saved correctly (300 XP)')
    createdTaskId = taskRes.data.task._id

    // Intern lists tasks
    const listRes = await request('GET', '/api/tasks', null, internToken)
    assert(listRes.status === 200 && Array.isArray(listRes.data.tasks), 'Intern can retrieve assigned tasks (GET /api/tasks)')
    assert(listRes.data.tasks.some((t) => t._id === createdTaskId), 'Newly created task is visible to intern')
  }

  // 4. Submissions & Deduplication
  {
    console.log('\n[Suite 4: Task Submissions]')
    const subRes = await request(
      'POST',
      '/api/submissions',
      {
        taskId: createdTaskId,
        repoUrl: 'https://github.com/tasknest/julian-vance/zk-proofs',
        liveUrl: 'https://zk-telemetry.tasknest.org',
        notes: 'Groth16 and PLONK proving systems benchmarked under 10k gates.'
      },
      internToken
    )
    assert(subRes.status === 201, 'Intern can submit task deliverable (POST /api/submissions)')
    assert(subRes.data.submission.status === 'submitted', 'Submission status initialized to "submitted"')
    createdSubId = subRes.data.submission._id

    // Duplicate submission attempt
    const dupRes = await request(
      'POST',
      '/api/submissions',
      {
        taskId: createdTaskId,
        repoUrl: 'https://github.com/tasknest/julian-vance/zk-proofs-dup',
        liveUrl: 'https://zk-telemetry.tasknest.org',
        notes: 'Duplicate attempt'
      },
      internToken
    )
    assert(dupRes.status === 409, 'Duplicate submission is rejected with 409 Conflict')
  }

  // 5. Evaluation, Review & Points Awarding
  {
    console.log('\n[Suite 5: Evaluation, Review & Points]')
    // Check points before
    const userBefore = await User.findOne({ email: 'julian.vance@tasknest.org' })
    const initialPoints = userBefore.points

    // Admin evaluates and awards 300 points
    const reviewRes = await request(
      'POST',
      `/api/submissions/${createdSubId}/review`,
      {
        decision: 'approved',
        feedback: 'Flawless verification constraints and exemplary formal monograph.',
        pointsAwarded: 300
      },
      adminToken
    )
    assert(
      reviewRes.status === 200 || reviewRes.status === 201,
      'Admin can evaluate submission and award XP'
    )

    // Verify points incremented on user
    const userAfter = await User.findOne({ email: 'julian.vance@tasknest.org' })
    assert(userAfter.points === initialPoints + 300, `Intern points atomically updated from ${initialPoints} to ${userAfter.points}`)

    // Second evaluation attempt must fail
    const secondReview = await request(
      'POST',
      `/api/submissions/${createdSubId}/review`,
      {
        decision: 'approved',
        feedback: 'Attempting duplicate points award',
        pointsAwarded: 300
      },
      adminToken
    )
    assert(secondReview.status === 409, 'Second evaluation is blocked with 409 Conflict (prevents double awarding)')
  }

  // 6. Notifications
  {
    console.log('\n[Suite 6: Notifications]')
    const notifRes = await request('GET', '/api/notifications', null, internToken)
    assert(notifRes.status === 200, 'Intern can fetch notifications (GET /api/notifications)')
    assert(Array.isArray(notifRes.data.notifications), 'Notifications returned as an array')
    assert(notifRes.data.notifications.length > 0, 'Intern has received notifications for task assignment & review')

    const firstNotif = notifRes.data.notifications[0]
    const readRes = await request('PATCH', `/api/notifications/${firstNotif._id}/read`, {}, internToken)
    assert(readRes.status === 200 && readRes.data.notification.isRead === true, 'Notification marked as read')
  }

  // 7. AI Help Assistant
  {
    console.log('\n[Suite 7: AI Help Assistant]')

    // Unauthenticated request
    const unauthRes = await request('POST', '/api/ai/help', { message: 'How do I submit a task?' })
    assert(unauthRes.status === 401, 'Unauthenticated AI help request rejected with 401 Unauthorized')

    // Empty message validation
    const emptyRes = await request('POST', '/api/ai/help', { message: '' }, internToken)
    assert(emptyRes.status === 400, 'Empty message rejected with 400 Bad Request')

    // Oversized message validation (> 1000 characters)
    const longMsg = 'A'.repeat(1005)
    const longRes = await request('POST', '/api/ai/help', { message: longMsg }, internToken)
    assert(longRes.status === 400, 'Oversized message (> 1000 chars) rejected with 400 Bad Request')

    // Intern asking "How do I submit a task?"
    const internAsk1 = await request('POST', '/api/ai/help', { message: 'How do I submit a task?' }, internToken)
    assert(internAsk1.status === 200, 'Intern can ask AI Help Assistant (200 OK)')
    assert(Boolean(internAsk1.data.answer), 'AI Assistant returns an answer')
    assert(internAsk1.data.role === 'intern', 'AI Assistant identifies intern role')
    assert(
      internAsk1.data.answer.toLowerCase().includes('submit') &&
      internAsk1.data.answer.toLowerCase().includes('task'),
      'Intern receives verified task submission instructions'
    )

    // Intern asking about points
    const internAsk2 = await request('POST', '/api/ai/help', { message: 'How can I check my points?' }, internToken)
    assert(internAsk2.status === 200, 'Intern can ask about points')
    assert(
      internAsk2.data.answer.toLowerCase().includes('points') || internAsk2.data.answer.toLowerCase().includes('xp'),
      'Intern receives verified points guidance'
    )

    // Faculty/Admin asking "How do I assign a task to multiple interns?"
    const adminAsk1 = await request(
      'POST',
      '/api/ai/help',
      { message: 'How do I assign one task to multiple interns?' },
      adminToken
    )
    assert(adminAsk1.status === 200, 'Faculty/Admin can ask AI Help Assistant (200 OK)')
    assert(adminAsk1.data.role === 'admin', 'AI Assistant identifies admin role')
    assert(
      adminAsk1.data.answer.toLowerCase().includes('create task') ||
      adminAsk1.data.answer.toLowerCase().includes('manage tasks'),
      'Faculty receives verified multi-intern assignment instructions'
    )

    // Faculty/Admin asking about reviewing submissions
    const adminAsk2 = await request(
      'POST',
      '/api/ai/help',
      { message: 'How can I review submissions?' },
      adminToken
    )
    assert(adminAsk2.status === 200, 'Faculty can ask about reviewing submissions')
    assert(
      adminAsk2.data.answer.toLowerCase().includes('submission') ||
      adminAsk2.data.answer.toLowerCase().includes('evaluate'),
      'Faculty receives verified submission review instructions'
    )

    // Suggested questions endpoint
    const internSugg = await request('GET', '/api/ai/suggested-questions', null, internToken)
    assert(internSugg.status === 200, 'Can retrieve suggested questions for intern')
    assert(Array.isArray(internSugg.data.questions) && internSugg.data.questions.length >= 5, 'Intern has at least 5 suggested questions')
    assert(internSugg.data.questions.some((q) => q.includes('submit a task')), 'Intern suggested questions include task submission')

    const adminSugg = await request('GET', '/api/ai/suggested-questions', null, adminToken)
    assert(adminSugg.status === 200, 'Can retrieve suggested questions for admin')
    assert(adminSugg.data.questions.some((q) => q.includes('multiple interns')), 'Admin suggested questions include multi-intern assignment')
  }

  // 8. Task Deadline Reminder System
  {
    console.log('\n[Suite 8: Task Deadline Reminder System]')

    // Fetch interns from DB (testIntern1 matches internToken user Julian Vance)
    const testIntern1 = await User.findOne({ email: 'julian.vance@tasknest.org' })
    const testIntern2 = (await User.findOne({ role: 'intern', _id: { $ne: testIntern1._id } })) || testIntern1

    // 1. Test 24h reminder
    const deadline24h = new Date(Date.now() + 23 * 3600 * 1000).toISOString()
    const task24hRes = await request(
      'POST',
      '/api/tasks',
      {
        title: '24h Deadline Test Task',
        description: 'Testing 24 hours reminder trigger',
        deadline: deadline24h,
        type: 'daily',
        priority: 'high',
        points: 100,
        assignment: { mode: 'individual', interns: [testIntern1._id.toString()] }
      },
      adminToken
    )
    assert(task24hRes.status === 201, 'Created task for 24h reminder test')
    const task24h = task24hRes.data.task

    // Trigger check
    const check1 = await request('POST', '/api/reminders/check', {}, adminToken)
    assert(check1.status === 200, 'Admin can trigger deadline check (POST /api/reminders/check)')
    assert(check1.data.result.remindersSentCount >= 1, '24h Reminder sent to intern')

    // Verify Notification in DB
    const notif24h = await request('GET', '/api/notifications', null, internToken)
    const found24h = notif24h.data.notifications.find((n) => n.type === 'TASK_DEADLINE_24H' && String(n.meta?.taskId) === String(task24h._id))
    assert(Boolean(found24h), 'In-app notification created for TASK_DEADLINE_24H')
    assert(Boolean(found24h?.meta?.taskId), 'Notification includes meta.taskId for direct navigation')

    // 2. Test Duplicate Reminder Prevention (Idempotency)
    const check2 = await request('POST', '/api/reminders/check', {}, adminToken)
    assert(check2.status === 200, 'Second deadline check succeeds')
    const notifCountAfter = await request('GET', '/api/notifications', null, internToken)
    const matchCount = notifCountAfter.data.notifications.filter((n) => n.type === 'TASK_DEADLINE_24H' && String(n.meta?.taskId) === String(task24h._id)).length
    assert(matchCount === 1, 'Duplicate 24h reminder prevented (exactly 1 notification exists)')

    // 3. Test 1h reminder
    const deadline1h = new Date(Date.now() + 45 * 60 * 1000).toISOString()
    const task1hRes = await request(
      'POST',
      '/api/tasks',
      {
        title: '1h Deadline Test Task',
        description: 'Testing 1 hour urgent reminder trigger',
        deadline: deadline1h,
        type: 'daily',
        priority: 'critical',
        points: 150,
        assignment: { mode: 'individual', interns: [testIntern1._id.toString()] }
      },
      adminToken
    )
    assert(task1hRes.status === 201, 'Created task for 1h reminder test')
    const task1h = task1hRes.data.task

    await request('POST', '/api/reminders/check', {}, adminToken)
    const notif1h = await request('GET', '/api/notifications', null, internToken)
    const found1h = notif1h.data.notifications.find((n) => n.type === 'TASK_DEADLINE_1H' && String(n.meta?.taskId) === String(task1h._id))
    assert(Boolean(found1h), 'In-app notification created for TASK_DEADLINE_1H')

    // 4. Test Deadline Reached (TASK_DEADLINE_NOW)
    const deadlineNow = new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    const taskNowRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Deadline Reached Test Task',
        description: 'Testing deadline reached trigger',
        deadline: deadlineNow,
        type: 'daily',
        priority: 'high',
        points: 200,
        assignment: { mode: 'individual', interns: [testIntern1._id.toString()] }
      },
      adminToken
    )
    assert(taskNowRes.status === 201, 'Created task for deadline reached test')
    const taskNow = taskNowRes.data.task

    await request('POST', '/api/reminders/check', {}, adminToken)
    const notifNow = await request('GET', '/api/notifications', null, internToken)
    const foundNow = notifNow.data.notifications.find((n) => n.type === 'TASK_DEADLINE_NOW' && String(n.meta?.taskId) === String(taskNow._id))
    assert(Boolean(foundNow), 'In-app notification created for TASK_DEADLINE_NOW')

    // 5. Test Overdue Task (TASK_OVERDUE) and status update
    const deadlineOverdue = new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago
    const taskOverdueRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Overdue Task Test',
        description: 'Testing overdue reminder and status change',
        deadline: deadlineOverdue,
        type: 'daily',
        priority: 'medium',
        points: 80,
        assignment: { mode: 'individual', interns: [testIntern1._id.toString()] }
      },
      adminToken
    )
    assert(taskOverdueRes.status === 201, 'Created task for overdue test')
    const taskOverdue = taskOverdueRes.data.task

    await request('POST', '/api/reminders/check', {}, adminToken)
    const notifOverdue = await request('GET', '/api/notifications', null, internToken)
    const foundOverdue = notifOverdue.data.notifications.find((n) => n.type === 'TASK_OVERDUE' && String(n.meta?.taskId) === String(taskOverdue._id))
    assert(Boolean(foundOverdue), 'In-app notification created for TASK_OVERDUE')

    // Verify task assignment status updated to 'overdue'
    const fetchedOverdueTask = await request('GET', `/api/tasks/${taskOverdue._id}`, null, adminToken)
    const assignmentStatus = fetchedOverdueTask.data.task.assignments[0]?.status
    assert(assignmentStatus === 'overdue', 'Assignment status atomically updated to overdue')

    // 6. Test Completed task does NOT receive reminders
    const futureDeadline = new Date(Date.now() + 10 * 3600 * 1000).toISOString()
    const taskCompRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Completed Task Not Reminded',
        description: 'Completed tasks must never trigger reminders',
        deadline: futureDeadline,
        type: 'daily',
        priority: 'low',
        points: 50,
        assignment: { mode: 'individual', interns: [testIntern1._id.toString()] }
      },
      adminToken
    )
    const taskComp = taskCompRes.data.task
    // Mark as completed and backdate deadline to past
    const pastDeadline = new Date(Date.now() - 3 * 3600 * 1000)
    await (await import('../src/models/Task.js')).default.updateOne(
      { _id: taskComp._id, 'assignments.intern': testIntern1._id },
      { $set: { 'assignments.$.status': 'completed', deadline: pastDeadline } }
    )

    await request('POST', '/api/reminders/check', {}, adminToken)
    const notifCompCheck = await request('GET', '/api/notifications', null, internToken)
    const foundCompletedNotif = notifCompCheck.data.notifications.find(
      (n) => String(n.meta?.taskId) === String(taskComp._id) && (n.type?.startsWith('TASK_DEADLINE_') || n.type === 'TASK_OVERDUE')
    )
    assert(!foundCompletedNotif, 'Completed task does NOT receive deadline or overdue reminders')

    // 7. Test Multi-Intern Independent Reminders
    if (testIntern1._id.toString() !== testIntern2._id.toString()) {
      const futureMultiDeadline = new Date(Date.now() + 10 * 3600 * 1000).toISOString()
      const multiTaskRes = await request(
        'POST',
        '/api/tasks',
        {
          title: 'Multi-Intern Independent Reminders',
          description: 'Testing independent reminders per intern',
          deadline: futureMultiDeadline,
          type: 'daily',
          priority: 'high',
          points: 120,
          assignment: { mode: 'individual', interns: [testIntern1._id.toString(), testIntern2._id.toString()] }
        },
        adminToken
      )
      const multiTask = multiTaskRes.data.task

      // Mark Intern 1 as completed, leave Intern 2 as assigned, backdate deadline to past
      const pastMultiDeadline = new Date(Date.now() - 2 * 3600 * 1000)
      const TaskModel = (await import('../src/models/Task.js')).default
      await TaskModel.updateOne(
        { _id: multiTask._id, 'assignments.intern': testIntern1._id },
        { $set: { 'assignments.$.status': 'completed', deadline: pastMultiDeadline } }
      )

      await request('POST', '/api/reminders/check', {}, adminToken)

      // Intern 1 should have NO overdue reminder
      const notifs1 = await request('GET', '/api/notifications', null, internToken)
      const foundMulti1 = notifs1.data.notifications.find(
        (n) => String(n.meta?.taskId) === String(multiTask._id) && (n.type?.startsWith('TASK_DEADLINE_') || n.type === 'TASK_OVERDUE')
      )
      assert(!foundMulti1, 'Completed intern does not receive reminder in multi-intern task')

      // Intern 2 should have overdue reminder in DB
      const NotificationModel = (await import('../src/models/Notification.js')).default
      const notif2 = await NotificationModel.findOne({ user: testIntern2._id, 'meta.taskId': multiTask._id, type: 'TASK_OVERDUE' })
      assert(Boolean(notif2), 'Pending intern independently receives TASK_OVERDUE in multi-intern task')
    }

    // 8. Test Intern Personal Schedule Endpoint
    const schedRes = await request('GET', '/api/reminders/my-schedule', null, internToken)
    assert(schedRes.status === 200, 'Intern can retrieve deadline schedule (GET /api/reminders/my-schedule)')
    assert(Array.isArray(schedRes.data.schedule), 'Schedule returned as an array')
    assert(schedRes.data.schedule.length > 0, 'Schedule contains assigned tasks')
    assert(Boolean(schedRes.data.schedule[0].label), 'Schedule items contain human-readable deadline label')

    // 9. Test Faculty Overview Endpoint
    const overviewRes = await request('GET', '/api/reminders/overview', null, adminToken)
    assert(overviewRes.status === 200, 'Faculty can view deadline overview (GET /api/reminders/overview)')
    assert(typeof overviewRes.data.overview.overdueCount === 'number', 'Overview contains overdueCount')
    assert(Array.isArray(overviewRes.data.overview.overdueTasks), 'Overview contains overdueTasks array')
  }

  // Suite 9: AI Task Description Helper
  console.log('\n[Suite 9: AI Task Description Helper]')
  {
    const internsList = await User.find({ role: 'intern' }).limit(2)
    const internA = internsList[0]
    const internB = internsList[1] || internsList[0]

    // 1. Unauthenticated request rejected with 401
    const unauth = await request('POST', '/api/ai/generate-task-description', {
      taskIdea: 'Build a responsive login page using React',
    })
    assert(unauth.status === 401, 'Unauthenticated generate-task-description rejected with 401 Unauthorized')

    // 2. Intern role rejected with 403 Forbidden
    const internReq = await request(
      'POST',
      '/api/ai/generate-task-description',
      { taskIdea: 'Build a responsive login page using React' },
      internToken
    )
    assert(internReq.status === 403, 'Intern is forbidden (403) from generating task descriptions')

    // 3. Validation: Empty or short taskIdea rejected with 400
    const emptyReq = await request(
      'POST',
      '/api/ai/generate-task-description',
      { taskIdea: ' ' },
      adminToken
    )
    assert(emptyReq.status === 400, 'Empty task idea rejected with 400 Bad Request')

    // 4. Short task idea generation succeeds with 200
    const genRes1 = await request(
      'POST',
      '/api/ai/generate-task-description',
      { taskIdea: 'Build a responsive login page using React' },
      adminToken
    )
    assert(genRes1.status === 200, 'Faculty can generate task description from short idea (200 OK)')
    assert(Boolean(genRes1.data?.title), 'Generated response contains suggested title')
    assert(Boolean(genRes1.data?.description), 'Generated response contains structured description')
    assert(Array.isArray(genRes1.data?.instructions), 'Generated response contains instructions array')
    assert(
      genRes1.data?.description.includes('Overview') &&
      genRes1.data?.description.includes('Objectives') &&
      genRes1.data?.description.includes('Instructions') &&
      genRes1.data?.description.includes('Deliverables'),
      'Generated description includes required structured sections'
    )

    // 5. Detailed task idea with category, difficulty, expectedOutcome succeeds
    const genRes2 = await request(
      'POST',
      '/api/ai/generate-task-description',
      {
        taskIdea: 'Design JWT authentication API with Express and bcrypt',
        category: 'Backend Security',
        difficulty: 'Intermediate',
        expectedOutcome: 'Working auth endpoints with JWT tokens and error handling',
      },
      adminToken
    )
    assert(genRes2.status === 200, 'Faculty can generate task description with detailed parameters (200 OK)')
    assert(genRes2.data?.description.includes('Backend Security') || genRes2.data?.title.includes('JWT'), 'Generated task description reflects specified domain/category')

    // 6. Test creating task using AI-generated output with multiple interns
    const aiTaskRes = await request(
      'POST',
      '/api/tasks',
      {
        title: genRes1.data.title,
        description: genRes1.data.description,
        instructions: genRes1.data.instructions,
        type: 'daily',
        priority: 'high',
        points: 250,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        assignment: {
          mode: 'individual',
          interns: [String(internA._id), String(internB._id)],
        },
      },
      adminToken
    )
    assert(aiTaskRes.status === 201, 'Admin can create task using AI-generated output (201 Created)')
    assert(aiTaskRes.data.task.title === genRes1.data.title, 'Created task retains AI-generated title')
    assert(aiTaskRes.data.task.assignment.interns.length === 2, 'Task assigned to multiple selected interns successfully')
  }

  // Teardown
  server.close()
  await mongoose.disconnect()

  console.log('\n=============================================')
  console.log(`Tests Finished: ${passed} Passed, ${failed} Failed`)
  console.log('=============================================')

  if (failed > 0) process.exit(1)
  else process.exit(0)
}

runTests().catch((err) => {
  console.error('[fatal] test failed:', err)
  process.exit(1)
})
