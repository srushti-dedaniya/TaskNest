import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { taskService } from '../../services/api.js'

export default function WeeklyGoals() {
  const [weeklyTasks, setWeeklyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeekly() {
      try {
        setLoading(true)
        const res = await taskService.list({ type: 'weekly' })
        if (res?.tasks) {
          setWeeklyTasks(res.tasks)
        }
      } catch (err) {
        console.warn('[WeeklyGoals] API fetch:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWeekly()
  }, [])
  return (
    <div className="space-y-8">
      {/*Architectural Header Block*/}
      <section className="relative pt-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
      <div className="flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Consensus Dossier • Cycle 2025.2</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Fellowship Weekly Goals</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant">Macroscopic milestone targets and competence track for Sprint 06 (Architectural Consensus).</p>
      </div>
      {/*Sprint Timer Pill*/}
      <div className="flex items-center gap-3 bg-surface-container-high/70 backdrop-blur px-5 py-3 rounded-full shadow-sm self-start md:self-end">
      <span className="material-symbols-outlined text-[20px] text-secondary">hourglass_top</span>
      <div className="flex flex-col">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Active Sprint Deadline</span>
      <span className="font-title-md text-title-md text-primary tracking-tight">2 Days, 14 Hours Remaining</span>
      </div>
      </div>
      </div>
      {/*Architectural Milestone Progress Strip*/}
      <div className="mt-8 bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
      {/*Progress Metric*/}
      <div className="space-y-3">
      <div className="flex justify-between items-baseline">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Sprint 06 Attainment</span>
      <span className="font-label-md text-label-md font-semibold text-secondary">66.7%</span>
      </div>
      <div className="flex items-baseline gap-2">
      <span className="font-display text-display leading-none text-primary">4</span>
      <span className="font-title-lg text-title-lg text-on-surface-variant">/ 6 Goals Met</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-secondary rounded-full transition-all duration-700 ease-out" style={{ width: "66.7%" }}></div>
      </div>
      </div>
      {/*Experience Value Pool*/}
      <div className="space-y-3">
      <div className="flex justify-between items-baseline">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Total Sprint Value</span>
      <span className="font-label-md text-label-md text-on-surface-variant">Cap: 1,800 XP</span>
      </div>
      <div className="flex items-baseline gap-3">
      <span className="font-display text-display leading-none text-primary">1,200</span>
      <div className="flex flex-col">
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">XP Secured</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">600 XP In Play</span>
      </div>
      </div>
      {/*Split Track*/}
      <div className="flex w-full h-1.5 rounded-full overflow-hidden gap-1 bg-surface-container-high">
      <div className="h-full bg-primary rounded-full" style={{ width: "66.7%" }}></div>
      <div className="h-full bg-secondary-fixed-dim rounded-full" style={{ width: "33.3%" }}></div>
      </div>
      </div>
      {/*Trajectory Cadence Graphic*/}
      <div className="flex flex-col justify-between space-y-2">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Velocity Trajectory</span>
      <div className="flex items-center gap-4">
      {/*Inline SVG Sparkline*/}
      <svg className="w-36 h-10 overflow-visible text-secondary" fill="none" viewBox="0 0 144 40">
      <path d="M2 34 L32 28 L64 30 L96 14 L124 16 L142 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
      <circle cx="142" cy="4" fill="currentColor" r="3.5"></circle>
      <path d="M2 34 L32 28 L64 30 L96 14 L124 16 L142 4 V40 H2 Z" fill="currentColor" fillOpacity="0.08"></path>
      </svg>
      <div className="flex flex-col">
      <span className="font-title-md text-title-md text-primary">+14.2%</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Above cohort mean</span>
      </div>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Next verification slot: Tomorrow, 16:00 GMT</span>
      </div>
      </div>
      </div>
      </section>
      {/*Main Multi-Column Dossier Layout*/}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/*Primary Goals Track (8 Cols)*/}
      <div className="lg:col-span-8 flex flex-col gap-10">
      {/*Section: In-Flight Deliverables*/}
      <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="font-headline-sm text-headline-sm text-primary">In-Flight Mandates</span>
      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container font-label-xs-caps text-label-xs-caps text-on-secondary-container font-semibold uppercase">
        {weeklyTasks.length > 0 ? `${weeklyTasks.length} Assigned` : '2 Active'}
      </span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider">Evaluation Tier: Sprint 06</span>
      </div>
      <div className="flex flex-col gap-6">

      {/* Dynamic Weekly Tasks from Backend */}
      {weeklyTasks.map((task) => (
        <div key={task._id} className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md border border-outline-variant/30">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-secondary font-semibold">
                  Weekly Milestone • SPEC-{(task._id || '').slice(-4).toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps font-semibold uppercase">
                  {task.priority || 'Medium'} Priority
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-primary">{task.title}</h2>
              <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center gap-3 self-start">
              <div className="text-right">
                <div className="font-headline-sm text-headline-sm text-primary leading-tight font-medium">
                  {task.points} <span className="font-title-md text-title-md text-secondary">XP</span>
                </div>
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">
                  {task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : 'Sprint Target'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/intern/tasks/${task._id}`}
              className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold font-label-xs-caps uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>View Specification</span>
            </Link>
            <Link
              to={`/intern/tasks/${task._id}/submit`}
              className="px-5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold font-label-xs-caps uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              <span>Submit Milestone Deliverable</span>
            </Link>
          </div>
        </div>
      ))}

      {/*Card: Goal 1*/}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1.5 flex-1">
      <div className="flex items-center gap-3 flex-wrap">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-secondary font-semibold">Core Architecture • G-06-A</span>
      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps font-semibold uppercase">On Track</span>
      </div>
      <h2 className="font-title-lg text-title-lg text-primary">Mastery of Distributed State Machine Replication</h2>
      </div>
      <div className="flex items-center gap-3 self-start">
      <div className="text-right">
      <div className="font-headline-sm text-headline-sm text-primary leading-tight font-medium">500 <span className="font-title-md text-title-md text-secondary">XP</span></div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Weight: High</span>
      </div>
      </div>
      </div>
      {/*Progress & Specs*/}
      <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center text-body-sm font-body-sm">
      <span className="text-on-surface-variant">Progress to Validation</span>
      <span className="font-title-md text-title-md text-primary">75%</span>
      </div>
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-secondary rounded-full" style={{ width: "75%" }}></div>
      </div>
      </div>
      {/*Sub-Deliverable Micro-Checklist*/}
      <div className="mt-6 bg-surface-container-low/70 rounded-2xl p-5 space-y-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant block">Sub-Deliverable Manifest</span>
      <div className="space-y-2.5">
      <label className="flex items-center gap-3 cursor-pointer group">
      <span className="w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-xs">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <span className="font-body-md text-body-md text-on-surface line-through opacity-70">Formal Ongaro &amp; Ousterhout Spec reading &amp; invariant proof</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group">
      <span className="w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-xs">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <span className="font-body-md text-body-md text-on-surface line-through opacity-70">Deterministic split-vote leader election test harness</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group">
      <span className="w-5 h-5 rounded bg-surface-container-high flex items-center justify-center group-hover:bg-surface-variant transition-colors"></span>
      <span className="font-body-md text-body-md text-primary font-medium">Log compaction snapshotter with asynchronous fsync engine</span>
      </label>
      </div>
      </div>
      {/*Mentor Anchor Footer*/}
      <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm font-body-sm">
      <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-xs-caps font-bold">ER</div>
      <span className="text-on-surface-variant">Assigned Mentor: <strong className="text-primary font-medium">Elena Rostova</strong></span>
      </div>
      <div className="flex items-center gap-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">folder_managed</span>
      <span>Branch: <code className="font-mono text-body-sm bg-surface-container px-1.5 py-0.5 rounded">consensus/raft-snapshot</code></span>
      </div>
      </div>
      </div>
      {/*Card: Goal 2*/}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1.5 flex-1">
      <div className="flex items-center gap-3 flex-wrap">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-secondary font-semibold">Systems Performance • G-06-B</span>
      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-xs-caps text-label-xs-caps font-semibold uppercase">Needs Review</span>
      </div>
      <h2 className="font-title-lg text-title-lg text-primary">Zero-Allocation IPC Layer Architecture</h2>
      </div>
      <div className="flex items-center gap-3 self-start">
      <div className="text-right">
      <div className="font-headline-sm text-headline-sm text-primary leading-tight font-medium">400 <span className="font-title-md text-title-md text-secondary">XP</span></div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Weight: Medium</span>
      </div>
      </div>
      </div>
      {/*Progress & Specs*/}
      <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center text-body-sm font-body-sm">
      <span className="text-on-surface-variant">Progress to Validation</span>
      <span className="font-title-md text-title-md text-primary">40%</span>
      </div>
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-secondary rounded-full" style={{ width: "40%" }}></div>
      </div>
      </div>
      {/*Sub-Deliverable Micro-Checklist*/}
      <div className="mt-6 bg-surface-container-low/70 rounded-2xl p-5 space-y-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant block">Sub-Deliverable Manifest</span>
      <div className="space-y-2.5">
      <label className="flex items-center gap-3 cursor-pointer group">
      <span className="w-5 h-5 rounded flex items-center justify-center bg-primary text-on-primary shadow-xs">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <span className="font-body-md text-body-md text-on-surface line-through opacity-70">Shared memory circular ring buffer with futex lock-free poll</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer group">
      <span className="w-5 h-5 rounded bg-surface-container-high flex items-center justify-center group-hover:bg-surface-variant transition-colors"></span>
      <span className="font-body-md text-body-md text-primary font-medium">L3 cache line invalidation latency benchmarks (&lt;120ns target)</span>
      </label>
      </div>
      </div>
      {/*Mentor Anchor Footer*/}
      <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm font-body-sm">
      <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-xs-caps font-bold">KS</div>
      <span className="text-on-surface-variant">Assigned Mentor: <strong className="text-primary font-medium">Dr. Keith Sterling</strong></span>
      </div>
      <div className="flex items-center gap-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">folder_managed</span>
      <span>Branch: <code className="font-mono text-body-sm bg-surface-container px-1.5 py-0.5 rounded">ipc/futex-ring</code></span>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/*Section: Completed Goals Archive*/}
      <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="font-headline-sm text-headline-sm text-primary">Archived &amp; Certified Mandates</span>
      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high font-label-xs-caps text-label-xs-caps text-on-surface-variant font-semibold uppercase">2 Verified</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold tracking-wider">900 XP In Bank</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/*Card: Completed Goal 3*/}
      <div className="bg-surface-container-low rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
      <div className="space-y-3">
      <div className="flex items-center justify-between">
      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-xs-caps text-label-xs-caps font-semibold uppercase">Sprint 06 • Certified</span>
      <span className="font-title-md text-title-md text-primary font-bold px-2 py-0.5 rounded-lg bg-surface-container-highest">Grade A+</span>
      </div>
      <h3 className="font-title-md text-title-md text-primary">Automated Chaos Testing Suite</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Jepsen-style network partition injector with automated split-brain reconciliation verification.</p>
      </div>
      <div className="pt-4 space-y-2">
      <div className="flex justify-between items-center font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">
      <span>Award Value</span>
      <span className="text-secondary font-semibold">+450 XP Awarded</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full w-full"></div>
      </div>
      </div>
      </div>
      {/*Card: Completed Goal 4*/}
      <div className="bg-surface-container-low rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
      <div className="space-y-3">
      <div className="flex items-center justify-between">
      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-xs-caps text-label-xs-caps font-semibold uppercase">Sprint 06 • Certified</span>
      <span className="font-title-md text-title-md text-primary font-bold px-2 py-0.5 rounded-lg bg-surface-container-highest">Tier A</span>
      </div>
      <h3 className="font-title-md text-title-md text-primary">Formal TLA+ Verification of Heartbeat Protocol</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Full state-space exploration with TLC model checker verifying liveness under message reordering.</p>
      </div>
      <div className="pt-4 space-y-2">
      <div className="flex justify-between items-center font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">
      <span>Award Value</span>
      <span className="text-secondary font-semibold">+450 XP Awarded</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full w-full"></div>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/*Visual Context Inset: Lab Snapshot*/}
      <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-6">
      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
      <img className="w-full h-full object-cover" data-alt="An architectural engineering studio laboratory table with technical blueprints of distributed system protocols, warm directional tungsten lamp lighting, beige paper notebooks, and minimal stainless steel instruments in a warm earthy palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk6VyFt0X8VsxZdFWGP-uLFogpmcUCRXFb-FjrG6T6blKnj-H-WlwJ2xlhZc-xYV4KkNdK_y6_hl8HojXaXDxbkX4C_IeLGC9Do8cOHe6ZG_ECTenU7_2jCexDrBGNFW5naUnbk7jBwJZPIw5U8W9kyIaSWs-XdEVPjaayaWR1A7d_pX0ibASBrXwcFP19b2hySGfa9useUvur9Ffr3k27QO81tI56DqKzU57SgHmv" />
      </div>
      <div className="space-y-2">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px] text-secondary">workspace_premium</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant font-semibold">Monograph Verification Archive</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface">Every sprint milestone is preserved in the physical TaskNest Consensus Annals. Submissions requiring Tier S grade eligibility must undergo dual-fellow code audit prior to sprint closeout.</p>
      </div>
      </div>
      </div>
      {/*Atelier Context Sidebar / Monograph Rubric (4 Cols)*/}
      <div className="lg:col-span-4 flex flex-col gap-6">
      {/*Mentor Guidance & Feedback Note*/}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline-sm text-[16px] font-semibold">E</span>
      <div>
      <span className="font-title-md text-title-md text-primary block leading-tight">Elena Rostova</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Principal Fellow Mentor</span>
      </div>
      </div>
      <span className="material-symbols-outlined text-secondary text-[22px]">format_quote</span>
      </div>
      <div className="p-5 rounded-2xl bg-surface-container-low text-on-surface space-y-3">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-secondary font-semibold block">Critique Note • 08:30 AM Today</span>
      <p className="font-display italic text-[17px] leading-relaxed text-primary">
                  “Julian’s velocity on Raft election is exceptional. The formal proof was rigorously handled. Focus remaining effort squarely on log compaction before tackling secondary IPC benches.”
                </p>
      </div>
      <div className="space-y-3 pt-2">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant block">Action Items Assigned</span>
      <ul className="space-y-2 text-body-sm font-body-sm text-on-surface-variant">
      <li className="flex items-start gap-2">
      <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">arrow_forward</span>
      <span>Finalize memory snapshot boundaries in RingBuffer.</span>
      </li>
      <li className="flex items-start gap-2">
      <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">arrow_forward</span>
      <span>Submit telemetry graph for Dr. Sterling’s 14:00 review.</span>
      </li>
      </ul>
      </div>
      </div>
      {/*Rubric Calibration Levels breakdown card*/}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
      <h3 className="font-headline-sm text-headline-sm text-primary">Rubric Calibration</h3>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant">Norm v4.2</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Standardized evaluation matrix governing XP allocation and fellowship monograph credits.</p>
      <div className="space-y-3">
      {/*Level S*/}
      <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-title-md flex items-center justify-center font-bold">S</span>
      <div>
      <span className="font-title-md text-title-md text-primary block leading-tight">Exemplary</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Flawless proofs &amp; zero defects</span>
      </div>
      </div>
      <span className="font-title-md text-title-md text-secondary font-bold">100% XP</span>
      </div>
      {/*Level A*/}
      <div className="p-3.5 rounded-2xl bg-surface-container-high/60 flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-title-md flex items-center justify-center font-bold">A</span>
      <div>
      <span className="font-title-md text-title-md text-primary block leading-tight">Architectural</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Spec conforming, test audited</span>
      </div>
      </div>
      <span className="font-title-md text-title-md text-secondary font-bold">85% XP</span>
      </div>
      {/*Level B*/}
      <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
      <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant font-title-md flex items-center justify-center font-bold">B</span>
      <div>
      <span className="font-title-md text-title-md text-primary block leading-tight">Functional</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Core passes, minor edge variance</span>
      </div>
      </div>
      <span className="font-title-md text-title-md text-on-surface-variant font-bold">70% XP</span>
      </div>
      </div>
      {/*Weekly Summary CTA*/}
      <div className="pt-2">
      <button className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md flex items-center justify-center gap-2 shadow-sm transition-all" type="button">
      <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
      <span>Request Sprint Evaluation</span>
      </button>
      </div>
      </div>
      {/*Cohort Fellowship Ranking Snapshot*/}
      <div className="bg-surface-container-low rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-wider text-on-surface-variant font-semibold">Cohort Standings</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">Fellows 2025</span>
      </div>
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-title-md font-semibold">
                    03
                  </div>
      <div>
      <span className="font-title-md text-title-md text-primary block leading-tight">Julian S.</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">8,450 Cumulative XP</span>
      </div>
      </div>
      <span className="px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-xs-caps text-label-xs-caps uppercase font-bold tracking-wider">Top 5%</span>
      </div>
      </div>
      </div>
      </div>
    </div>
  )
}
