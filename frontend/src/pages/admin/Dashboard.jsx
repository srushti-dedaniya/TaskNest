import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { submissionService, taskService, reminderService } from '../../services/api.js'

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [deadlineOverview, setDeadlineOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setLoadError('')
        const [subRes, taskRes, statsRes, deadRes] = await Promise.allSettled([
          submissionService.list(),
          taskService.list(),
          taskService.stats(),
          reminderService.getOverview()
        ])

        setSubmissions(
          subRes.status === 'fulfilled' ? subRes.value?.submissions ?? [] : []
        )
        setTasks(taskRes.status === 'fulfilled' ? taskRes.value?.tasks ?? [] : [])
        setStats(statsRes.status === 'fulfilled' ? statsRes.value ?? null : null)
        setDeadlineOverview(deadRes.status === 'fulfilled' ? deadRes.value?.overview ?? null : null)

        const rejected = [subRes, taskRes, statsRes].filter((r) => r.status === 'rejected')
        if (rejected.length === 3) {
          setLoadError('Could not load dashboard data. Is the backend running?')
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pendingReviews = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review' || s.status === 'Under Review' || s.status === 'Pending'
  )

  // Chart: cumulative XP awarded to the cohort over time (from approved reviews)
  const velocityChartData = (() => {
    const approved = submissions
      .filter((s) => s.status === 'approved' && s.review?.pointsAwarded != null)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    let cum = 0
    const chart = approved.map((s) => {
      cum += s.review.pointsAwarded
      return {
        date: new Date(s.submittedAt || Date.now()).toLocaleDateString(),
        awarded: s.review.pointsAwarded,
        cumulative: cum
      }
    })
    return chart.length > 0 ? chart : [{ date: 'No awards yet', cumulative: 0 }]
  })()

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Faculty Dashboard
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Faculty Overview
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            {stats?.interns ?? 0} Interns active · {tasks.length} tasks assigned. Review submissions and track intern progress.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/tasks/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>Assign Task</span>
          </Link>
          <Link
            to="/admin/submissions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-sm hover:bg-surface-container-highest transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>Submissions ({pendingReviews.length})</span>
          </Link>
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-sm hover:bg-surface-container-highest transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span>Profile</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-sm hover:bg-surface-container-highest transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </Link>
        </div>
      </section>

      {loadError && (
        <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{loadError}</span>
        </div>
      )}

      {/* Stats Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider font-semibold">
              Active Tasks
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">assignment</span>
          </div>
          <div className="font-display text-4xl text-primary font-medium tracking-tight">
            {tasks.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-secondary font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>Assigned across interns</span>
          </div>
        </div>

        <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider font-semibold">
              Pending Reviews
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">hourglass_empty</span>
          </div>
          <div className="font-display text-4xl text-primary font-medium tracking-tight">
            {pendingReviews.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-on-surface-variant">
            <span>Awaiting review</span>
          </div>
        </div>

        <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider font-semibold">
              Approval Rate
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="font-display text-4xl text-primary font-medium tracking-tight">
            {submissions.length > 0
              ? `${Math.round((submissions.filter((s) => s.status === 'approved').length / submissions.length) * 100)}%`
              : '100%'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-on-surface-variant">
            <span>Submissions approved</span>
          </div>
        </div>

        <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider font-semibold">
              Interns Active
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
          </div>
          <div className="font-display text-4xl text-primary font-medium tracking-tight">
            {stats?.interns ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-on-surface-variant">
            <span>Registered Interns</span>
          </div>
        </div>
      </section>

      {/* Deadline & Overdue Monitoring Section */}
      <section className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary text-xl">alarm</span>
              <h3 className="font-headline-sm text-xl text-primary font-medium">
                Deadline &amp; Overdue Monitoring
              </h3>
              {(deadlineOverview?.overdueCount || 0) > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container animate-pulse">
                  {deadlineOverview.overdueCount} Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              Live tracking of upcoming deadlines and interns with pending deliverables.
            </p>
          </div>
          <Link
            to="/admin/tasks"
            className="text-xs text-secondary hover:underline font-label-md shrink-0 flex items-center gap-1"
          >
            <span>Manage All Tasks</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Overdue Tasks with Pending Interns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-error flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error" />
                Overdue Tasks ({deadlineOverview?.overdueTasks?.length || 0})
              </h4>
              <span className="text-[11px] text-on-surface-variant">
                Unsubmitted work
              </span>
            </div>

            {(!deadlineOverview?.overdueTasks || deadlineOverview.overdueTasks.length === 0) ? (
              <div className="p-6 rounded-2xl bg-surface-container-low text-center border border-outline-variant/20 text-xs text-on-surface-variant">
                ✓ No overdue tasks. All deadlines are on track!
              </div>
            ) : (
              <div className="space-y-3">
                {deadlineOverview.overdueTasks.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="p-4 rounded-2xl border border-error/30 bg-[#fff8f8] flex flex-col gap-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                            OVERDUE
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {t.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          Deadline was {new Date(t.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Link
                        to={`/admin/tasks`}
                        className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-medium hover:bg-primary-container shrink-0"
                      >
                        Inspect
                      </Link>
                    </div>

                    {/* Unsubmitted Interns List */}
                    <div className="pt-2 border-t border-error/15">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider block mb-1.5">
                        Interns pending submission ({t.unsubmittedInterns?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.unsubmittedInterns?.map((a, idx) => {
                          const intern = a.intern
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-error/25 text-xs text-primary shadow-2xs"
                            >
                              <span className="font-medium">{intern?.name || 'Intern'}</span>
                              <span className="text-[10px] text-error font-semibold">({a.status})</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Approaching Deadlines (< 24h) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Approaching Deadlines &lt; 24h ({deadlineOverview?.approachingTasks?.length || 0})
              </h4>
              <span className="text-[11px] text-on-surface-variant">
                Due soon
              </span>
            </div>

            {(!deadlineOverview?.approachingTasks || deadlineOverview.approachingTasks.length === 0) ? (
              <div className="p-6 rounded-2xl bg-surface-container-low text-center border border-outline-variant/20 text-xs text-on-surface-variant">
                No tasks due in the next 24 hours.
              </div>
            ) : (
              <div className="space-y-3">
                {deadlineOverview.approachingTasks.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="p-4 rounded-2xl border border-secondary/30 bg-surface-bright flex flex-col gap-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">
                            DUE SOON
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {t.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          Deadline: {new Date(t.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Link
                        to={`/admin/tasks`}
                        className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-medium hover:bg-primary-container shrink-0"
                      >
                        View
                      </Link>
                    </div>

                    {/* Intern Progress */}
                    <div className="pt-2 border-t border-outline-variant/15">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider block mb-1.5">
                        Assigned Interns Status:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(t.assignments || []).map((a, idx) => {
                          const intern = a.intern
                          const isDone = a.status === 'completed'
                          const isSub = a.status === 'submitted'
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${
                                isDone
                                  ? 'bg-[#f0f9f0] border-green-300 text-green-800'
                                  : isSub
                                  ? 'bg-secondary-container border-[#e3c0a0] text-on-secondary-container'
                                  : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                              }`}
                            >
                              <span className="font-medium">{intern?.name || 'Intern'}</span>
                              <span className="text-[10px] opacity-80">({a.status})</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Middle Grid: Recharts Velocity Chart + Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recharts Chart: Cohort XP Cadence */}
        <div className="lg:col-span-7 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-secondary font-semibold">
                Cohort Analytics
              </span>
              <h3 className="font-headline-sm text-xl text-primary font-medium mt-0.5">
                Weekly Velocity &amp; Awarded XP
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container font-label-xs-caps text-xs text-on-surface-variant uppercase">
              Last 5 Sprints
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityChartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#74593f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#74593f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe1d3" />
                <XAxis dataKey="date" stroke="#7a776e" fontSize={12} />
                <YAxis stroke="#7a776e" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff8f2',
                    borderColor: '#cbc6bc',
                    borderRadius: '1rem',
                    fontFamily: 'Manrope',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#74593f"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                  name="Cumulative XP Awarded"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Review Queue */}
        <div className="lg:col-span-5 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-secondary font-semibold">
                  Awaiting Review
                </span>
                <h3 className="font-headline-sm text-xl text-primary font-medium mt-0.5">
                  Recent Submissions
                </h3>
              </div>
              <Link
                to="/admin/submissions"
                className="text-xs text-secondary hover:underline font-label-md"
              >
                View all ↗
              </Link>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant">
                Queue is clear. No submissions awaiting review.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20 space-y-3">
                {pendingReviews.slice(0, 4).map((sub) => {
                  const id = sub._id || sub.id
                  const code = sub.task?.code || sub.taskCode || `TASK-${(id || '').slice(-4).toUpperCase()}`
                  const title = sub.task?.title || sub.taskTitle || 'Task'
                  const internName = sub.intern?.name || sub.internName || 'Intern'
                  return (
                    <div key={id} className="pt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                            {code}
                          </span>
                          <span className="text-xs font-semibold text-primary truncate">
                            {internName}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-1">{title}</p>
                        <p className="text-[11px] text-outline mt-0.5">
                          Submitted {new Date(sub.submittedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/admin/submissions/${id}/review`}
                        className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-label-md hover:bg-primary-container shrink-0 transition-colors shadow-xs"
                      >
                        Review
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Faculty Review Progress</span>
            <span className="font-mono text-secondary font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
