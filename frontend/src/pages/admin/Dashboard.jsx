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
import { submissionService, taskService } from '../../services/api.js'

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setLoadError('')
        const [subRes, taskRes, statsRes] = await Promise.allSettled([
          submissionService.list(),
          taskService.list(),
          taskService.stats()
        ])

        setSubmissions(
          subRes.status === 'fulfilled' ? subRes.value?.submissions ?? [] : []
        )
        setTasks(taskRes.status === 'fulfilled' ? taskRes.value?.tasks ?? [] : [])
        setStats(statsRes.status === 'fulfilled' ? statsRes.value ?? null : null)

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
