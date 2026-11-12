import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { taskService } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { Skeleton } from '../../components/common/Motion.jsx'

const STATUS_LABELS = {
  assigned: 'Pending',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  completed: 'Completed',
  overdue: 'Overdue'
}

export default function DailyTasks() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState(initialQuery)

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearch(q)
  }, [searchParams])

  const handleSearchChange = (value) => {
    setSearch(value)
    const nextParams = new URLSearchParams(searchParams)
    if (value.trim()) {
      nextParams.set('q', value.trim())
    } else {
      nextParams.delete('q')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleClearSearch = () => {
    setSearch('')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    setSearchParams(nextParams, { replace: true })
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const res = await taskService.list({ type: 'daily' })
      setTasks(
        (res?.tasks ?? []).map((t) => {
          const assignment = (t.assignments || []).find(
            (a) => String(a.intern?._id ?? a.intern) === String(user?._id)
          )
          return {
            id: t._id || t.id,
            code: t.code || `TASK-${(t._id || '').slice(-4).toUpperCase() || '0842'}`,
            title: t.title,
            description: t.description,
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
            points: t.points,
            status: STATUS_LABELS[assignment?.status] ?? 'Pending',
            deadline: t.deadline
          }
        })
      )
    } catch (err) {
      console.warn('[DailyTasks] API load failed:', err.message)
      setLoadError(err.message || 'Could not load assigned tasks.')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.code?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())

    const matchesPriority =
      priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter.toLowerCase()

    if (filter === 'all') return matchesSearch && matchesPriority
    if (filter === 'pending')
      return matchesSearch && matchesPriority && t.status?.toLowerCase() === 'pending'
    if (filter === 'in-progress')
      return matchesSearch && matchesPriority && t.status?.toLowerCase().includes('progress')
    if (filter === 'completed')
      return matchesSearch && matchesPriority && t.status?.toLowerCase() === 'completed'
    return matchesSearch && matchesPriority
  })

  return (
    <div className="space-y-8">
      {/* Top Editorial Header & Sprint Context */}
      <section className="relative pt-2 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-xs-caps text-[11px] tracking-[0.2em] text-secondary uppercase font-semibold">
              Intern Portal
            </span>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
              Daily Tasks
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl tracking-tight text-primary font-medium">
            Assigned Daily Tasks
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Track and complete your assigned daily tasks. Submit your code repository and links for faculty evaluation.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-surface-container-high/60 px-5 py-3 rounded-2xl shadow-xs self-start md:self-end border border-outline-variant/30">
          <div className="flex flex-col">
            <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
              Tasks Assigned
            </span>
            <span className="font-headline-sm text-xl text-primary font-semibold">
              {tasks.length}
            </span>
          </div>
          <div className="w-px h-8 bg-outline-variant/40" />
          <div className="flex flex-col">
            <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
              Completed
            </span>
            <span className="font-headline-sm text-xl text-primary font-semibold">
              {tasks.filter((t) => t.status === 'Completed').length}
            </span>
          </div>
        </div>
      </section>

      {/* Filter & Controller Bar */}
      <div className="bg-surface-bright rounded-3xl p-4 md:p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks, codes, or keywords..."
            className="w-full h-10 pl-10 pr-10 bg-surface-container rounded-full text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/30"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center text-xs"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto p-1 bg-surface-container rounded-full border border-outline-variant/20">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'Pending' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full font-label-xs-caps text-[11px] uppercase tracking-wider transition-all ${filter === tab.id
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-44 h-10 px-3 bg-surface-container rounded-full text-xs text-on-surface border border-outline-variant/30 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Main Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Task Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-headline-sm text-xl text-primary font-medium">Daily Tasks</h2>
            <span className="font-label-xs-caps text-xs text-secondary font-semibold uppercase">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'} Available
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          ) : loadError ? (
            <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{loadError}</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-surface-bright rounded-3xl p-16 text-center border border-outline-variant/20 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
              <span className="material-symbols-outlined text-4xl text-outline-variant">task</span>
              <h3 className="font-headline-sm text-lg text-primary mt-2">No matching tasks found</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {search ? `No tasks matched "${search}". Try clearing your search.` : 'Try adjusting your filters.'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-2 rounded-full bg-surface-container text-primary font-label-md text-xs hover:bg-surface-container-high transition-colors active:scale-95"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((t) => (
              <motion.article
                key={t.id}
                whileHover={{ y: -3, transition: { duration: 0.22 } }}
                className="group relative bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(53,51,45,0.09)] transition-all border border-outline-variant/20"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                        {t.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase font-semibold ${t.priority?.toLowerCase() === 'high' || t.priority?.toLowerCase() === 'critical'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-secondary-container text-on-secondary-container'
                          }`}
                      >
                        {t.priority} Priority
                      </span>
                      <span className="text-xs font-bold text-secondary">+{t.points} Points</span>
                    </div>

                    <h3 className="font-title-lg text-lg text-primary font-semibold group-hover:text-secondary transition-colors">
                      {t.title}
                    </h3>

                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1.5 line-clamp-2 max-w-xl">
                      {t.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
                        <span>{t.deadline ? `Due ${new Date(t.deadline).toLocaleDateString()}` : 'No deadline'}</span>
                      </span>
                      <span>•</span>
                      <span className="font-medium text-primary">Status: {t.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0 w-full sm:w-auto">
                    <Link
                      to={`/intern/tasks/${t.id}`}
                      className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-full bg-surface-container text-primary font-label-md text-xs hover:bg-surface-container-high transition-colors border border-outline-variant/30"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/intern/tasks/${t.id}/submit`}
                      className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-xs hover:bg-primary-container transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Submit</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* Right Sidebar: Cohort Summary Dock (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Task Overview</h3>
            <p className="text-xs text-on-surface-variant">
              Manage your daily deliverables and submit on time.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-on-surface font-medium">Total Tasks</span>
                <span className="text-xs font-mono font-bold text-secondary">{tasks.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-on-surface font-medium">Completed</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {tasks.filter((t) => t.status === 'Completed').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-on-surface font-medium">Total Points In Play</span>
                <span className="text-xs font-mono font-bold text-secondary">
                  {tasks.reduce((sum, t) => sum + (t.points || 0), 0)} Pts
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <Link
                to="/intern/submissions"
                className="w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs transition-colors text-center block border border-outline-variant/30"
              >
                View My Submissions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
