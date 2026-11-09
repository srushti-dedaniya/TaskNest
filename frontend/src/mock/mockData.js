// Isolated Mock Data for TaskNest Fellowship Portal

export const MOCK_INTERN = {
  id: 'usr-001',
  name: 'Julian Vance',
  email: 'julian.vance@tasknest.org',
  role: 'intern',
  cohort: 'Cohort 09 // Sprint 04',
  batch: 'Batch 2025',
  rank: 'Rank 03',
  tier: 'Scholar III',
  avatar: 'JV',
  points: 1420,
  level: 4,
  nextLevelPoints: 2000,
  tasksCompleted: 14,
  tasksInProgress: 3,
  firstPassRate: '92.4%',
  attendance: '98%',
  bio: 'Specializing in distributed systems, consensus engines, and formal cryptographic protocol verification.',
  github: 'https://github.com/julianvance',
  linkedin: 'https://linkedin.com/in/julianvance',
  joinedAt: '2025-09-01'
}

export const MOCK_ADMIN = {
  id: 'usr-000',
  name: 'Elena Rostova',
  email: 'admin@tasknest.org',
  role: 'admin',
  title: 'Lead Systems Architect & Chair',
  cohort: 'Faculty & Governance',
  avatar: 'ER',
  bio: 'Principal research lead for distributed consensus systems and intern fellowship supervisor.',
  joinedAt: '2023-01-15'
}

export const MOCK_INTERNS_LIST = [
  {
    id: 'usr-001',
    name: 'Julian Vance',
    email: 'julian.vance@tasknest.org',
    role: 'intern',
    cohort: 'Cohort 09',
    batch: 'Batch 2025',
    rank: 'Rank 01',
    tier: 'Scholar III',
    avatar: 'JV',
    points: 1420,
    tasksCompleted: 14,
    activeTasks: 2,
    status: 'Active',
    velocity: '+18%',
    focusArea: 'Distributed Storage & Raft Engines'
  },
  {
    id: 'usr-002',
    name: 'Lin Zhang',
    email: 'lin.zhang@tasknest.org',
    role: 'intern',
    cohort: 'Cohort 09',
    batch: 'Batch 2025',
    rank: 'Rank 02',
    tier: 'Fellow II',
    avatar: 'LZ',
    points: 1280,
    tasksCompleted: 12,
    activeTasks: 3,
    status: 'Active',
    velocity: '+14%',
    focusArea: 'TLS 1.3 Cryptographic Monograph'
  },
  {
    id: 'usr-003',
    name: 'Aris Weaver',
    email: 'aris.weaver@tasknest.org',
    role: 'intern',
    cohort: 'Cohort 09',
    batch: 'Batch 2025',
    rank: 'Rank 05',
    tier: 'Apprentice I',
    avatar: 'AW',
    points: 950,
    tasksCompleted: 9,
    activeTasks: 1,
    status: 'Active',
    velocity: '+8%',
    focusArea: 'Kernel Memory & eBPF Telemetry'
  },
  {
    id: 'usr-004',
    name: 'Betrice Nat',
    email: 'betrice.nat@tasknest.org',
    role: 'intern',
    cohort: 'Cohort 09',
    batch: 'Batch 2025',
    rank: 'Rank 04',
    tier: 'Fellow I',
    avatar: 'BN',
    points: 1110,
    tasksCompleted: 11,
    activeTasks: 2,
    status: 'Review Pending',
    velocity: '+12%',
    focusArea: 'Fault-tolerant Consensus Pipeline'
  },
  {
    id: 'usr-005',
    name: 'Kaelen Miller',
    email: 'kaelen.miller@tasknest.org',
    role: 'intern',
    cohort: 'Cohort 09',
    batch: 'Batch 2025',
    rank: 'Rank 06',
    tier: 'Apprentice II',
    avatar: 'KM',
    points: 820,
    tasksCompleted: 8,
    activeTasks: 3,
    status: 'Active',
    velocity: '+5%',
    focusArea: 'Deterministic Finite State Machines'
  }
]

