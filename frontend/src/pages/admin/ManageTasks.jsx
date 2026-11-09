import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { taskService } from '../../services/api.js'

export default function ManageTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadTasks = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const res = await taskService.list()
      setTasks(
        (res?.tasks ?? []).map((t) => ({
          id: t._id || t.id,
          code: t.code || `SPEC-${(t._id || '').slice(-4).toUpperCase() || '1001'}`,
          title: t.title,
          description: t.description,
          type: t.type === 'weekly' ? 'Weekly' : 'Daily',
          priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
          points: t.points,
          assignedToName: t.assignment?.mode === 'all' ? 'All Fellows' : 'Individual',
          deadline: t.deadline,
          status: t.status || 'Active'
        }))
      )
    } catch (err) {
      console.warn('[ManageTasks] API load failed:', err.message)
      setLoadError(err.message || 'Could not load tasks.')
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
      t.assignedToName?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type?.toLowerCase() === typeFilter.toLowerCase()
    const matchesPriority =
      priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter.toLowerCase()
    return matchesSearch && matchesType && matchesPriority
  })

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await taskService.delete(id)
      setLoadError('')
    } catch (err) {
      console.warn('[ManageTasks] delete failed:', err.message)
      setLoadError(err.message || 'Could not delete task.')
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setDeleteConfirmId(null)
    setDeleting(false)
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Registry Index // Sprint 04
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Task Management
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Monitor, assign, and audit fellowship tasks across core protocol implementation, formal monograph writing, and verification benchmarks.
          </p>
        </div>

        <Link
          to="/admin/tasks/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all shadow-sm self-start lg:self-end"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Assign New Task</span>
        </Link>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task title, spec code (e.g. SPEC-0841), or intern name..."
              className="w-full h-11 pl-10 pr-4 bg-surface-container-high/60 rounded-full text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/30 transition-all"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full self-start md:self-auto border border-outline-variant/20">
            {['all', 'daily', 'weekly'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-1.5 rounded-full font-label-xs-caps text-[11px] uppercase tracking-wider transition-all ${
                  typeFilter === type
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {type === 'all' ? 'All Scopes' : type === 'daily' ? 'Daily Tasks' : 'Weekly Goals'}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
              Priority:
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 px-3 bg-surface-container-high/60 rounded-full text-xs text-on-surface border border-outline-variant/30 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
          <span className="font-label-xs-caps text-xs uppercase text-on-surface-variant font-semibold tracking-wider">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <span className="text-xs text-secondary font-medium">Sprint 04 Active Cadence</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>Querying Task Enclave Ledger...</span>
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{loadError}</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">
              rule_folder
            </span>
            <h3 className="font-headline-sm text-lg text-primary mt-2">No matching tasks found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Try adjusting your search query or filter toggles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group p-5 md:p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                      {task.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase font-semibold ${
                        task.priority?.toLowerCase() === 'critical'
                          ? 'bg-error-container text-on-error-container'
                          : task.priority?.toLowerCase() === 'high'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase bg-surface-bright text-on-surface-variant">
                      {task.type} Task
                    </span>
                    <span className="text-xs font-bold text-secondary">+{task.points} XP</span>
                  </div>

                  <h3 className="font-title-lg text-base md:text-lg text-primary font-semibold group-hover:text-secondary transition-colors">
                    {task.title}
                  </h3>

                  <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1 line-clamp-2 max-w-3xl">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        person
                      </span>
                      <span>Assigned: <strong className="text-primary">{task.assignedToName}</strong></span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        schedule
                      </span>
                      <span>
                        Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Nov 20, 23:59 UTC'}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-medium text-primary">Status: {task.status}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                  <Link
                    to={`/admin/tasks/${task.id}`}
                    className="px-4 py-2 rounded-full bg-surface-bright text-on-surface font-label-md text-xs hover:bg-surface-container-high transition-colors border border-outline-variant/30 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Details</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(task.id)}
                    className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                    title="Delete Task"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/40 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline-sm text-xl text-primary font-medium">Confirm Task Removal</h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              Are you sure you want to retract this task from the active registry? Assigned fellows will be notified and points allocated will be retired.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-error text-on-error text-xs font-label-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Retracting...' : 'Yes, Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
