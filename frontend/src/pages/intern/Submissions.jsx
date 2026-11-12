import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { submissionService } from '../../services/api.js'
import { Skeleton } from '../../components/common/Motion.jsx'

export default function Submissions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState(initialQuery)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

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

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const res = await submissionService.list()
      setSubmissions(
        (res?.submissions ?? []).map((s) => ({
          id: s._id || s.id,
          taskId: s.task?._id || s.task,
          taskCode: s.task?.code || `TASK-${(s.task?._id || s._id || '').slice(-4).toUpperCase() || '0841'}`,
          taskTitle: s.task?.title || 'Assigned Task',
          status:
            s.status === 'approved'
              ? 'Approved'
              : s.status === 'rejected'
              ? 'Rejected'
              : 'Under Review',
          submittedAt: s.submittedAt || new Date().toISOString(),
          pointsAwarded: s.review?.pointsAwarded ?? null,
          pointsAvailable: s.task?.points ?? 450,
          feedback: s.review?.feedback ?? null,
          repoUrl: s.repoUrl || '',
          notes: s.notes || ''
        }))
      )
    } catch (err) {
      console.warn('[Submissions] API load failed:', err.message)
      setLoadError(err.message || 'Could not load your submissions.')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      !search.trim() ||
      sub.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
      sub.taskCode?.toLowerCase().includes(search.toLowerCase()) ||
      sub.notes?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (filter === 'all') return true
    if (filter === 'review') return sub.status === 'Under Review' || sub.status === 'Pending'
    if (filter === 'approved') return sub.status === 'Approved'
    return true
  })

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Intern Portal // Submissions
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            My Submissions
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            View your submitted tasks, review faculty feedback, and track awarded points.
          </p>
        </div>

        <Link
          to="/intern/daily-tasks"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all shadow-sm self-start lg:self-end"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Submit Task</span>
        </Link>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-surface-bright rounded-3xl p-4 md:p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search submissions by title or code..."
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-full w-full md:w-auto border border-outline-variant/20 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Submissions' },
            { id: 'review', label: 'Under Review' },
            { id: 'approved', label: 'Approved & Awarded' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full font-label-xs-caps text-[11px] uppercase tracking-wider transition-all ${
                filter === tab.id
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{loadError}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-bright rounded-3xl p-16 text-center border border-outline-variant/20 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
            <span className="material-symbols-outlined text-4xl text-outline-variant">
              history_edu
            </span>
            <h3 className="font-headline-sm text-lg text-primary mt-2">No submissions recorded</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {search
                ? `No submissions matched "${search}". Try clearing your search.`
                : 'Select an assigned daily task to submit your work.'}
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
          filtered.map((sub) => (
            <motion.div
              key={sub.id}
              whileHover={{ y: -3, transition: { duration: 0.22 } }}
              className="p-6 md:p-8 rounded-3xl bg-surface-bright shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4 group hover:border-secondary/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                    {sub.taskCode}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full font-label-xs-caps text-[11px] uppercase font-semibold ${
                      sub.status === 'Approved'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : sub.status === 'Rejected'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {sub.pointsAwarded !== null && sub.pointsAwarded !== undefined ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px] text-secondary">military_tech</span>
                    <span>+{sub.pointsAwarded} Pts Awarded</span>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant font-medium">
                    +{sub.pointsAvailable} Pts Pending Review
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-headline-sm text-xl text-primary font-medium group-hover:text-secondary transition-colors">
                  {sub.taskTitle}
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                  <strong className="text-primary font-mono text-xs">Submission Notes:</strong>
                  <br />
                  "{sub.notes}"
                </p>
              </div>

              {sub.feedback && (
                <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold font-label-xs-caps uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Faculty Feedback</span>
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "{sub.feedback}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span>
                  {sub.repoUrl ? (
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">code</span>
                      <span>View Repository</span>
                    </a>
                  ) : null}
                </span>

                <Link
                  to={`/intern/submissions/${sub.id}`}
                  className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-label-md text-primary transition-colors border border-outline-variant/30 flex items-center gap-1"
                >
                  <span>Submission Details</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
