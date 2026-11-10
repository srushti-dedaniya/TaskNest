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
    'Great implementation! Code is clean, tests pass successfully, and the requirements are well satisfied.'
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
      setEvalError('Feedback must be at least 5 characters.')
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
          ? `Submission approved! ${pointsAwarded} points awarded to intern.`
          : 'Submission rejected. Feedback returned to intern.'
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

  const internName = submission?.intern?.name || 'Intern'
  const internEmail = submission?.intern?.email || ''
  const taskTitle = submission?.task?.title || 'Assigned Task'
  const taskCode = submission?.task?.code || `TASK-${(submission?.task?._id || submission?._id || '0841').slice(-4).toUpperCase()}`
  const repoUrl = submission?.repoUrl || submission?.githubUrl || ''
  const liveUrl = submission?.liveUrl || ''
  const notes = submission?.notes || 'No submission notes provided.'
  const alreadyEvaluated = submission?.status === 'approved' || submission?.status === 'rejected'

  return (
    <div className="space-y-8">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6">
        {/* Feedback Alerts */}
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
        {fetchError && (
          <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-error">error</span>
            <span>{fetchError}</span>
          </div>
        )}
        {alreadyEvaluated && (
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <span className="font-semibold text-primary">
                Review recorded ({submission.status.toUpperCase()}) — {submission.review?.pointsAwarded ?? 0} Points Awarded.
              </span>
            </div>
            <Link to="/admin/submissions" className="text-secondary font-label-xs-caps uppercase text-xs hover:underline">
              Back to Submissions →
            </Link>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2 font-label-xs-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
            <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="text-outline-variant">/</span>
            <Link to="/admin/submissions" className="hover:text-primary transition-colors">Submissions</Link>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">Review Submission</span>
            <span className="text-outline-variant">/</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-xs-caps">{taskCode}</span>
          </div>
        </div>

        {/* Title Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-outline-variant/30">
          <div className="max-w-3xl">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Faculty Review Portal
            </span>
            <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight mt-1 mb-2 font-medium">
              Review Submission
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Review the intern's work, inspect repository and live demo links, provide constructive feedback, and award points.
            </p>
          </div>
        </div>

        {/* Main Workspace Two-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Intern Submission Details (col-7) */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            {/* 1. Intern & Task Overview */}
            <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-secondary-container text-on-secondary-container font-headline-sm text-lg flex items-center justify-center font-bold">
                    {internName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-title-lg text-base md:text-lg text-primary font-semibold">{internName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-[10px] uppercase font-semibold">
                        Intern
                      </span>
                      {internEmail && (
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-xs">
                          {internEmail}
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1">Submitted for Faculty Review</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>
                    {submission?.submittedAt ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}` : 'Submitted'}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 bg-surface-container-low rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-xs-caps text-xs uppercase text-secondary font-semibold tracking-wider">
                    Task // {taskCode}
                  </span>
                  <span className="font-label-xs-caps text-xs text-on-surface-variant uppercase font-mono font-medium">
                    Max Points: {maxPoints}
                  </span>
                </div>
                <h3 className="font-headline-sm text-lg text-primary font-semibold">
                  {taskTitle}
                </h3>

                {/* Links */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {repoUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-bright text-on-surface text-xs hover:bg-surface-container-high transition-all shadow-xs border border-outline-variant/30"
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="material-symbols-outlined text-[16px]">code</span>
                      <span>Repository Link</span>
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_outward</span>
                    </a>
                  )}
                  {liveUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-bright text-on-surface text-xs hover:bg-surface-container-high transition-all shadow-xs border border-outline-variant/30"
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      <span>Live Demo</span>
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_outward</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Intern Submission Notes */}
            <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20">
              <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[20px]">description</span>
                <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Intern Submission Notes
                </span>
              </div>
              <div className="mt-4 p-4 bg-surface-container-low rounded-2xl">
                <p className="font-body-md text-sm text-primary leading-relaxed whitespace-pre-wrap">
                  {notes}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Grading & Feedback (col-5) */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 sticky top-24">
              {/* Grade Tier Selection */}
              <div className="pb-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                    Review Grade
                  </span>
                  <span className="text-xs text-on-surface-variant">Sets points &amp; decision</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setDecision('approved'); setPointsAwarded(maxPoints); }}
                    className={`flex flex-col gap-1 p-3.5 rounded-2xl transition-all text-left border ${
                      decision === 'approved' && pointsAwarded === maxPoints
                        ? 'bg-secondary-container/60 border-secondary/40 shadow-xs'
                        : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">workspace_premium</span>
                    <span className="font-title-md text-sm font-semibold text-on-surface">Full Marks</span>
                    <span className="text-xs text-on-surface-variant">{maxPoints} Pts (100%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDecision('approved'); setPointsAwarded(Math.round(maxPoints * 0.85)); }}
                    className={`flex flex-col gap-1 p-3.5 rounded-2xl transition-all text-left border ${
                      decision === 'approved' && pointsAwarded === Math.round(maxPoints * 0.85)
                        ? 'bg-secondary-container/60 border-secondary/40 shadow-xs'
                        : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">grade</span>
                    <span className="font-title-md text-sm font-semibold text-on-surface">Very Good</span>
                    <span className="text-xs text-on-surface-variant">{Math.round(maxPoints * 0.85)} Pts (85%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDecision('approved'); setPointsAwarded(Math.round(maxPoints * 0.6)); }}
                    className={`flex flex-col gap-1 p-3.5 rounded-2xl transition-all text-left border ${
                      decision === 'approved' && pointsAwarded === Math.round(maxPoints * 0.6)
                        ? 'bg-secondary-container/60 border-secondary/40 shadow-xs'
                        : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">task_alt</span>
                    <span className="font-title-md text-sm font-semibold text-on-surface">Satisfactory</span>
                    <span className="text-xs text-on-surface-variant">{Math.round(maxPoints * 0.6)} Pts (60%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDecision('rejected'); setPointsAwarded(0); }}
                    className={`flex flex-col gap-1 p-3.5 rounded-2xl transition-all text-left border ${
                      decision === 'rejected'
                        ? 'bg-error-container/40 border-error/40 shadow-xs'
                        : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-error">sync_problem</span>
                    <span className="font-title-md text-sm font-semibold text-on-surface">Needs Revisions</span>
                    <span className="text-xs text-error font-medium">Reject (0 Pts)</span>
                  </button>
                </div>
              </div>

              {/* Points Slider */}
              <div className="py-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                    Awarded Points
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-sm text-lg font-bold text-primary">
                      {decision === 'rejected' ? 0 : pointsAwarded}
                    </span>
                    <span className="font-label-md text-xs text-on-surface-variant uppercase">/ {maxPoints} Pts</span>
                  </div>
                </div>
                <input
                  className="w-full h-2 rounded-full bg-surface-container-high appearance-none cursor-pointer accent-primary"
                  max={maxPoints}
                  min="0"
                  step="5"
                  type="range"
                  disabled={decision === 'rejected'}
                  value={decision === 'rejected' ? 0 : pointsAwarded}
                  onChange={(e) => setPointsAwarded(Number(e.target.value))}
                />
                <div className="flex justify-between mt-1 text-[11px] text-on-surface-variant">
                  <span>0 Pts</span>
                  <span>{Math.round(maxPoints / 2)} Pts</span>
                  <span>{maxPoints} Pts</span>
                </div>
              </div>

              {/* Feedback Editor */}
              <div className="py-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                    Feedback for Intern
                  </span>
                  <span className="text-xs text-on-surface-variant">Min 5 characters</span>
                </div>
                <textarea
                  className="w-full resize-none h-28 p-3 bg-surface-container-low rounded-2xl text-on-surface placeholder:text-outline-variant text-sm focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all border border-outline-variant/30"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write helpful feedback and guidance for the intern..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting || alreadyEvaluated}
                  onClick={() => handleEvaluate('approved')}
                  className="flex-1 py-3 px-4 rounded-full bg-primary text-on-primary font-label-md text-xs hover:bg-primary-container hover:text-on-primary-container transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 font-semibold"
                >
                  {submitting && decision === 'approved' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Approve ({pointsAwarded} Pts)</span>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting || alreadyEvaluated}
                  onClick={() => handleEvaluate('rejected')}
                  className="flex-1 py-3 px-4 rounded-full text-xs font-label-md bg-surface-container text-error hover:bg-error-container/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-semibold border border-error/20"
                >
                  {submitting && decision === 'rejected' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reject</span>
                      <span className="material-symbols-outlined text-[16px]">block</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