export const MOCK_TASKS = [
  {
    id: 'task-01',
    code: 'SPEC-0841',
    title: 'Implement Distributed Consensus — Raft Elections',
    type: 'Daily',
    category: 'Core Protocol',
    priority: 'Critical',
    points: 450,
    deadline: '2026-11-12T23:59:00Z',
    status: 'In Progress',
    assignedTo: 'usr-001',
    assignedToName: 'Julian Vance',
    description:
      'Implement shippable raft leader election protocol inside crates/raft-consensus. Verify deterministic state transitions and attach benchmark telemetry with the submission bundle.',
    instructions: [
      'Branch your crate from feat/raft-election and keep commits atomic.',
      'Implement candidate request vote RPC handlers and election timeout jitter in [150ms, 300ms].',
      'Attach weekly monograph codex before marking registry complete.',
      'Submit the build log alongside the verification bundle.'
    ],
    rubric: [
      { criterion: 'Leader Election Correctness & Split Vote Resolution', maxPoints: 200 },
      { criterion: 'Fuzz Benchmark Telemetry & State Determinism', maxPoints: 150 },
      { criterion: 'Formal Monograph Documentation Quality', maxPoints: 100 }
    ],
    tags: ['Rust', 'Distributed Systems', 'Raft', 'Consensus']
  },
  {
    id: 'task-02',
    code: 'DOCS-0210',
    title: 'Security Monograph Documentation: TLS 1.3 Cipher Suites',
    type: 'Daily',
    category: 'Documentation',
    priority: 'Low',
    points: 90,
    deadline: '2026-11-14T18:00:00Z',
    status: 'In Progress',
    assignedTo: 'usr-001',
    assignedToName: 'Julian Vance',
    description:
      'Document TLS 1.3 key exchange cipher suite configurations and formal state machine guarantees for the fellowship internal monograph archive.',
    instructions: [
      'Summarize RFC 8446 cipher suite requirements.',
      'Detail ephemeral Diffie-Hellman forward secrecy guarantees.',
      'Format according to TaskNest Monograph Styleguide.'
    ],
    rubric: [
      { criterion: 'Accuracy of Cryptographic Definitions', maxPoints: 50 },
      { criterion: 'Formatting and Bibliography Rigor', maxPoints: 40 }
    ],
    tags: ['Cryptography', 'TLS', 'Documentation']
  },
  {
    id: 'task-03',
    code: 'SPEC-0722',
    title: 'Telemetry Sampler Retry Backoff Protocol',
    type: 'Daily',
    category: 'Reliability',
    priority: 'Medium',
    points: 220,
    deadline: '2026-11-15T20:00:00Z',
    status: 'Submitted',
    assignedTo: 'usr-004',
    assignedToName: 'Betrice Nat',
    description:
      'Design exponential backoff with full jitter for telemetry ingestion nodes under heavy buffer congestion.',
    instructions: [
      'Implement decorrelated jitter algorithm in the retry loop.',
      'Demonstrate starvation avoidance under simulated 80% packet collision.'
    ],
    rubric: [
      { criterion: 'Mathematical Correctness of Backoff Curve', maxPoints: 120 },
      { criterion: 'Stress Test Benchmark Proof', maxPoints: 100 }
    ],
    tags: ['Telemetry', 'Networking', 'Jitter']
  },
  {
    id: 'task-04',
    code: 'GOAL-WK06',
    title: 'Complete Distributed Log Replication Engine',
    type: 'Weekly',
    category: 'Architecture',
    priority: 'High',
    points: 800,
    deadline: '2026-11-17T23:59:00Z',
    status: 'Pending',
    assignedTo: 'usr-001',
    assignedToName: 'Julian Vance',
    description:
      'Architect the entry append pipeline with monotonic index validation, disk fsync thresholds, and follower catch-up protocols.',
    instructions: [
      'Write write-ahead log (WAL) segment rotating daemon.',
      'Implement AppendEntries RPC with commit index propagation.',
      'Benchmark sequential writes vs random flush.'
    ],
    rubric: [
      { criterion: 'Log Append Throughput (> 25k ops/sec)', maxPoints: 400 },
      { criterion: 'Crash-Recovery Invariant Verification', maxPoints: 400 }
    ],
    tags: ['Storage', 'WAL', 'Weekly Goal']
  },
  {
    id: 'task-05',
    code: 'SPEC-0914',
    title: 'Zero-Copy Serialization Benchmark for IPC Messages',
    type: 'Daily',
    category: 'Performance',
    priority: 'Medium',
    points: 180,
    deadline: '2026-11-18T12:00:00Z',
    status: 'Pending',
    assignedTo: 'usr-002',
    assignedToName: 'Lin Zhang',
    description:
      'Evaluate Cap’n Proto versus FlatBuffers memory-mapped layouts for low-latency inter-process channels.',
    instructions: [
      'Build minimal memory mapping harness.',
      'Record flamegraphs under 1M message dispatch bursts.'
    ],
    rubric: [
      { criterion: 'Flamegraph Analysis & Heap Allocations Zeroing', maxPoints: 100 },
      { criterion: 'Comprehensive Spec Summary', maxPoints: 80 }
    ],
    tags: ['IPC', 'Performance', 'Memory']
  }
]

