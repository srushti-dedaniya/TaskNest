import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { submissionService } from '../../services/api.js'

export default function EvaluateSubmission() {
  const { submissionId } = useParams()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [decision, setDecision] = useState('approved')
  const [pointsAwarded, setPointsAwarded] = useState(450)
  const [feedback, setFeedback] = useState(
    'Exemplary consensus invariants and deterministic partition test harnesses. Code is clippy-compliant with clean state transitions.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [evalSuccess, setEvalSuccess] = useState('')
  const [evalError, setEvalError] = useState('')

  useEffect(() => {
    async function load() {
      if (!submissionId || submissionId === 'sub-01') {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await submissionService.get(submissionId)
        if (res?.submission) {
          setSubmission(res.submission)
          const maxPts = res.submission.task?.points ?? 450
          setPointsAwarded(maxPts)
          if (res.submission.review) {
            setDecision(res.submission.review.decision)
            setFeedback(res.submission.review.feedback)
            setPointsAwarded(res.submission.review.pointsAwarded ?? maxPts)
          }
        }
      } catch (err) {
        setFetchError(err.message || 'Failed to retrieve submission.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [submissionId])

  const maxPoints = submission?.task?.points ?? 450

  const handleEvaluate = async (targetDecision) => {
    const activeDecision = targetDecision || decision
    if (!feedback.trim() || feedback.trim().length < 5) {
      setEvalError('Feedback critique must be at least 5 characters.')
      return
    }

    setSubmitting(true)
    setEvalError('')
    setEvalSuccess('')

    try {
      if (submissionId && /^[0-9a-fA-F]{24}$/.test(submissionId)) {
        await submissionService.evaluate(submissionId, {
          decision: activeDecision,
          feedback: feedback.trim(),
          pointsAwarded: activeDecision === 'approved' ? Number(pointsAwarded) : 0
        })
      }
      setEvalSuccess(
        activeDecision === 'approved'
          ? `Submission approved! ${pointsAwarded} XP awarded to candidate.`
          : 'Submission rejected. Feedback returned to fellow candidate.'
      )
      setTimeout(() => {
        navigate('/admin/submissions')
      }, 1500)
    } catch (err) {
      setEvalError(err.message || 'Failed to record evaluation.')
    } finally {
      setSubmitting(false)
    }
  }

  const internName = submission?.intern?.name || 'Julian Vance'
  const internEmail = submission?.intern?.email || 'j.vance@mit.edu'
  const taskTitle = submission?.task?.title || 'Implement Distributed Consensus Raft Election Protocol'
  const taskCode = submission?.task?.code || `SPEC-${(submission?.task?._id || submission?._id || '0841').slice(-4).toUpperCase()}`
  const repoUrl = submission?.repoUrl || submission?.githubUrl || 'https://github.com/tasknest/julian-vance/raft-election'
  const liveUrl = submission?.liveUrl || 'https://raft-election.julianvance.tasknest.org'
  const notes = submission?.notes || 'To mitigate split-vote divergence across high-latency asymmetric partitions, election timeouts are randomized uniformly within the interval of [150ms, 300ms] utilizing non-blocking tokio::time::sleep ticks.'
  const alreadyEvaluated = submission?.status === 'approved' || submission?.status === 'rejected'

  return (
    <div className="space-y-8">
      {/*Inner Page Architecture Context*/}
      <div className="w-full max-w-[1400px] mx-auto px-gutter py-space-md flex flex-col gap-space-lg">
      {/*Feedback Alerts*/}
      {evalSuccess && (
        <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
          <span>{evalSuccess}</span>
        </div>
      )}
      {evalError && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          <span>{evalError}</span>
        </div>
      )}
      {alreadyEvaluated && (
        <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            <span className="font-semibold text-primary">
              Attestation recorded ({submission.status.toUpperCase()}) — {submission.review?.pointsAwarded ?? 0} XP Awarded.
            </span>
          </div>
          <Link to="/admin/submissions" className="text-secondary font-label-xs-caps uppercase text-xs hover:underline">
            Back to Queue →
          </Link>
        </div>
      )}

      {/*Editorial Breadcrumb & Governance Tracker Bar*/}
      <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-xs">
      <div className="flex items-center gap-space-xs font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-widest">
      <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Studio</Link>
      <span className="text-outline-variant">/</span>
      <Link to="/admin/submissions" className="hover:text-primary transition-colors">Review Governance</Link>
      <span className="text-outline-variant">/</span>
      <span className="text-on-surface font-semibold">Evaluation Workbench</span>
      <span className="text-outline-variant">/</span>
      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-xs-caps">{taskCode}</span>
      </div>
      {/*SLA Deadline Pill Badge*/}
      <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-error-container/30 shadow-[0_2px_12px_rgba(186,26,26,0.06)]">
      <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
      </span>
      <span className="font-label-md text-label-md text-on-error-container font-medium tracking-normal">SLA Deadline: 1h 42m Remaining</span>
      <span className="px-space-xs py-0.5 rounded-full bg-error text-on-error font-label-xs-caps text-label-xs-caps uppercase">Urgent</span>
      </div>
      </div>
      {/*Editorial Monograph Evaluation Hero / Title Block*/}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-sm">
      <div className="max-w-3xl">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-[0.2em] text-secondary font-semibold">Faculty Verification Protocol // Crates Core</span>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 mb-2">Evaluate Deliverable &amp; Verify Monograph</h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Review automated test telemetry, assess formal mathematical proofs, and calibrate milestone XP attestation for core systems architecture fellows.
              </p>
      </div>
      {/*Quick Context Dossier Snapshot*/}
      <div className="flex items-center gap-space-md self-start lg:self-end">
      <div className="text-right">
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider">Evaluation Cycle</div>
      <div className="font-title-md text-title-md text-on-surface">Sprint 06 • Day 11</div>
      </div>
      <div className="h-9 w-px bg-surface-container-highest"></div>
      <div className="text-right">
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider">Reviewer Queue</div>
      <div className="font-title-md text-title-md text-on-surface">1 of 4 Assigned</div>
      </div>
      </div>
      </div>
      {/*Main Workspace Two-Column Architecture Grid*/}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
      {/*=========================================================================*/}
      {/*LEFT COLUMN: Candidate Submission, Thesis, & Telemetry Dossier (~60% = col-7)*/}
      {/*=========================================================================*/}
      <div className="xl:col-span-7 flex flex-col gap-space-lg">
      {/*1. Candidate & Specification Dossier Card*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md">
      <div className="flex items-start gap-space-md">
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-secondary-container text-on-secondary-container font-headline-sm text-xl flex items-center justify-center font-bold">
        {internName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
      <div className="flex items-center gap-space-xs flex-wrap">
      <h2 className="font-title-lg text-title-lg text-primary font-semibold">{internName}</h2>
      <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase">Fellow Candidate</span>
      <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps lowercase font-mono">{internEmail}</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Assigned Deliverable Verification Pass</p>
      </div>
      </div>
      <div className="flex items-center gap-space-xs">
      <span className="w-2 h-2 rounded-full bg-secondary"></span>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface uppercase tracking-wider">
        {submission?.submittedAt ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}` : 'Submitted'}
      </span>
      </div>
      </div>
      {/*Task Specification Details*/}
      <div className="mt-space-lg pt-space-md border-t-0 bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between gap-2">
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold tracking-wider">Task Specification // {taskCode}</span>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase font-mono">Max XP: {maxPoints}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight">
        {taskTitle}
      </h3>
      </div>
      {/*Deep Links to Git & Telemetry*/}
      <div className="mt-space-md pt-space-sm flex flex-wrap items-center gap-space-sm">
      {repoUrl && (
        <a className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/20" href={repoUrl} target="_blank" rel="noreferrer">
          <span className="material-symbols-outlined text-[16px]">code</span>
          <span>Inspect Code Repository</span>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_outward</span>
        </a>
      )}
      {liveUrl && (
        <a className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/20" href={liveUrl} target="_blank" rel="noreferrer">
          <span className="material-symbols-outlined text-[16px]">link</span>
          <span>Live Deployment</span>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_outward</span>
        </a>
      )}
      </div>
      </div>
      </div>
      {/*2. Monograph Implementation Thesis (Editorial Pull-Quote Style)*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] relative">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Candidate Deliverable Notes &amp; Monograph</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase font-semibold">Verified</span>
      </div>
      <div className="mt-space-sm relative pl-space-md bg-surface-container-low/60 p-space-md rounded-2xl">
      <div className="font-body-md text-body-md text-primary leading-relaxed whitespace-pre-wrap">
        {notes}
      </div>
      </div>
      </div>
      {/*3. Dynamic Systems Telemetry: CI/CD Pipeline Status Integrity*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center justify-between pb-space-md">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Verification Pipeline Telemetry</span>
      </div>
      <button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-all" title="Refresh Pipeline">
      <span className="material-symbols-outlined text-[16px]">refresh</span>
      <span>Rerun Hardware Checks</span>
      </button>
      </div>
      {/*Pipeline Card Grid*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      {/*CI Card 1: Cargo Check*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md transition-all hover:bg-surface-container">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-[20px] text-on-error-container">error</span>
      <span className="font-title-md text-title-md text-on-surface truncate">cargo check --all-features</span>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-error-container/60 text-on-error-container font-label-xs-caps text-label-xs-caps uppercase font-medium">Failed</span>
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider mb-space-xs">Last run: 142 min ago</div>
      <div className="bg-surface-container-lowest rounded-lg p-2.5 text-primary font-mono text-body-sm overflow-x-auto">
                        <span className="text-on-error-container">error[E0277]</span>: the trait bound `PubKey: Eq` is not satisfied<br />
                        <span className="text-secondary">-&gt;</span> crates/raft/src/identity.rs:188:12<br />
                        <span className="text-on-surface-variant">note:</span> candidate impl but requires `'static` lifetime guard
                      </div>
      <div className="text-primary font-mono text-body-sm mt-2 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">terminal</span>
                        cargo fix --bin ally-notice --allow-dirty
                      </div>
      </div>
      {/*CI Card 2: Clippy Lints*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md transition-all hover:bg-surface-container">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
      <span className="font-title-md text-title-md text-on-surface truncate">clippy --strict </span>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase font-medium">Passed</span>
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider mb-space-xs">Lints: 0 errors, 0 warnings</div>
      <div className="bg-surface-container-lowest rounded-lg p-2.5 text-primary font-mono text-body-sm">
                        <span className="text-secondary">warning:</span> unused variable `zk_commitment`<br />
                        <span className="text-on-surface-variant"> -&gt;</span> cryptofuzz/src/main.rs:42:5<br />
                        <span className="text-on-surface-variant">note:</span> #\[warn(unused_variables)\] on by default
                      </div>
      <div className="text-primary font-mono text-body-sm mt-2 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">key</span>
                        hint: prefix with underscore or bind implicitly
                      </div>
      </div>
      {/*CI Card 3: Miri UB*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md transition-all hover:bg-surface-container">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-[20px] text-secondary">shield</span>
      <span className="font-title-md text-title-md text-on-surface truncate">miri no-struct-update</span>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase font-medium">Passed</span>
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider mb-space-xs">Memory safety: 0 UB instances</div>
      <div className="bg-surface-container-lowest rounded-lg p-2.5 text-primary font-mono text-body-sm">
                        miri eval passed 10,000 op sequences<br />
                        <span className="text-on-surface-variant"> Op Range:</span> ring-buffer state transitions<br />
                        <span className="text-on-surface-variant"> Alignment check:</span> 8-byte aligned @ offset
                      </div>
      <div className="text-primary font-mono text-body-sm mt-2 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">memory</span>
                        memory zone: vec rotation on raft-log: buffer
                      </div>
      </div>
      {/*CI Card 4: Crypto Fuzz*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md transition-all hover:bg-surface-container">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-[20px] text-on-error-container">bug_report</span>
      <span className="font-title-md text-title-md text-on-surface truncate">cargo fuzz raft_vote secure</span>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-error-container/60 text-on-error-container font-label-xs-caps text-label-xs-caps uppercase font-medium">Failed</span>
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-wider mb-space-xs">Fuzz satisfaction: 98.4% match</div>
      <div className="bg-surface-container-lowest rounded-lg p-2.5 text-primary font-mono text-body-sm overflow-x-auto">
                        <span className="text-on-error-container">Fuzz fail case:</span> seed: 813247812312<br />
                        <span className="text-secondary">-&gt;</span> unexpected edge case in ballot_verif<br />
                        <span className="text-on-surface-variant">ret:</span> integer overflow on &gt; 5m\xff bal
                      </div>
      <div className="text-primary font-mono text-body-sm mt-2 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">replay</span>
                        cargo fuzz run raft -- -runs=100000
                      </div>
      </div>
      </div>
      {/*Benchmark Latency Visualizer Sparkline*/}
      <div className="mt-space-lg pt-space-md border-t-0 bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center justify-between gap-space-md mb-space-sm">
      <div className="flex flex-col">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Quorum Election Latency — Correlation [Timeout Tick]</span>
      <div className="font-body-sm text-body-sm text-on-surface mt-0.5">Max Peak: 410ms &nbsp;•&nbsp; P50: 148ms &nbsp;•&nbsp; P99: 388ms</div>
      </div>
      <button className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-xs-caps text-label-xs-caps uppercase hover:bg-surface-container-high transition-all" title="Expand benchmark history">
      <span>History</span>
      <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
      </div>
      <svg className="w-full h-20" fill="none" preserveAspectRatio="none" viewBox="0 0 600 80"><defs><linearGradient id="evalGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#74593f" stopOpacity="0.2"></stop><stop offset="1" stopColor="#74593f" stopOpacity="0"></stop></linearGradient></defs><path d="M0 60 C50 55, 80 40, 120 48 C160 56, 200 30, 240 35 C280 40, 320 20, 360 28 C400 36, 440 10, 480 25 C520 40, 560 55, 600 40 L600 80 L0 80 Z" fill="url(#evalGrad)"></path><path d="M0 60 C50 55, 80 40, 120 48 C160 56, 200 30, 240 35 C280 40, 320 20, 360 28 C400 36, 440 10, 480 25 C520 40, 560 55, 600 40" fill="none" stroke="#74593f" strokeWidth="2"></path><g fill="#74593f"><circle cx="480" cy="25" r="4"></circle></g><text fill="none" x="482" y="18" style={{ font: "400 10px 'Manrope', sans-serif", fill: "#74593f", letterSpacing: "-0.05em" }}>388ms</text></svg>
      </div>
      {/*4. Artifact Bundles & Reproduction Logs*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center justify-between pb-space-md">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">deployed_code_save</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Artifact Bundles &amp; Reproduced Logs</span>
      </div>
      <a className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold flex items-center gap-1 hover:underline" href="#">Download All Artifacts <span className="material-symbols-outlined text-[14px]">download</span></a>
      </div>
      <div className="divide-y divide-surface-container-high border-y-0">
      <button className="w-full flex items-center justify-between gap-space-md py-space-md transition-all hover:bg-surface-container-low group text-left">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">folder_zip</span>
      </div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface flex items-center gap-2 truncate">Build Log &amp; Diagnostics<span className=" px-1.5 py-0.5 rounded text-body-sm bg-surface-container-high text-on-surface-variant font-mono">.json</span></div>
      <div className="font-body-sm text-body-sm text-secondary truncate">rustc build diagnostics logs + trace nested span events</div>
      </div>
      </div>
      <div className="flex items-center gap-space-sm shrink-0">
      <span className="hidden sm:block font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">Posted 2h ago</span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-all">
      <span className="material-symbols-outlined text-[18px]">south_east</span>
      </div>
      </div>
      </button>
      <button className="w-full flex items-center justify-between gap-space-md py-space-md transition-all hover:bg-surface-container-low group text-left">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">folder_zip</span>
      </div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface flex items-center gap-2 truncate">Benchmark Suite Files<span className="px-1.5 py-0.5 rounded text-body-sm bg-surface-container-high text-on-surface-variant font-mono">.bin</span></div>
      <div className="font-body-sm text-body-sm text-secondary truncate">reproducible election benchmark harness compiled binaries</div>
      </div>
      </div>
      <div className="flex items-center gap-space-sm shrink-0">
      <span className="hidden sm:block font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">Posted 2h ago</span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-all">
      <span className="material-symbols-outlined text-[18px]">south_east</span>
      </div>
      </div>
      </button>
      <button className="w-full flex items-center justify-between gap-space-md py-space-md transition-all hover:bg-surface-container-low group text-left">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">folder_zip</span>
      </div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface flex items-center gap-2 truncate">Fuzz Corpus Regression<span className="px-1.5 py-0.5 rounded text-body-sm bg-surface-container-high text-on-surface-variant font-mono">.zip</span></div>
      <div className="font-body-sm text-body-sm text-secondary truncate">5,400 persisted partition simulation state corpora</div>
      </div>
      </div>
      <div className="flex items-center gap-space-sm shrink-0">
      <span className="hidden sm:block font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">Posted 1h ago</span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-all">
      <span className="material-symbols-outlined text-[18px]">south_east</span>
      </div>
      </div>
      </button>
      </div>
      </div>
      {/*5. Master Invariant & Attestation Checklist*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center justify-between pb-space-md">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">rule</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Evaluation Scope Invariants</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">4 of 6 Attested vs. Verified</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-sm">
      <div className="flex items-center gap-space-sm py-space-xs">
      <span className="material-symbols-outlined text-[20px] text-on-error-container">cancel</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold">Consensus Safety Lemma:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Failed Assessment</span>
      </div>
      <div className="flex items-center gap-space-sm py-space-xs">
      <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold">Asynchronous Partition Fuzz:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Strong Pass</span>
      </div>
      <div className="flex items-center gap-space-sm py-space-xs">
      <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold">Zero-Cost Abstractions:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Verified Monograph</span>
      </div>
      <div className="flex items-center gap-space-sm py-space-xs">
      <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold">Deterministic Benchmarking:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">P99 Physically Reproduce</span>
      </div>
      <div className="flex items-center gap-space-sm py-space-xs">
      <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold">Static Memory Contract:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Miri Certified</span>
      </div>
      <div className="flex items-center gap-space-sm py-space-xs opacity-70">
      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">hourglass_empty</span>
      <span className="font-body-md text-body-md text-on-surface-variant font-semibold">Low-Level Cryptographic Lead:</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant underline decoration-wavy decoration-secondary cursor-not-allowed">Awaiting KeyGen Proof</span>
      </div>
      </div>
      </div>
      </div>
      {/*====================================================*/}
      {/*RIGHT COLUMN: Grading Matrix, Calibrators, & Sign-off (~40% = col-5)*/}
      {/*====================================================*/}
      <div className="xl:col-span-5 flex flex-col gap-space-lg">
      {/*Evaluation Calibration Panel*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] sticky group/eval top-20">
      {/*Tiered Performance Ranking Scaling Selection*/}
      <div className="pb-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Attestation Grade Tier</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Calibrates XP weight &amp; decision</span>
      </div>
      <div className="grid grid-cols-2 gap-space-md pt-space-xs">
      <button
        type="button"
        onClick={() => { setDecision('approved'); setPointsAwarded(maxPoints); }}
        className={`eval-tier-btn flex flex-col gap-1 p-space-md rounded-2xl border-0 transition-all text-left ${
          decision === 'approved' && pointsAwarded === maxPoints ? 'bg-secondary-container shadow-sm border border-secondary/30' : 'bg-surface-container hover:bg-surface-container-high'
        }`}
        title="Outstanding: Exemplary craftsmanship"
      >
      <span className="material-symbols-outlined text-[20px] text-secondary">workspace_premium</span>
      <span className="font-title-md text-title-md text-on-surface">A+ Stellar</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{maxPoints} XP (100%)</span>
      </button>

      <button
        type="button"
        onClick={() => { setDecision('approved'); setPointsAwarded(Math.round(maxPoints * 0.85)); }}
        className={`eval-tier-btn flex flex-col gap-1 p-space-md rounded-2xl border-0 transition-all text-left ${
          decision === 'approved' && pointsAwarded < maxPoints && pointsAwarded > 0 ? 'bg-secondary-container shadow-sm border border-secondary/30' : 'bg-surface-container hover:bg-surface-container-high'
        }`}
        title="Excellent: High polish, minor gaps"
      >
      <span className="material-symbols-outlined text-[20px] text-secondary">grade</span>
      <span className="font-title-md text-title-md text-on-surface">A Excellent</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{Math.round(maxPoints * 0.85)} XP (85%)</span>
      </button>

      <button
        type="button"
        onClick={() => { setDecision('approved'); setPointsAwarded(Math.round(maxPoints * 0.6)); }}
        className={`eval-tier-btn flex flex-col gap-1 p-space-md rounded-2xl border-0 transition-all text-left ${
          decision === 'approved' && pointsAwarded === Math.round(maxPoints * 0.6) ? 'bg-secondary-container shadow-sm border border-secondary/30' : 'bg-surface-container hover:bg-surface-container-high'
        }`}
        title="Satisfactory: Requirements met"
      >
      <span className="material-symbols-outlined text-[20px] text-secondary">task_alt</span>
      <span className="font-title-md text-title-md text-on-surface">B Satisfactory</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{Math.round(maxPoints * 0.6)} XP (60%)</span>
      </button>

      <button
        type="button"
        onClick={() => { setDecision('rejected'); setPointsAwarded(0); }}
        className={`eval-tier-btn flex flex-col gap-1 p-space-md rounded-2xl border-0 transition-all text-left ${
          decision === 'rejected' ? 'bg-error-container/40 shadow-sm border border-error/30' : 'bg-surface-container hover:bg-surface-container-high'
        }`}
        title="Revision requested: Lacks key proofs"
      >
      <span className="material-symbols-outlined text-[20px] text-error">sync_problem</span>
      <span className="font-title-md text-title-md text-on-surface">Revisions</span>
      <span className="font-body-sm text-body-sm text-error font-medium">Reject (0 XP)</span>
      </button>
      </div>
      </div>
      {/*Divider*/}
      <div className="border-t border-dashed border-surface-container-highest my-space-md"></div>
      {/*Milestone XP Evaluation Kinetic Slider*/}
      <div className="pb-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Scale XP Award / TaskNest Milestone</span>
      <div className="flex items-baseline gap-1">
      <span className="font-headline-sm text-headline-sm text-primary tracking-tight" id="xp-counter">
        {decision === 'rejected' ? 0 : pointsAwarded}
      </span>
      <span className="font-label-md text-label-md text-on-surface-variant uppercase">/ {maxPoints} XP</span>
      </div>
      </div>
      <input
        className="w-full h-1.5 rounded-full bg-surface-container-highest appearance-none cursor-pointer accent-primary"
        id="xp-range"
        max={maxPoints}
        min="0"
        step="25"
        type="range"
        disabled={decision === 'rejected'}
        value={decision === 'rejected' ? 0 : pointsAwarded}
        onChange={(e) => setPointsAwarded(Number(e.target.value))}
      />
      <div className="flex justify-between mt-space-xs font-label-xs-caps text-label-xs-caps text-outline uppercase">
      <span>0 XP</span>
      <span>Fair Trim</span>
      <span>Optimal</span>
      <span>{maxPoints} XP</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm leading-relaxed">
        {decision === 'rejected'
          ? 'Rejection sets awarded XP to 0 and returns feedback to the fellow.'
          : 'XP values calibrate directly to the fellow’s profile rank and global fellowship leaderboard.'}
      </p>
      </div>
      {/*Divider*/}
      <div className="border-t border-dashed border-surface-container-highest my-space-md"></div>
      {/*Critique Editor*/}
      <div className="pb-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Verified Critique &amp; Marginalia</span>
      <span className="font-label-md text-label-md text-outline">Minimum 5 characters</span>
      </div>
      <textarea
        className="w-full resize-none h-32 p-space-md bg-surface-container-low rounded-2xl text-on-surface placeholder:text-outline-variant font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all border border-outline-variant/30"
        id="critique-text"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Address division of consensus weight, SLA latency trails, or monograph invariant counter-evidences..."
      ></textarea>
      </div>

      {/*Primary Action Deck For Ledger Dispatch*/}
      <div className="flex flex-col sm:flex-row gap-space-md">
      <button
        type="button"
        disabled={submitting || alreadyEvaluated}
        onClick={() => handleEvaluate('approved')}
        className="flex-1 py-3.5 px-space-lg rounded-2xl bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[0_4px_16px_-2px_rgba(53,51,45,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
        title="Allocate finalized ranking weight"
      >
        {submitting && decision === 'approved' ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span>Recording...</span>
          </>
        ) : (
          <>
            <span>Approve &amp; Award {pointsAwarded} XP</span>
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </>
        )}
      </button>
      <button
        type="button"
        disabled={submitting || alreadyEvaluated}
        onClick={() => handleEvaluate('rejected')}
        className="flex-1 py-3.5 px-space-lg rounded-2xl font-title-md border-0 text-title-md bg-surface-container text-on-error-container hover:bg-error-container/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        title="Clear and reject current submission"
      >
        {submitting && decision === 'rejected' ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span>Rejecting...</span>
          </>
        ) : (
          <>
            <span>Reject Submission</span>
            <span className="material-symbols-outlined text-[20px]">block</span>
          </>
        )}
      </button>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
    </div>
  )
}
