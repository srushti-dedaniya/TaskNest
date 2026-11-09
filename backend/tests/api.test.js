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
