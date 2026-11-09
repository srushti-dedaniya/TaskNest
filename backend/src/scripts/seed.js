import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import User from '../models/User.js'
import Task from '../models/Task.js'
import Submission from '../models/Submission.js'
import Review from '../models/Review.js'
import Notification from '../models/Notification.js'

async function seed() {
  await connectDatabase()
  console.log('[seed] connected to database. Clearing collections...')

  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Submission.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({})
  ])

  console.log('[seed] creating users...')
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Elena Rostova',
    email: (process.env.ADMIN_EMAIL || 'admin@tasknest.org').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    isEmailVerified: true,
    bio: 'Lead Systems Architect & Chair of Distributed Architecture Fellowship.',
    avatar: 'ER'
  })

  const internJulian = await User.create({
    name: 'Julian Vance',
    email: 'julian.vance@tasknest.org',
    password: 'Password@123',
    role: 'intern',
    isEmailVerified: true,
    institution: 'Distributed Systems Institute',
    fieldOfStudy: 'Consensus Protocols & Formal Cryptography',
    points: 1420,
    avatar: 'JV',
    bio: 'Specializing in distributed systems, consensus engines, and formal cryptographic protocol verification.'
  })

  const internLin = await User.create({
    name: 'Lin Zhang',
    email: 'lin.zhang@tasknest.org',
    password: 'Password@123',
    role: 'intern',
    isEmailVerified: true,
    institution: 'Tsinghua University / Enclave Lab',
    fieldOfStudy: 'Applied Cryptography & Security Monographs',
    points: 1280,
    avatar: 'LZ',
    bio: 'Focus on TLS 1.3 cipher suite safety and constant-time cryptography.'
  })

  const internBetrice = await User.create({
    name: 'Betrice Nat',
    email: 'betrice.nat@tasknest.org',
    password: 'Password@123',
    role: 'intern',
    isEmailVerified: true,
    institution: 'Systems Engineering Academy',
    fieldOfStudy: 'Reliability Engineering & Jitter Telemetry',
    points: 1110,
    avatar: 'BN',
    bio: 'Focus on high-throughput streaming telemetry and jitter mitigation.'
  })

  // Seed an unverified intern for testing & verification flows
  const unverifiedIntern = await User.create({
    name: 'Unverified Fellow',
    email: 'unverified.fellow@tasknest.org',
    password: 'Password@123',
    role: 'intern',
    isEmailVerified: false,
    institution: 'Fellow Candidate Enclave',
    fieldOfStudy: 'General Systems',
    points: 0,
    avatar: 'UF',
  })

  console.log('[seed] creating tasks...')
  const taskRaft = await Task.create({
    title: 'Implement Distributed Consensus — Raft Elections',
    code: 'SPEC-0841',
    description:
      'Implement shippable raft leader election protocol inside crates/raft-consensus. Verify deterministic state transitions and attach benchmark telemetry with the submission bundle.',
    instructions: [
      'Branch your crate from feat/raft-election and keep commits atomic.',
      'Implement candidate request vote RPC handlers and election timeout jitter in [150ms, 300ms].',
      'Attach weekly monograph codex before marking registry complete.',
      'Submit the build log alongside the verification bundle.'
    ],
    type: 'daily',
    priority: 'high',
    points: 450,
    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    createdBy: admin._id,
    assignment: {
      mode: 'all',
      interns: [internJulian._id, internLin._id, internBetrice._id]
    },
    assignments: [
      { intern: internJulian._id, status: 'submitted' },
      { intern: internLin._id, status: 'in_progress' },
      { intern: internBetrice._id, status: 'assigned' }
    ]
  })

  const taskSecurity = await Task.create({
    title: 'Security Monograph Documentation: TLS 1.3 Cipher Suites',
    code: 'DOCS-0210',
    description:
      'Document TLS 1.3 key exchange cipher suite configurations and formal state machine guarantees for the fellowship internal monograph archive.',
    instructions: [
      'Summarize RFC 8446 cipher suite requirements.',
      'Detail ephemeral Diffie-Hellman forward secrecy guarantees.',
      'Format according to TaskNest Monograph Styleguide.'
    ],
    type: 'daily',
    priority: 'low',
    points: 90,
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000),
    createdBy: admin._id,
    assignment: {
      mode: 'all',
      interns: [internJulian._id, internLin._id]
    },
    assignments: [
      { intern: internJulian._id, status: 'completed' },
      { intern: internLin._id, status: 'completed' }
    ]
  })

  const taskWeekly = await Task.create({
    title: 'Complete Distributed Log Replication Engine',
    code: 'GOAL-WK06',
    description:
      'Architect the entry append pipeline with monotonic index validation, disk fsync thresholds, and follower catch-up protocols.',
    instructions: [
      'Write write-ahead log (WAL) segment rotating daemon.',
      'Implement AppendEntries RPC with commit index propagation.',
      'Benchmark sequential writes vs random flush.'
    ],
    type: 'weekly',
    priority: 'high',
    points: 800,
    deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000),
    createdBy: admin._id,
    assignment: {
      mode: 'individual',
      interns: [internJulian._id]
    },
    assignments: [{ intern: internJulian._id, status: 'in_progress' }]
  })

  console.log('[seed] creating submissions & reviews...')
  const subJulianRaft = await Submission.create({
    task: taskRaft._id,
    intern: internJulian._id,
    repoUrl: 'https://github.com/tasknest/julian-vance/raft-election',
    liveUrl: 'https://raft-election.julianvance.tasknest.org',
    notes:
      'Election timeouts randomized in the [150ms, 300ms] band. Monograph drafts bound in the artifact bundle alongside benchmark telemetry and fuzz corpora.',
    status: 'submitted',
    submittedAt: new Date(Date.now() - 3600 * 1000)
  })

  const subLinSec = await Submission.create({
    task: taskSecurity._id,
    intern: internLin._id,
    repoUrl: 'https://github.com/tasknest/lin-zhang/tls13-monograph',
    liveUrl: 'https://docs.tasknest.org/monographs/tls13-sec',
    notes:
      'Comprehensive LaTeX and Markdown monograph detailing elliptic curve diffie-hellman and TLS 1.3 state transitions.',
    status: 'approved',
    submittedAt: new Date(Date.now() - 48 * 3600 * 1000)
  })

  const reviewLinSec = await Review.create({
    submission: subLinSec._id,
    reviewer: admin._id,
    decision: 'approved',
    feedback:
      'Exemplary formal rigor. The state machine proofs and cipher fallback matrix are peer-review ready.',
    pointsAwarded: 90,
    pointsPossible: 90,
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000)
  })

  console.log('[seed] creating notifications...')
  await Notification.insertMany([
    {
      user: internJulian._id,
      title: 'New Task Assigned: SPEC-0841',
      body: 'You have been assigned Implement Distributed Consensus — Raft Elections (+450 XP).',
      type: 'task_assigned',
      meta: { taskId: taskRaft._id }
    },
    {
      user: internJulian._id,
      title: 'Sprint 04 Velocity Check',
      body: 'Cohort 09 has crossed 85% sprint milestone completion.',
      type: 'system'
    },
    {
      user: internLin._id,
      title: 'Submission Approved: DOCS-0210',
      body: 'Elena Rostova approved your TLS 1.3 monograph with full marks (+90 XP).',
      type: 'points',
      meta: { taskId: taskSecurity._id, submissionId: subLinSec._id }
    },
    {
      user: admin._id,
      title: 'New Submission for Review',
      body: 'Julian Vance submitted SPEC-0841: Implement Distributed Consensus — Raft Elections.',
      type: 'submission_update',
      meta: { submissionId: subJulianRaft._id, taskId: taskRaft._id }
    }
  ])

  console.log('[seed] database successfully seeded!')
  console.log('--- Credentials ---')
  console.log('Admin:       admin@tasknest.org / Admin@12345')
  console.log('Intern:      julian.vance@tasknest.org / Password@123 (Verified)')
  console.log('Intern:      lin.zhang@tasknest.org / Password@123 (Verified)')
  console.log('Unverified:  unverified.fellow@tasknest.org / Password@123 (Pending Verification)')
  console.log('-------------------')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('[seed] error:', err)
  process.exit(1)
})
