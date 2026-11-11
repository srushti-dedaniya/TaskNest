import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { taskService, submissionService, reminderService } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setLoadError('')
        const [taskRes, subRes, schedRes] = await Promise.allSettled([
          taskService.list(),
          submissionService.list(),
          reminderService.getMySchedule()
        ])

        setTasks(taskRes.status === 'fulfilled' ? taskRes.value?.tasks ?? [] : [])
        setSubmissions(subRes.status === 'fulfilled' ? subRes.value?.submissions ?? [] : [])
        setSchedule(schedRes.status === 'fulfilled' ? schedRes.value?.schedule ?? [] : [])

        if (taskRes.status === 'rejected' && subRes.status === 'rejected') {
          setLoadError('Could not load dashboard data. Is the backend running?')
        }
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const activeTasks = tasks.slice(0, 4)
  const approvedCount = submissions.filter((s) => s.status === 'approved' || s.status === 'Approved').length
  const totalXP = user?.points ?? 0

  function formatLocalTime(isoString) {
    if (!isoString) return 'No deadline'
    const d = new Date(isoString)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getTimeRemainingText(diffMs) {
    if (diffMs < 0) {
      const minsOver = Math.abs(Math.floor(diffMs / 60000))
      if (minsOver < 60) return `Overdue by ${minsOver}m`
      const hoursOver = Math.floor(minsOver / 60)
      return `Overdue by ${hoursOver}h`
    }
    const mins = Math.floor(diffMs / 60000)
    if (mins < 60) return `${mins}m left`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h left`
    const days = Math.floor(hours / 24)
    return `${days}d left`
  }

  // Active deadline alerts (exclude completed)
  const pendingDeadlines = schedule.filter((s) => s.status !== 'completed')
  const overdueOrUrgentCount = pendingDeadlines.filter(
    (s) => s.urgency === 'overdue' || s.urgency === 'critical' || s.label === 'Due in 1 Hour'
  ).length

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Intern Portal // Overview
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Intern Dashboard
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Active daily tasks, weekly milestone objectives, and faculty feedback for your internship.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <Link
            to="/intern/daily-tasks"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            <span>View All Daily Tasks</span>
          </Link>
        </div>
      </section>

      {loadError && (
        <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{loadError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8">
        {/* Left: Active Deliverables & Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Deadline Reminder Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">alarm</span>
                <h2 className="font-headline-sm text-xl text-primary font-medium">Deadline Reminders</h2>
                {overdueOrUrgentCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container animate-pulse">
                    {overdueOrUrgentCount} Urgent
                  </span>
                )}
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                Auto-updated in local time
              </span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-on-surface-variant text-xs flex items-center justify-center gap-2 bg-surface-bright rounded-2xl border border-outline-variant/20">
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                <span>Checking upcoming deadlines...</span>
              </div>
            ) : schedule.length === 0 ? (
              <div className="bg-surface-bright rounded-2xl p-6 text-center border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant">No tasks scheduled at this moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {schedule.map((item) => {
                  const isOverdue = item.urgency === 'overdue'
                  const is1H = item.urgency === 'critical' || item.label === 'Due in 1 Hour'
                  const isToday = item.label === 'Due Today'
                  const isTomorrow = item.label === 'Due Tomorrow'
                  const isCompleted = item.status === 'completed'
                  const isSubmitted = item.status === 'submitted'

                  const badgeStyle = isCompleted
                    ? 'bg-[#e8e2d7] text-[#49473f] border-[#cbc6bc]'
                    : isSubmitted
                    ? 'bg-secondary-container text-on-secondary-container border-[#e3c0a0]'
                    : isOverdue
                    ? 'bg-error-container text-on-error-container border-error/30 animate-pulse'
                    : is1H
                    ? 'bg-error-container text-on-error-container border-error/30 animate-pulse'
                    : isToday
                    ? 'bg-[#ffdcbd] text-[#5a422a] border-[#e3c0a0]'
                    : isTomorrow
                    ? 'bg-surface-container-high text-secondary border-outline-variant/30'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20'

                  return (
                    <div
                      key={item.taskId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                        isOverdue
                          ? 'bg-[#fff5f5] border-error/40'
                          : is1H
                          ? 'bg-[#fff9f4] border-secondary/60'
                          : 'bg-surface-bright border-outline-variant/25 hover:border-secondary/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
                            {item.label}
                          </span>
                          <span className="text-[11px] font-semibold text-on-surface-variant">
                            {isCompleted ? 'Done' : isSubmitted ? 'Submitted' : getTimeRemainingText(item.diffMs)}
                          </span>
                        </div>

                        <h4 className="font-title-md text-sm font-semibold text-primary line-clamp-1">
                          {item.title}
                        </h4>

                        <div className="mt-2 flex flex-col gap-1 text-[11px] text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-secondary">event</span>
                            <span><strong>Deadline:</strong> {formatLocalTime(item.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-outline">notifications_active</span>
                            <span>
                              <strong>Reminders:</strong>{' '}
                              {item.remindersSent?.length > 0
                                ? item.remindersSent
                                    .map((r) => r.replace('TASK_DEADLINE_', '').replace('TASK_', '').toLowerCase())
                                    .join(', ') + ' sent'
                                : 'Scheduled automatically'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-secondary">
                          +{item.points} XP Available
                        </span>
                        <Link
                          to={`/intern/tasks/${item.taskId}`}
                          className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-container transition-colors"
                        >
                          {isCompleted ? 'View Task' : isSubmitted ? 'View Submission' : 'Submit Task →'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Tasks Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-xl text-primary font-medium">Active Deliverables</h2>
                <span className="font-label-xs-caps text-xs uppercase bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-semibold">
                  {tasks.length} Available
                </span>
              </div>
              <Link to="/intern/daily-tasks" className="text-xs text-secondary hover:underline font-label-md">
                Browse All →
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Synchronizing Active Deliverables...</span>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="bg-surface-bright rounded-3xl p-12 text-center border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-4xl text-outline-variant">task</span>
                <h3 className="font-headline-sm text-lg text-primary mt-2">Zero open tasks</h3>
                <p className="text-xs text-on-surface-variant mt-1">All sprint deliverables have been submitted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((t) => {
                  const id = t._id || t.id
                  const code = t.code || `SPEC-${(t._id || id || '0842').slice(-4).toUpperCase()}`
                  const priority = t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium'
                  return (
                    <article
                      key={id}
                      className="group relative bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(53,51,45,0.09)] transition-all border border-outline-variant/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                              {code}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase font-semibold ${
                                priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical'
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-secondary-container text-on-secondary-container'
                              }`}
                            >
                              {priority} Priority
                            </span>
                            <span className="text-xs font-bold text-secondary">+{t.points || 350} XP</span>
                          </div>

                          <h3 className="font-title-lg text-lg text-primary font-semibold group-hover:text-secondary transition-colors">
                            {t.title}
                          </h3>

                          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1 line-clamp-2 max-w-xl">
                            {t.description}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
                              <span>Due 23:59 UTC</span>
                            </span>
                            <span>•</span>
                            <span className="font-medium text-primary">Sprint 04 Active</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                          <Link
                            to={`/intern/tasks/${id}`}
                            className="px-4 py-2 rounded-full bg-surface-container text-primary font-label-md text-xs hover:bg-surface-container-high transition-colors border border-outline-variant/30"
                          >
                            View
                          </Link>
                          <Link
                            to={`/intern/tasks/${id}/submit`}
                            className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-xs hover:bg-primary-container transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Submit</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* Internship Guidance Note */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xs border border-outline-variant/20">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl">lightbulb</span>
            </div>
            <div>
              <span className="font-label-xs-caps text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Internship Tip
              </span>
              <h4 className="font-headline-sm text-lg text-primary mt-0.5">Focus On Quality &amp; Completeness</h4>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                Writing clean, well-tested code and providing clear repository and live demo links helps faculty quickly review and approve your submissions.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Sticky Summary Board (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div>
                <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Progress Status
                </span>
                <h3 className="font-headline-sm text-lg text-primary font-medium">Summary</h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[18px]">analytics</span>
              </div>
            </div>

            {/* Circular Progress & Metrics */}
            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Completion Rate
                </span>
                <div className="font-display text-3xl text-primary font-medium mt-0.5">
                  {tasks.length > 0 ? Math.round((approvedCount / tasks.length) * 100) : 0}<span className="text-sm text-secondary font-normal">%</span>
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  {approvedCount} of {tasks.length} tasks approved
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>

            {/* Remaining Points */}
            <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                </div>
                <div>
                  <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant block">
                    Accumulated Points
                  </span>
                  <span className="text-xs font-semibold text-primary">Intern Standing</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline-sm text-base text-secondary font-bold">
                  {totalXP.toLocaleString()} Pts
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/intern/submissions"
                className="w-full py-3 px-4 rounded-full bg-secondary text-on-secondary font-label-md text-xs tracking-wider uppercase font-semibold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <span className="material-symbols-outlined text-[16px]">history_edu</span>
                <span>View My Submissions</span>
              </Link>
            </div>
          </div>

          {/* Quotation Card */}
          <div className="bg-primary text-on-primary rounded-3xl p-6 shadow-md relative overflow-hidden">
            <span className="font-label-xs-caps text-[10px] tracking-[0.2em] uppercase text-secondary-fixed-dim font-semibold">
              Foundational Principle
            </span>
            <p className="font-headline-sm italic text-lg text-primary-fixed mt-2 leading-snug">
              "Code readability and allocation determinism define system longevity."
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-primary-fixed-dim">
              <span>TaskNest Architecture Codex</span>
              <span>Vol. IV</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
