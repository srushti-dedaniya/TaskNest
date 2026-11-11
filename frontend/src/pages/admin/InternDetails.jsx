import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { userService } from '../../services/api.js'
import { CountUp, Skeleton } from '../../components/common/Motion.jsx'

export default function InternDetails() {
  const { internId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchIntern() {
      if (!internId || internId === 'intern-01') return
      try {
        setLoading(true)
        const res = await userService.get(internId)
        if (res?.intern) {
          setData(res)
        }
      } catch (err) {
        console.warn('[InternDetails] API fetch failed:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchIntern()
  }, [internId])

  const intern = data?.intern
  const stats = data?.stats
  const name = intern?.name || 'Intern'
  const email = intern?.email || 'intern@tasknest.org'
  const institution = intern?.institution || 'College / University'
  const fieldOfStudy = intern?.fieldOfStudy || 'Computer Science & Engineering'
  const points = stats?.points ?? intern?.points ?? 0
  const totalSubs = stats?.submissions ?? 0
  const approvedSubs = stats?.approved ?? 0
  const isEmailVerified = intern?.isEmailVerified !== false

  return (
    <div className="space-y-8">
      <div className="w-full max-w-[1400px] mx-auto py-2 flex flex-col gap-6">
        {/* Breadcrumb Header Grid */}
        <div className="flex items-center gap-2 font-label-xs-caps text-xs text-on-surface-variant uppercase tracking-widest pb-2 border-b border-outline-variant/20">
          <Link to="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
          <span className="text-outline-variant">/</span>
          <Link to="/admin/interns" className="hover:text-primary">Interns</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">{name}</span>
        </div>

        {/* Core Identity Card */}
        <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-3xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-lg text-3xl font-bold shadow-inner">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-primary text-on-primary font-label-xs-caps text-[9px] uppercase shadow">
                {isEmailVerified ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-md text-2xl md:text-3xl text-primary font-semibold tracking-tight">{name}</h1>
                <span className="px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-[11px] uppercase font-semibold">
                  {institution}
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant max-w-md mt-1">
                {fieldOfStudy}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="font-label-md px-3 py-1 rounded-lg bg-surface-container text-on-surface inline-flex items-center gap-1.5 font-mono text-xs">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              to="/admin/interns"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-xs hover:bg-surface-container-high transition-all border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Interns</span>
            </Link>
          </div>
        </div>

        {/* 4x Metric Stat Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-bright rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">military_tech</span>
            <div className="font-headline-sm text-2xl text-primary font-bold tracking-tight mt-2">
              <CountUp value={points} /><span className="text-xs text-on-surface-variant font-normal ml-1">pts</span>
            </div>
            <div className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant mt-1">Total Points</div>
          </div>

          <div className="bg-surface-bright rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
            <div className="font-headline-sm text-2xl text-primary font-bold tracking-tight mt-2">
              <CountUp value={approvedSubs} />
            </div>
            <div className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant mt-1">Approved Submissions</div>
          </div>

          <div className="bg-surface-bright rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">lightbulb</span>
            <div className="font-headline-sm text-2xl text-primary font-bold tracking-tight mt-2">
              <CountUp value={totalSubs} /><span className="text-xs text-on-surface-variant font-normal ml-1">total</span>
            </div>
            <div className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant mt-1">Total Submissions</div>
          </div>

          <div className="bg-surface-bright rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">stacked_bar_chart</span>
            <div className="font-headline-sm text-2xl text-primary font-bold tracking-tight mt-2">
              {isEmailVerified ? 'Active' : 'Pending'}
            </div>
            <div className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant mt-1">Account Status</div>
          </div>
        </div>

        {/* Assigned Tasks & Submissions History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submissions History (col-8) */}
          <div className="lg:col-span-8 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">history_edu</span>
                <span className="font-label-xs-caps text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                  Task Submissions History ({data?.submissions?.length ?? 0})
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-on-surface-variant">Loading intern history...</div>
            ) : !data?.submissions?.length ? (
              <div className="py-12 text-center text-xs text-on-surface-variant">
                No submissions submitted yet by this intern.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {data.submissions.map((sub) => (
                  <div key={sub._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-primary truncate">
                        {sub.task?.title || 'Task Deliverable'}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-label-xs-caps text-[10px] uppercase font-semibold ${
                          sub.status === 'approved'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : sub.status === 'rejected'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {sub.status === 'approved' ? 'Approved' : sub.status === 'rejected' ? 'Changes Needed' : 'In Review'}
                      </span>
                      <Link
                        to={`/admin/submissions/${sub._id}/review`}
                        className="text-xs text-secondary hover:underline font-semibold"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info (col-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary text-on-primary rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-label-xs-caps uppercase tracking-wider opacity-80 font-semibold">
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>Intern Information</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="opacity-70 uppercase tracking-wider text-[10px]">Institution</div>
                  <div className="font-semibold text-sm mt-0.5">{institution}</div>
                </div>
                <div>
                  <div className="opacity-70 uppercase tracking-wider text-[10px]">Field / Specialization</div>
                  <div className="font-semibold text-sm mt-0.5">{fieldOfStudy}</div>
                </div>
                <div>
                  <div className="opacity-70 uppercase tracking-wider text-[10px]">Email Address</div>
                  <div className="font-mono text-xs mt-0.5">{email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
