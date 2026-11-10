import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { taskService } from '../../services/api.js'

export default function TaskDetails() {
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchTask() {
      if (!taskId || taskId === 'task-01') return
      try {
        setLoading(true)
        const res = await taskService.get(taskId)
        if (res?.task) {
          setTask(res.task)
        }
      } catch (err) {
        console.warn('[TaskDetails] API fetch failed, using fallback:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [taskId])

  const title = task?.title || 'Implement Distributed Consensus Raft Election Protocol'
  const points = task?.points ?? 350
  const priority = task?.priority ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority` : 'High Priority'
  const type = task?.type === 'weekly' ? 'Weekly Milestone' : 'Daily Sprint'
  const description = task?.description || 'Your directive in this sprint is to architect and formalize the core Leader Election state machine of our in-house Raft implementation in high-performance Rust. The module serves as the distributed spine for TaskNest’s analytical streaming fabric, demanding rock-solid determinism and sub-millisecond failover resolution.'
  const instructions = task?.instructions || 'When a heartbeat deadline lapses without authority communication, node candidates must trigger election protocol transitions. You will orchestrate randomized timer windows, monotonically increasing epoch counters (current_term), candidate self-nomination routines, and non-blocking asynchronous vote collection over gRPC transports.'
  const deadline = task?.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Today, 18:00 UTC'
  const submitTarget = `/intern/tasks/${taskId || 'task-01'}/submit`

  return (
    <div className="space-y-8">
      <div className="relative py-space-md mb-space-xl">
      <div className="flex flex-wrap items-center gap-space-xs font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant mb-space-md">
      <Link to="/intern/daily-tasks" className="hover:text-primary transition-colors" >Tasks</Link>
      <span className="text-outline/40">/</span>
      <span className="text-secondary font-semibold">{title}</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
      <div className="max-w-3xl">
      <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase tracking-widest mb-space-sm shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
      <span>{type}</span>
      <span className="text-outline/40">•</span>
      <span className="text-secondary font-semibold">{priority}</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-none mb-space-md">
                {title}
              </h1>
      <div className="flex flex-wrap items-center gap-space-sm text-body-sm">
      <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps uppercase tracking-wider font-semibold shadow-sm">
      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Active Task
                </div>
      <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest text-primary font-label-xs-caps uppercase tracking-wider font-semibold shadow-sm">
      <span className="material-symbols-outlined text-[14px] text-secondary">military_tech</span>
                  {points} Points
                </div>
      <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-xs-caps uppercase tracking-wider shadow-sm">
      <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {deadline}
      </div>
      </div>
      </div>
      <div className="flex items-center gap-space-sm">
      <Link to={submitTarget} className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs transition-all shadow-sm flex items-center gap-1.5 font-semibold">
      <span className="material-symbols-outlined text-[18px]">upload</span>
        Submit Work
      </Link>
      </div>
      </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
      <div className="lg:col-span-8 flex flex-col gap-space-lg">
      <div className="relative bg-surface-container-lowest rounded-xl p-space-xl shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] overflow-hidden">
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between mb-space-lg">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-secondary block mb-0.5">Section 01 // Architectural Scope</span>
      <h2 className="font-headline-sm text-headline-sm text-primary">Task Overview &amp; Technical Mandate</h2>
      </div>
      <span className="material-symbols-outlined text-outline-variant text-[24px]">architecture</span>
      </div>
      <div className="font-body-lg text-body-lg text-on-surface-variant space-y-space-md leading-relaxed">
      <p>
                  Your directive in this sprint is to architect and formalize the core <strong className="text-primary font-semibold">Leader Election state machine</strong> of our in-house Raft implementation in high-performance Rust. The module serves as the distributed spine for TaskNest’s analytical streaming fabric, demanding rock-solid determinism and sub-millisecond failover resolution.
                </p>
      <p>
                  When a heartbeat deadline lapses without authority communication, node candidates must trigger election protocol transitions. You will orchestrate randomized timer windows, monotonically increasing epoch counters (<code className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-body-sm font-semibold">current_term</code>), candidate self-nomination routines, and non-blocking asynchronous vote collection over gRPC transports.
                </p>
      </div>
      <div className="mt-space-lg p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row gap-space-md items-start md:items-center justify-between">
      <div className="flex items-center gap-space-md">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[20px]">terminal</span>
      </div>
      <div>
      <div className="font-title-md text-title-md text-primary">Crate Architecture Target</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant font-mono">crates/raft-consensus/src/election.rs</div>
      </div>
      </div>
      <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-xs-caps uppercase tracking-wider font-semibold">
                  Rust 2024 Edition • Tokio Core
                </span>
      </div>
      <div className="mt-space-lg">
      <div className="flex items-center justify-between mb-2">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant font-semibold">Specification Coverage</span>
      <span className="font-title-md text-title-md text-secondary">3 of 4 Criteria Met (75%)</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
      <div className="h-full bg-secondary rounded-full" style={{ width: "75%" }}></div>
      </div>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)]">
      <div className="flex items-center justify-between mb-space-lg">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-secondary block mb-0.5">Section 02 // Protocol Verifications</span>
      <h2 className="font-headline-sm text-headline-sm text-primary">Requirements &amp; Rubric Checklist</h2>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">4 Criteria Total</span>
      </div>
      <div className="space-y-space-md" id="requirements-list">
      <div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-space-md cursor-pointer group requirement-item">
      <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
      <span className="material-symbols-outlined text-[16px]">check</span>
      </div>
      <div className="flex-1">
      <div className="flex items-baseline justify-between">
      <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors">1. Randomized Election Timeout Engine</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">Verified</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Synthesize pseudo-random timeouts evenly partitioned between <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">150ms</code> and <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">300ms</code> using thread-safe entropy to completely mitigate cyclic election splits across 5-node clusters.
                    </p>
      </div>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-space-md cursor-pointer group requirement-item">
      <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
      <span className="material-symbols-outlined text-[16px]">check</span>
      </div>
      <div className="flex-1">
      <div className="flex items-baseline justify-between">
      <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors">2. RequestVote RPC &amp; Strict Monotonic Terms</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">Verified</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Construct strongly typed serializable RPC envelopes containing candidate IDs, candidate terms, and commit indexes. Reject stale candidate terms deterministically and transition candidate nodes to followers on higher discovered terms.
                    </p>
      </div>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-space-md cursor-pointer group requirement-item">
      <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
      <span className="material-symbols-outlined text-[16px]">check</span>
      </div>
      <div className="flex-1">
      <div className="flex items-baseline justify-between">
      <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors">3. Quorum Convergence &amp; Leadership Claim</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">Verified</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Calculate majority agreement threshold (<code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">(N / 2) + 1</code>). Once quorum confirms vote grant, transition immediately to leader state and dispatch baseline empty <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">AppendEntries</code> heartbeat pulses across peer cluster.
                    </p>
      </div>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-container transition-colors flex items-start gap-space-md cursor-pointer group requirement-item">
      <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center bg-surface-container-highest text-outline-variant flex-shrink-0 transition-transform group-hover:scale-105">
      <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
      </div>
      <div className="flex-1">
      <div className="flex items-baseline justify-between">
      <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors">4. Integration Test Suite Validation</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-error font-semibold">In Progress</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Pass test runner suite inside <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">tests/raft_election_tests.rs</code> with a strict 100% pass rate under synthetic packet loss simulations (Simulated 5% WAN drop rate).
                    </p>
      </div>
      </div>
      </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
      <div className="space-y-2">
      <div className="flex items-center gap-3">
      <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
      <p className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Monday, 14 October • Sprint 06</p>
      </div>
      <div className="space-y-1">
      <p className="font-title-lg text-title-lg text-secondary italic">Good morning, Julian</p>
      <h1 className="font-display text-display text-primary tracking-tight font-normal leading-none">Your Growth Journey.</h1>
      </div>
      </div>
      <div className="flex items-center gap-3 self-start md:self-auto">
      <div className="px-4 py-2 rounded-full bg-surface-container text-on-surface flex items-center gap-2 shadow-sm">
      <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
      <span className="font-label-md text-label-md">Fellowship Tier: Scholar III</span>
      </div>
      <button className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-md hover:bg-surface-tint transition-all flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">add_task</span>
      <span>Log Sprint Reflection</span>
      </button>
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="relative overflow-hidden rounded-lg bg-surface-bright/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-container/30 pointer-events-none blur-xl"></div>
      <div className="flex items-center justify-between text-on-surface-variant mb-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Total Accumulation</span>
      <span className="material-symbols-outlined text-[20px] text-secondary">workspace_premium</span>
      </div>
      <div className="flex items-baseline gap-2">
      <span className="font-headline-lg text-headline-lg text-primary font-normal">3,850</span>
      <span className="font-title-md text-title-md text-secondary font-semibold">XP</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
      <span className="text-secondary font-medium">+320 XP this week</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high">Level 03 Craft</span>
      </div>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-surface-bright/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none blur-xl"></div>
      <div className="flex items-center justify-between text-on-surface-variant mb-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Active Pipeline</span>
      <span className="material-symbols-outlined text-[20px] text-primary">pending_actions</span>
      </div>
      <div className="flex items-baseline gap-2">
      <span className="font-headline-lg text-headline-lg text-primary font-normal">12</span>
      <span className="font-title-md text-title-md text-on-surface-variant font-medium">Assigned</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
      <span className="text-error font-medium flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>
                3 due today
              </span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high">Sprint 06</span>
      </div>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-surface-bright/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-container/40 pointer-events-none blur-xl"></div>
      <div className="flex items-center justify-between text-on-surface-variant mb-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Delivered Output</span>
      <span className="material-symbols-outlined text-[20px] text-secondary">task_alt</span>
      </div>
      <div className="flex items-baseline gap-2">
      <span className="font-headline-lg text-headline-lg text-primary font-normal">48</span>
      <span className="font-title-md text-title-md text-on-surface-variant font-medium">Tasks</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
      <span className="text-secondary font-medium">98.4% velocity rating</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high">Top 5%</span>
      </div>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-surface-bright/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-error/5 pointer-events-none blur-xl"></div>
      <div className="flex items-center justify-between text-on-surface-variant mb-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Advisory Queue</span>
      <span className="material-symbols-outlined text-[20px] text-primary">rate_review</span>
      </div>
      <div className="flex items-baseline gap-2">
      <span className="font-headline-lg text-headline-lg text-primary font-normal">02</span>
      <span className="font-title-md text-title-md text-on-surface-variant font-medium">In Review</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
      <span className="font-medium text-on-surface-variant">Awaiting Mentor Rubric</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high">Stage 2</span>
      </div>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] flex flex-col justify-between">
      <div>
      <div className="flex items-center gap-space-xs text-secondary mb-space-sm">
      <span className="material-symbols-outlined text-[20px]">verified</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Quality Bar &amp; Linters</span>
      </div>
      <h3 className="font-title-lg text-title-lg text-primary mb-space-sm">Deliverables Expectations</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Every committed patch must pass formatting conventions through <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-primary">cargo fmt --check</code> and complete static analysis with zero compiler diagnostics or linter alerts under <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-primary">cargo clippy -- -D warnings</code>.
                  </p>
      </div>
      <div className="mt-space-md pt-space-md flex items-center justify-between text-on-surface-variant font-label-xs-caps">
      <span className="uppercase tracking-wider">Automated CI Check</span>
      <span className="text-primary font-semibold">Ready for Runner Hook</span>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] flex flex-col justify-between">
      <div>
      <div className="flex items-center gap-space-xs text-secondary mb-space-sm">
      <span className="material-symbols-outlined text-[20px]">history_edu</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider font-semibold">Provenance &amp; Attribution</span>
      </div>
      <h3 className="font-title-lg text-title-lg text-primary mb-space-sm">Assigned Metadata</h3>
      <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
      <div className="flex justify-between items-center py-1">
      <span>Commissioned By</span>
      <span className="text-primary font-title-md">Elena Rostova, Staff Architect</span>
      </div>
      <div className="flex justify-between items-center py-1">
      <span>Timestamp</span>
      <span className="text-primary">Oct 10, 2024 • 09:14 UTC</span>
      </div>
      <div className="flex justify-between items-center py-1">
      <span>Repository Subsystem</span>
      <span className="text-primary font-mono text-xs">TaskNest-mono/crates/raft</span>
      </div>
      </div>
      </div>
      <div className="mt-space-md pt-space-md flex items-center justify-between text-on-surface-variant font-label-xs-caps">
      <span className="uppercase tracking-wider">Sprint Phase</span>
      <span className="text-secondary font-semibold">Active Development Cycle</span>
      </div>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)]">
      <div className="flex items-center justify-between mb-space-md">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[22px] text-secondary">forum</span>
      <h3 className="font-title-lg text-title-lg text-primary">Mentor Feedback Thread</h3>
      </div>
      <span className="px-space-sm py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-xs-caps uppercase tracking-wider font-semibold">1 New Note</span>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col sm:flex-row gap-space-md items-start">
      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-display text-title-lg flex-shrink-0">
                  ER
                </div>
      <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-space-xs">
      <span className="font-title-md text-title-md text-primary">Elena Rostova</span>
      <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-label-xs-caps uppercase text-[9px]">Staff Architect</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant">2 hours ago</span>
      </div>
      <p className="font-body-md text-body-md text-primary leading-relaxed italic bg-surface-container-lowest/80 p-space-sm rounded mb-space-sm">
                    “Ensure you test partition split brain scenarios before final submission. Particularly check that a minority candidate disconnected on term N does not continuously increase term numbers and disrupt the healthy leader upon network re-attachment.”
                  </p>
      <div className="flex items-center gap-space-md">
      <button className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">reply</span>
                      Acknowledge Directive
                    </button>
      <button className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors">
                      View Referenced Commits
                    </button>
      </div>
      </div>
      </div>
      </div>
      </div>
      <div className="lg:col-span-4 flex flex-col gap-space-lg">
      <div className="bg-primary text-on-primary rounded-xl p-space-xl shadow-[0_12px_32px_-4px_rgba(53,51,45,0.15)] flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-secondary/30 rounded-full blur-2xl pointer-events-none"></div>
      <div>
      <div className="flex items-center justify-between mb-space-md">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-primary-fixed-dim font-semibold">Immediate Milestone Action</span>
      <span className="material-symbols-outlined text-secondary-fixed text-[20px]">bolt</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-primary mb-space-sm leading-snug">
                  Ready to Deliver Artifacts?
                </h3>
      <p className="font-body-sm text-body-sm text-primary-fixed-dim mb-space-lg leading-relaxed">
                  Finalize branch merges, run cargo validation passes, and upload code bundle with test logs to unlock peer evaluation.
                </p>
      </div>
      <div className="space-y-space-sm">
      <Link to={submitTarget} className="w-full py-3 px-space-md rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-title-md text-title-md text-center flex items-center justify-center gap-2 transition-all shadow-md group" >
      <span>Proceed to Submit Task</span>
      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </Link>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)]">
      <div className="flex items-center justify-between mb-space-md">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant font-semibold">Source Repository</span>
      <span className="w-2 h-2 rounded-full bg-secondary"></span>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low mb-space-md">
      <div className="flex items-center gap-space-xs text-primary font-mono text-body-sm font-semibold truncate mb-1">
      <span className="material-symbols-outlined text-[16px] text-secondary">commit</span>
      <span>TaskNest-mono</span>
      </div>
      <div className="text-on-surface-variant font-mono text-xs truncate">
                  crates/raft-consensus
                </div>
      <div className="mt-space-sm pt-space-xs flex items-center justify-between">
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Active Branch</span>
      <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-primary font-semibold">feat/raft-election</span>
      </div>
      </div>
      <div className="flex items-center justify-between text-body-sm text-on-surface-variant px-1">
      <span className="flex items-center gap-1 font-label-xs-caps uppercase">
      <span className="material-symbols-outlined text-[14px]">history</span> 12 Commits
                </span>
      <span className="flex items-center gap-1 font-label-xs-caps uppercase">
      <span className="material-symbols-outlined text-[14px]">call_split</span> 1 Active PR
                </span>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)]">
      <div className="flex items-center justify-between mb-space-md">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-secondary block mb-0.5">Evaluation Matrix</span>
      <h4 className="font-title-lg text-title-lg text-primary">XP Rubric Breakdown</h4>
      </div>
      <span className="material-symbols-outlined text-outline-variant text-[20px]">workspace_premium</span>
      </div>
      <div className="space-y-space-sm">
      <div className="p-space-md rounded-lg bg-secondary-container/40 flex items-center justify-between">
      <div>
      <div className="flex items-center gap-space-xs">
      <span className="font-title-md text-title-md text-on-secondary-container">Tier A+ Tier</span>
      <span className="px-1.5 py-0.2 rounded bg-secondary text-on-secondary font-label-xs-caps uppercase text-[9px]">Target</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">100% tests, clippy compliant, partition proof</p>
      </div>
      <div className="text-right flex-shrink-0 ml-space-sm">
      <span className="font-headline-sm text-headline-sm text-secondary font-display font-semibold">350</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant block">XP</span>
      </div>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
      <div>
      <span className="font-title-md text-title-md text-primary">Tier A Baseline</span>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Full consensus tests, minor clippy waivers</p>
      </div>
      <div className="text-right flex-shrink-0 ml-space-sm">
      <span className="font-headline-sm text-headline-sm text-primary font-display">300</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant block">XP</span>
      </div>
      </div>
      <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
      <div>
      <span className="font-title-md text-title-md text-primary">Tier B Minimal</span>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Core voting logic passing, unstable latency</p>
      </div>
      <div className="text-right flex-shrink-0 ml-space-sm">
      <span className="font-headline-sm text-headline-sm text-primary font-display">250</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant block">XP</span>
      </div>
      </div>
      </div>
      <div className="mt-space-md pt-space-md flex items-center justify-between text-on-surface-variant font-label-xs-caps">
      <span>Peer Review Quorum</span>
      <span className="text-primary font-semibold">1 Architect + 1 Fellow</span>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] overflow-hidden relative">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant block mb-space-sm font-semibold">Cluster Diagnostic Radar</span>
      <div className="flex items-center justify-between mb-space-md">
      <div>
      <div className="font-display text-headline-sm text-primary">99.88%</div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Simulated Quorum Stability</div>
      </div>
      <div className="text-right">
      <div className="font-display text-headline-sm text-secondary">218ms</div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Mean Timeout Jitter</div>
      </div>
      </div>
      <div className="w-full h-16 relative flex items-end gap-1.5 py-1">
      <div className="flex-1 bg-surface-container h-[40%] rounded-t-sm"></div>
      <div className="flex-1 bg-surface-container h-[65%] rounded-t-sm"></div>
      <div className="flex-1 bg-surface-container h-[50%] rounded-t-sm"></div>
      <div className="flex-1 bg-surface-container h-[85%] rounded-t-sm"></div>
      <div className="flex-1 bg-secondary/70 h-[92%] rounded-t-sm"></div>
      <div className="flex-1 bg-secondary h-[78%] rounded-t-sm"></div>
      <div className="flex-1 bg-surface-container h-[60%] rounded-t-sm"></div>
      <div className="flex-1 bg-secondary h-[95%] rounded-t-sm"></div>
      <div className="flex-1 bg-primary h-[88%] rounded-t-sm"></div>
      </div>
      <div className="flex justify-between text-on-surface-variant font-mono text-[10px] mt-1">
      <span>T-00:15:00</span>
      <span>CURRENT CLUSTER WINDOW</span>
      <span>NOW</span>
      </div>
      </div>
      </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] mb-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
      <span className="material-symbols-outlined text-[24px]">school</span>
      </div>
      <div>
      <h4 className="font-title-lg text-title-lg text-primary">Need architectural advisory before committing?</h4>
      <p className="font-body-md text-body-md text-on-surface-variant">Elena holds open engineering office hours at 16:30 UTC in the Consensus Room.</p>
      </div>
      </div>
      <div className="flex items-center gap-space-sm flex-shrink-0">
      <button className="px-space-lg py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md transition-colors shadow-sm">
              Add to Calendar
            </button>
      <Link to={submitTarget} className="px-space-lg py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm" >
              Submit Final PR
            </Link>
      </div>
      </div>

    </div>
  )
}
