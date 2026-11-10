import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { submissionService } from '../../services/api.js'

export default function Reviews() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState(initialQuery)

  // Sync state if URL query changes
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
          taskCode: s.task?.code || `TASK-${(s.task?._id || s._id || '').slice(-4).toUpperCase() || '0841'}`,
          taskTitle: s.task?.title || 'Task Deliverable',
          internName: s.intern?.name || 'Intern',
          internAvatar: (s.intern?.name || 'I').charAt(0).toUpperCase(),
          repoUrl: s.repoUrl || '',
          liveUrl: s.liveUrl || '',
          notes: s.notes || '',
          status:
            s.status === 'approved'
              ? 'Approved'
              : s.status === 'rejected'
                ? 'Rejected'
                : 'Pending Review',
          submittedAt: s.submittedAt || new Date().toISOString()
        }))
      )
    } catch (err) {
      console.warn('[Reviews] API load failed:', err.message)
      setLoadError(err.message || 'Could not load submissions.')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
      sub.taskCode?.toLowerCase().includes(search.toLowerCase()) ||
      sub.internName?.toLowerCase().includes(search.toLowerCase())

    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'pending')
      return matchesSearch && (sub.status === 'Pending Review' || sub.status === 'Under Review' || sub.status === 'Pending')
    if (statusFilter === 'approved') return matchesSearch && sub.status === 'Approved'
    return matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Faculty Reviews
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Submission Reviews
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Review task submissions, provide feedback, and award points to interns.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container font-label-xs-caps text-xs text-secondary self-start lg:self-end font-semibold">
          <span className="material-symbols-outlined text-[16px]">rate_review</span>
          <span>{filteredSubmissions.length} submissions found</span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by intern name, task title, or task code..."
              className="w-full h-11 pl-10 pr-10 bg-surface-container-high/60 rounded-full text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/30 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center text-xs"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full self-start md:self-auto border border-outline-variant/20">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'approved', label: 'Approved' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full font-label-xs-caps text-[11px] uppercase tracking-wider transition-all ${statusFilter === tab.id
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>Loading submissions...</span>
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{loadError}</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">inbox</span>
            <h3 className="font-headline-sm text-lg text-primary mt-2">No submissions found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {search
                ? `No submissions matched "${search}". Try clearing your search.`
                : 'No submissions match your current filter criteria.'}
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
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 md:p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                    {sub.taskCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase font-semibold ${sub.status === 'Approved'
                      ? 'bg-primary text-on-primary'
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

                <h3 className="font-title-lg text-base md:text-lg text-primary font-semibold group-hover:text-secondary transition-colors">
                  {sub.taskTitle}
                </h3>

                <div className="flex items-center gap-3 mt-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm text-xs font-semibold">
                    {sub.internAvatar}
                  </div>
                  <span className="text-xs font-semibold text-primary">{sub.internName}</span>
                  {sub.repoUrl && (
                    <>
                      <span className="text-outline-variant">•</span>
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">code</span>
                        <span>Repository</span>
                      </a>
                    </>
                  )}
                  {sub.liveUrl && (
                    <>
                      <span className="text-outline-variant">•</span>
                      <a
                        href={sub.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        <span>Demo</span>
                      </a>
                    </>
                  )}
                </div>

                {sub.notes && (
                  <p className="font-body-md text-xs text-on-surface-variant mt-2 line-clamp-2 bg-surface-container-high/40 p-3 rounded-xl border border-outline-variant/10">
                    "{sub.notes}"
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
                <Link
                  to={`/admin/submissions/${sub.id}/review`}
                  className={`px-5 py-2.5 rounded-full text-xs font-label-md transition-all shadow-sm flex items-center gap-2 ${sub.status === 'Approved'
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {sub.status === 'Approved' ? 'rate_review' : 'gavel'}
                  </span>
                  <span>{sub.status === 'Approved' ? 'View Review' : 'Review Submission'}</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
