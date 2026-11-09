import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { taskService } from '../../services/api.js'

export default function AdminTaskDetails() {
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await taskService.get(taskId)
        setTask(res.task)
        setSubmissions(res.submissions || [])
      } catch (err) {
        setError(err.message || 'Failed to retrieve task dossier.')
      } finally {
        setLoading(false)
      }
    }
    if (taskId) {
      load()
    }
  }, [taskId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
          progress_activity
        </span>
        <p className="font-label-xs-caps text-xs uppercase tracking-widest text-on-surface-variant">
          Retrieving Task Specification...
        </p>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>
        <h2 className="font-headline-sm text-2xl text-primary">Task Not Found</h2>
        <p className="text-sm text-on-surface-variant">{error || 'Unable to locate this task in the registry.'}</p>
        <Link
          to="/admin/tasks"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Registry</span>
        </Link>
      </div>
    )
  }

  const priorityTones = {
    high: 'bg-rose-100 text-rose-800 border-rose-200',
    medium: 'bg-amber-100 text-amber-900 border-amber-200',
    low: 'bg-surface-container-high text-on-surface-variant'
  }

  const assignedFellows = task.assignment?.interns || []
  const deadlineStr = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'No deadline set'

  const submittedCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length
  const approvedCount = submissions.filter((s) => s.status === 'approved').length
  const totalSubs = submissions.length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-space-xs font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-widest">
          <Link to="/admin/tasks" className="hover:text-on-surface transition-colors">
            Task Registry
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">
            {task._id ? `Task #${task._id.slice(-6).toUpperCase()}` : 'Task Detail'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-[0.2em] text-secondary font-semibold">
              Registry Index // {task.type === 'weekly' ? 'Weekly Milestone' : 'Daily Sprint'}
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 mb-2">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="px-space-sm py-1 rounded-full font-label-xs-caps text-label-xs-caps uppercase bg-secondary-container text-on-secondary-container">
                {task.type} Task
              </span>
              <span className={`px-space-sm py-1 rounded-full font-label-xs-caps text-label-xs-caps uppercase border ${priorityTones[task.priority] || priorityTones.medium}`}>
                {task.priority || 'Medium'} Priority
              </span>
              <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase">
                {task.points} XP Available
              </span>
              <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase">
                Deadline: {deadlineStr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm self-start lg:self-end">
            <Link
              to="/admin/tasks"
              className="flex items-center gap-1.5 px-space-md py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Tasks</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <div className="xl:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30">
              <div className="flex items-center gap-2 pb-space-md border-b border-outline-variant/20 mb-4">
                <span className="material-symbols-outlined text-secondary text-[20px]">article</span>
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                  Task Specification & Objectives
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>

              {task.instructions && (
                <div className="mt-space-md pt-space-md border-t border-outline-variant/20">
                  <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold block mb-2">
                    Execution Instructions
                  </span>
                  <div className="font-body-md text-body-md text-on-surface whitespace-pre-wrap bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                    {task.instructions}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30">
              <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">group</span>
                  <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                    Assigned Fellows ({assignedFellows.length})
                  </span>
                </div>
                <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">
                  {task.assignment?.mode === 'all' ? 'Assigned to All Interns' : 'Targeted Assignment'}
                </span>
              </div>

              {assignedFellows.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-4">
                  {task.assignment?.mode === 'all'
                    ? 'Assigned to all active fellows in the enclave.'
                    : 'No specific fellows directly assigned.'}
                </p>
              ) : (
                <div className="divide-y divide-surface-container-high">
                  {assignedFellows.map((fellow) => (
                    <div
                      key={fellow._id}
                      className="flex items-center justify-between gap-space-md py-space-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-headline-sm text-xs flex items-center justify-center font-bold">
                          {fellow.name ? fellow.name.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-title-md text-title-md text-on-surface truncate">
                            {fellow.name}
                          </div>
                          <div className="font-label-xs-caps text-label-xs-caps lowercase text-on-surface-variant font-mono">
                            {fellow.email}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/admin/interns/${fellow._id}`}
                        className="text-xs text-secondary hover:text-primary font-semibold font-label-xs-caps uppercase"
                      >
                        Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-primary text-on-primary rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)]">
              <div className="flex items-center justify-between pb-space-md">
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-80">
                  Submission Progress
                </span>
                <span className="material-symbols-outlined text-[20px] opacity-70">
                  stacked_bar_chart
                </span>
              </div>
              <div className="grid grid-cols-3 gap-space-sm">
                <div className="bg-primary-container/60 rounded-2xl p-space-md">
                  <div className="font-headline-sm text-headline-sm tracking-tight">{totalSubs}</div>
                  <div className="font-label-xs-caps text-label-xs-caps uppercase opacity-75 mt-0.5">
                    Total
                  </div>
                </div>
                <div className="bg-primary-container/60 rounded-2xl p-space-md">
                  <div className="font-headline-sm text-headline-sm tracking-tight">{approvedCount}</div>
                  <div className="font-label-xs-caps text-label-xs-caps uppercase opacity-75 mt-0.5">
                    Approved
                  </div>
                </div>
                <div className="bg-primary-container/60 rounded-2xl p-space-md">
                  <div className="font-headline-sm text-headline-sm tracking-tight">{submittedCount}</div>
                  <div className="font-label-xs-caps text-label-xs-caps uppercase opacity-75 mt-0.5">
                    Pending Review
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    rate_review
                  </span>
                  <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                    Submissions Bound to Task ({submissions.length})
                  </span>
                </div>
                <Link
                  to="/admin/submissions"
                  className="font-label-xs-caps text-xs text-secondary hover:text-primary uppercase"
                >
                  View All →
                </Link>
              </div>

              {submissions.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-space-sm py-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">
                      inbox
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-sm text-primary tracking-tight">
                    No Submissions Yet
                  </h4>
                  <p className="font-body-md text-xs text-on-surface-variant max-w-xs leading-relaxed">
                    Fellows have not yet dispatched submissions for this specific task.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-surface-container-high">
                  {submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate">
                          {sub.intern?.name || 'Fellow'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full uppercase font-label-xs-caps text-[10px] bg-secondary-container text-on-secondary-container">
                          {sub.status.replace('_', ' ')}
                        </span>
                        <Link
                          to={`/admin/submissions/${sub._id}/review`}
                          className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-[10px] font-semibold uppercase hover:bg-primary/90"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
