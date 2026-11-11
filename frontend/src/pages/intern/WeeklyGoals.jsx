import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { taskService } from '../../services/api.js'
import { Skeleton } from '../../components/common/Motion.jsx'

export default function WeeklyGoals() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [weeklyTasks, setWeeklyTasks] = useState([])
  const [loading, setLoading] = useState(true)
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

  const filteredTasks = weeklyTasks.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.code?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative pt-6 pb-6 border-b border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-xs-caps text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">
                Intern Portal • Weekly Milestones
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
              Weekly Goals
            </h1>
            <p className="font-body-lg text-sm text-on-surface-variant">
              Track macroscopic milestone targets and deliverables assigned by faculty.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search weekly goals..."
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
        </div>
      </section>

      {/* Main Multi-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Primary Goals Track (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-sm text-xl text-primary font-medium">Weekly Milestones</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container font-label-xs-caps text-[10px] text-on-secondary-container font-semibold uppercase">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'Goal' : 'Goals'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-3xl" />
              <Skeleton className="h-44 w-full rounded-3xl" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-surface-bright rounded-3xl p-16 text-center border border-outline-variant/20 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
              <span className="material-symbols-outlined text-4xl text-outline-variant">flag</span>
              <h3 className="font-headline-sm text-lg text-primary mt-2">No weekly goals found</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {search ? `No goals matched "${search}". Try clearing your search.` : 'No weekly goals have been assigned yet.'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-2 rounded-full bg-surface-container text-primary font-label-md text-xs hover:bg-surface-container-high transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] transition-shadow hover:shadow-md border border-outline-variant/30"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
                        Weekly Milestone • {task.code || `TASK-${(task._id || '').slice(-4).toUpperCase()}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-[10px] font-semibold uppercase">
                        {task.priority || 'Medium'} Priority
                      </span>
                    </div>
                    <h2 className="font-title-lg text-lg text-primary font-semibold">{task.title}</h2>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3 self-start">
                    <div className="text-right">
                      <div className="font-headline-sm text-xl text-primary leading-tight font-medium">
                        {task.points} <span className="text-xs text-secondary">Pts</span>
                      </div>
                      <span className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                        {task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : 'Sprint Target'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/intern/tasks/${task._id}`}
                    className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold font-label-xs-caps uppercase tracking-wider transition-all active:scale-[0.97] inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>View Details</span>
                  </Link>
                  <Link
                    to={`/intern/tasks/${task._id}/submit`}
                    className="px-5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold font-label-xs-caps uppercase tracking-wider transition-all active:scale-[0.97] inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    <span>Submit Work</span>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar Dock (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Weekly Milestone Tips</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Weekly goals represent broader project objectives. Break them down into smaller daily tasks, ensure all tests pass, and request faculty feedback when ready.
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-on-surface font-medium">Total Weekly Goals</span>
                <span className="text-xs font-mono font-bold text-secondary">{weeklyTasks.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="text-xs text-on-surface font-medium">Points Available</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {weeklyTasks.reduce((acc, t) => acc + (t.points || 0), 0)} Pts
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-outline-variant/20">
              <Link
                to="/intern/daily-tasks"
                className="w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs transition-colors text-center block border border-outline-variant/30"
              >
                Go to Daily Tasks →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