export const MOCK_SUBMISSIONS = [
  {
    id: 'sub-001',
    taskId: 'task-01',
    taskCode: 'SPEC-0841',
    taskTitle: 'Implement Distributed Consensus — Raft Elections',
    internId: 'usr-001',
    internName: 'Julian Vance',
    internAvatar: 'JV',
    repoUrl: 'https://github.com/tasknest/julian-vance/raft-election',
    liveUrl: 'https://raft-election.julianvance.tasknest.org',
    notes:
      'Election timeouts randomized in the [150ms, 300ms] band. Monograph drafts bound in the artifact bundle alongside benchmark telemetry and fuzz corpora. All 34 automated unit test scenarios passed.',
    submittedAt: '2026-11-06T14:02:00Z',
    status: 'Under Review',
    statusTone: 'bg-secondary-container text-on-secondary-container',
    maxPoints: 450,
    awardedPoints: null,
    feedback: null,
    reviewerId: 'usr-000',
    reviewerName: 'Elena Rostova',
    evaluatedAt: null
  },
  {
    id: 'sub-002',
    taskId: 'task-03',
    taskCode: 'SPEC-0722',
    taskTitle: 'Telemetry Sampler Retry Backoff Protocol',
    internId: 'usr-004',
    internName: 'Betrice Nat',
    internAvatar: 'BN',
    repoUrl: 'https://github.com/tasknest/betrice-nat/retry-backoff',
    liveUrl: 'https://telemetry-demo.betricenat.org',
    notes:
      'Decorrelated jitter implementation validated over 100,000 synthetic queue drops. Exponential ramp holds bounded ceiling at 3.2s.',
    submittedAt: '2026-11-05T11:20:00Z',
    status: 'Pending',
    statusTone: 'bg-secondary-container/60 text-on-secondary-container',
    maxPoints: 220,
    awardedPoints: null,
    feedback: null,
    reviewerId: null,
    reviewerName: null,
    evaluatedAt: null
  },
  {
    id: 'sub-003',
    taskId: 'task-02',
    taskCode: 'DOCS-0210',
    taskTitle: 'Security Monograph Documentation: TLS 1.3 Cipher Suites',
    internId: 'usr-002',
    internName: 'Lin Zhang',
    internAvatar: 'LZ',
    repoUrl: 'https://github.com/tasknest/lin-zhang/tls13-monograph',
    liveUrl: 'https://docs.tasknest.org/monographs/tls13-sec',
    notes:
      'Comprehensive LaTeX and Markdown monograph detailing elliptic curve diffie-hellman and TLS 1.3 state transitions.',
    submittedAt: '2026-11-03T09:15:00Z',
    status: 'Approved',
    statusTone: 'bg-primary text-on-primary',
    maxPoints: 90,
    awardedPoints: 90,
    feedback:
      'Exemplary formal rigor. The state machine proofs and cipher fallback matrix are peer-review ready.',
    reviewerId: 'usr-000',
    reviewerName: 'Elena Rostova',
    evaluatedAt: '2026-11-03T16:45:00Z'
  }
]

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-01',
    type: 'review_approved',
    title: 'Submission Approved & +90 XP Awarded',
    message:
      'Elena Rostova reviewed and approved your Security Monograph Documentation with full marks.',
    timestamp: '2 hours ago',
    read: false,
    link: '/intern/points',
    category: 'Evaluation'
  },
  {
    id: 'notif-02',
    type: 'task_assigned',
    title: 'New Daily Task Assigned',
    message: 'You have been assigned SPEC-0841: Implement Distributed Consensus Raft Elections.',
    timestamp: '1 day ago',
    read: false,
    link: '/intern/tasks/task-01',
    category: 'Tasks'
  },
  {
    id: 'notif-03',
    type: 'sprint_milestone',
    title: 'Sprint 04 Velocity Check',
    message: 'Cohort 09 has crossed 85% sprint milestone completion. Check weekly goals.',
    timestamp: '2 days ago',
    read: true,
    link: '/intern/weekly-goals',
    category: 'Milestone'
  },
  {
    id: 'notif-04',
    type: 'system',
    title: 'Monograph Styleguide Update v2.4',
    message: 'Updated citation format requirements for cryptosystems research submissions.',
    timestamp: '4 days ago',
    read: true,
    link: '/intern/dashboard',
    category: 'System'
  }
]

export const MOCK_PERFORMANCE_HISTORY = [
  { date: 'Oct 08', points: 180, cumulative: 380, sprint: 'Sprint 01' },
  { date: 'Oct 15', points: 320, cumulative: 700, sprint: 'Sprint 02' },
  { date: 'Oct 22', points: 290, cumulative: 990, sprint: 'Sprint 03' },
  { date: 'Oct 29', points: 340, cumulative: 1330, sprint: 'Sprint 04' },
  { date: 'Nov 05', points: 90, cumulative: 1420, sprint: 'Sprint 05' }
]

export const MOCK_ADMIN_METRICS = {
  totalFellows: 27,
  activeTasks: 16,
  dispatchesToday: 11,
  queueDepth: 3,
  firstPassRate: '78.9%',
  avgTurnaroundHours: '2.4h',
  slaTargetHours: '6.0h',
  openFlags: 1
}

