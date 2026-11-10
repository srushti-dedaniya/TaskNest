import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { userService } from '../../services/api.js'

export default function InternManagement() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState(initialQuery)

  useEffect(() => {
    if (searchParams.get('q') !== null) {
      setSearch(searchParams.get('q') || '')
    }
  }, [searchParams])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setLoadError('')
        const res = await userService.list()
        setInterns(res?.interns ?? [])
      } catch (err) {
        console.warn('[InternManagement] API load failed:', err.message)
        setLoadError(err.message || 'Could not load the interns directory.')
        setInterns([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (i.name || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q) ||
      (i.institution || '').toLowerCase().includes(q) ||
      (i.fieldOfStudy || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-8">
      <div className="w-full max-w-[1400px] mx-auto py-2 flex flex-col gap-6">
        {/* Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2 font-label-xs-caps text-xs text-on-surface-variant uppercase tracking-widest">
            <Link to="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="text-outline-variant">/</span>
            <span>Interns</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">Directory</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-xs-caps">
              {filtered.length} Active
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Faculty Directory
            </span>
            <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight mt-1 mb-2">
              Manage Interns
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              View all registered interns, monitor their task progress, review submissions, and manage points.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search interns by name, email, college..."
              className="w-full h-10 pl-10 pr-9 bg-surface-bright rounded-full text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none border border-outline-variant/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-primary"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Interns Table Card */}
        <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
            <span className="font-label-xs-caps text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Interns Directory ({filtered.length})
            </span>
            <span className="text-xs text-secondary font-medium">Active Cohort</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span>Loading Interns...</span>
            </div>
          ) : loadError ? (
            <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{loadError}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">person_search</span>
              <h3 className="font-headline-sm text-lg text-primary">No interns found</h3>
              <p className="text-xs text-on-surface-variant">
                {search ? `No interns match your search "${search}".` : 'No interns currently registered.'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left font-label-xs-caps text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="pb-2 pl-4">Intern</th>
                    <th className="pb-2">Institution / Major</th>
                    <th className="pb-2 text-right">Points</th>
                    <th className="pb-2 text-right">Submissions</th>
                    <th className="pb-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((intern) => {
                    const id = intern._id || intern.id
                    return (
                      <tr
                        key={id}
                        className="group bg-surface-container-low hover:bg-surface-container transition-all"
                      >
                        <td className="rounded-l-2xl py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm text-base font-semibold shrink-0">
                              {(intern.name || 'I').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-title-md text-sm text-primary font-semibold flex items-center gap-1.5">
                                {intern.name}
                              </div>
                              <div className="font-body-sm text-xs text-on-surface-variant truncate">
                                {intern.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="font-body-md text-xs text-on-surface font-medium">
                            {intern.institution || 'Internship Program'}
                          </div>
                          <div className="font-body-sm text-[11px] text-on-surface-variant truncate">
                            {intern.fieldOfStudy || 'Software Engineering'}
                          </div>
                        </td>

                        <td className="py-4 text-right">
                          <div className="font-title-md text-sm text-secondary font-mono font-bold">
                            {(intern.points ?? 0).toLocaleString()} pts
                          </div>
                        </td>

                        <td className="py-4 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-xs-caps text-[10px] uppercase font-semibold">
                            {intern.submissions ?? 0} submitted
                          </span>
                        </td>

                        <td className="rounded-r-2xl py-4 pr-4 text-right">
                          <Link
                            to={`/admin/interns/${id}`}
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-surface-bright text-on-surface font-label-md text-xs hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
                          >
                            <span>Profile</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
