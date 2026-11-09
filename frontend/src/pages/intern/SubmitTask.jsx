import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { taskService, submissionService } from '../../services/api.js'
import { MOCK_TASKS } from '../../mock/mockData.js'

export default function SubmitTask() {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [resolvedTaskId, setResolvedTaskId] = useState(taskId)

  const [repoUrl, setRepoUrl] = useState('https://github.com/tasknest/julian-vance/raft-election')
  const [liveUrl, setLiveUrl] = useState('https://raft-election.julianvance.tasknest.org')
  const [notes, setNotes] = useState(
    'Election timeouts randomized in the [150ms, 300ms] band. Monograph drafts bound in the artifact bundle alongside benchmark telemetry and fuzz corpora. All 34 automated unit test scenarios passed.'
  )
  const [checkPassed, setCheckPassed] = useState(true)
  const [checkStyle, setCheckStyle] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function resolveTargetTask() {
      // If taskId is 24-hex characters, fetch it directly
      if (taskId && /^[0-9a-fA-F]{24}$/.test(taskId)) {
        try {
          const res = await taskService.get(taskId)
          if (res?.task) {
            setTask(res.task)
            setResolvedTaskId(res.task._id)
            return
          }
        } catch (e) {
          console.warn('[SubmitTask] get task error:', e.message)
        }
      }

      // If mock taskId or not found, try to fetch first active task from API
      try {
        const res = await taskService.list()
        if (res?.tasks && res.tasks.length > 0) {
          const matching = res.tasks.find((t) => t._id === taskId) || res.tasks[0]
          setTask(matching)
          setResolvedTaskId(matching._id)
          return
        }
      } catch (e) {
        // Fallback to mock
      }

      const mock = MOCK_TASKS.find((t) => t.id === taskId) || MOCK_TASKS[0]
      setTask(mock)
    }

    resolveTargetTask()
  }, [taskId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim() || !notes.trim()) {
      setError('Please provide a valid repository URL and submission monograph summary.')
      return
    }
    if (!checkPassed || !checkStyle) {
      setError('Please confirm all pre-submission verification checks.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // If we have a valid 24-character ObjectId, call the real API
      if (resolvedTaskId && /^[0-9a-fA-F]{24}$/.test(resolvedTaskId)) {
        await submissionService.create({
          taskId: resolvedTaskId,
          repoUrl: repoUrl.trim(),
          liveUrl: liveUrl.trim(),
          notes: notes.trim()
        })
      }
      setSuccess(true)
      setTimeout(() => {
        navigate('/intern/submissions')
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to dispatch submission.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTask = task || MOCK_TASKS[0]
  const taskCode = selectedTask._id ? `SPEC-${selectedTask._id.slice(-4).toUpperCase()}` : selectedTask.code || 'SPEC-0841'

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/intern/daily-tasks"
              className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold hover:underline"
            >
              Assigned Tasks
            </Link>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
              Dispatch Verification
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Submit Deliverable
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Dispatch your implementation bundle, live demo links, and formal monograph notes for faculty peer review and XP evaluation.
          </p>
        </div>

        <Link
          to="/intern/daily-tasks"
          className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors self-start lg:self-end"
        >
          Back to Tasks
        </Link>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Deliverable dispatched to review queue! Redirecting to My Submissions...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Submission Form */}
        <div className="lg:col-span-8 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div>
              <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
                Target Task // {taskCode}
              </span>
              <h3 className="font-headline-sm text-xl text-primary font-medium mt-0.5">
                {selectedTask.title}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-xs font-semibold uppercase">
              +{selectedTask.points} XP Available
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Repo URL */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                GitHub Repository / Branch URL *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  code
                </span>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-mono"
                  placeholder="https://github.com/organization/repo/tree/branch"
                  required
                />
              </div>
            </div>

            {/* Live Demo URL */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Live Deployment or Benchmark Report (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  link
                </span>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-mono"
                  placeholder="https://your-deployment-url.tasknest.org"
                />
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Monograph Notes &amp; Verification Proof *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-2xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                placeholder="Summarize your implementation decisions, algorithmic complexities, and testing results..."
                required
              />
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-2xl bg-surface-container-low space-y-3 border border-outline-variant/20">
              <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold block">
                Pre-Dispatch Verification Criteria
              </span>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkPassed}
                  onChange={(e) => setCheckPassed(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                />
                <span className="text-xs text-on-surface">
                  Automated test suites passed locally with zero regression failures.
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkStyle}
                  onChange={(e) => setCheckStyle(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                />
                <span className="text-xs text-on-surface">
                  Monograph documentation formatted according to TaskNest Styleguide v2.4.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-title-md text-sm hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Packaging Verification Bundle...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Dispatch Submission for Review</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Rubric Guidelines & Instructions Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Evaluation Criteria</h3>
            <p className="text-xs text-on-surface-variant">
              Faculty will evaluate this submission against the following rubric:
            </p>

            <div className="space-y-2.5">
              {selectedTask.rubric?.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container-low text-xs flex justify-between items-center">
                  <span className="text-on-surface">{r.criterion}</span>
                  <span className="font-bold text-secondary font-mono">+{r.maxPoints} XP</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Standard SLA Review</span>
              <span className="font-semibold text-primary">~2.4h Turnaround</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
