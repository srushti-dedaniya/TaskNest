import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { userService } from '../../services/api.js'
import { CountUp, AnimatedProgressBar, Skeleton } from '../../components/common/Motion.jsx'

export default function Points() {
  const { user } = useAuth()
  const [pointsData, setPointsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await userService.points()
        setPointsData(data ?? null)
      } catch (err) {
        console.warn('[Points] API load failed:', err.message)
        setError(err.message || 'Could not load your points.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentPoints = pointsData?.user?.points ?? user?.points ?? 0
  const ledger = pointsData?.ledger ?? []
  const stats = pointsData?.stats
  const level = Math.floor(currentPoints / 1000) + 1
  const nextLevelPoints = level * 1000
  const pointsToNext = Math.max(0, nextLevelPoints - currentPoints)
  const progressPct = Math.min(100, Math.round(((currentPoints % 1000) / 1000) * 100))
  const userName = user?.name || 'Intern'

  // Build sprint chart from the real points ledger (chronological, cumulative)
  const performanceHistory = (() => {
    const entries = [...ledger]
      .sort((a, b) => new Date(a.reviewedAt) - new Date(b.reviewedAt))
      .map((e) => ({ date: new Date(e.reviewedAt).toLocaleDateString(), xp: e.pointsAwarded }))
    let cum = 0
    const history = entries.map((e) => {
      cum += e.xp
      return { ...e, cumulative: cum }
    })
    return history.length > 0
      ? history
      : [{ date: 'No reviews yet', xp: 0, cumulative: 0 }]
  })()

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <p className="font-title-lg text-secondary italic mb-1">Good morning, { userName }</p>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Your Growth Journey.
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Track your internship points growth, completed tasks, and faculty feedback across active sprints.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <div className="px-4 py-2 rounded-full bg-surface-container text-on-surface flex items-center gap-2 border border-outline-variant/30 shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
            <span className="font-label-md text-xs">Level {level} Scholar</span>
          </div>
          <span className="px-3.5 py-2 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-xs font-semibold uppercase">
            Approved: {stats?.approvedCount ?? 0}
          </span>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Hero Stats Card with XP Level Progress */}
      <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-2">
            <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
              Accumulated Mastery
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl md:text-6xl text-primary font-medium tracking-tight">
                <CountUp value={currentPoints} />
              </span>
              <span className="font-headline-sm text-2xl text-secondary font-medium">XP</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Level {level} Scholar &bull; {pointsToNext} XP needed for Level {level + 1}
            </p>

            {/* Progress Bar */}
            <AnimatedProgressBar
              progress={currentPoints % 1000}
              max={1000}
              className="w-full h-3 rounded-full bg-surface-container overflow-hidden mt-3"
              barClassName="bg-secondary"
            />
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-outline-variant/30 pt-4 lg:pt-0 lg:pl-8">
            <div className="p-4 rounded-2xl bg-surface-container-low transition-transform duration-200 hover:-translate-y-0.5">
              <span className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant font-semibold block mb-1">
                Tasks Completed
              </span>
              <span className="font-display text-2xl text-primary font-medium">
                <CountUp value={stats?.approvedCount ?? ledger.length} />
              </span>
              <span className="text-[11px] text-secondary block mt-0.5">Approved Reviews</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low transition-transform duration-200 hover:-translate-y-0.5">
              <span className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant font-semibold block mb-1">
                Pending Reviews
              </span>
              <span className="font-display text-2xl text-primary font-medium">
                <CountUp value={stats?.pending ?? 0} />
              </span>
              <span className="text-[11px] text-secondary block mt-0.5">Awaiting Faculty</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low col-span-2 sm:col-span-1 transition-transform duration-200 hover:-translate-y-0.5">
              <span className="font-label-xs-caps text-[10px] uppercase text-on-surface-variant font-semibold block mb-1">
                Active Tasks
              </span>
              <span className="font-display text-2xl text-primary font-medium">
                <CountUp value={stats?.taskCount ?? 0} />
              </span>
              <span className="text-[11px] text-secondary block mt-0.5">In Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Trajectory Chart */}
      <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
              Performance Velocity
            </span>
            <h3 className="font-headline-sm text-xl text-primary font-medium mt-0.5">
              Review-by-Review Experience Growth
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-label-xs-caps uppercase">
            Cumulative Cadence
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory}>
                <defs>
                  <linearGradient id="internXP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#74593f" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#74593f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d4" vertical={false} />
                <XAxis dataKey="date" stroke="#686256" tick={{ fontSize: 12 }} />
                <YAxis stroke="#686256" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e0dacb',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#74593f"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#internXP)"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Approved Submissions Points Ledger */}
      <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <h3 className="font-headline-sm text-xl text-primary font-medium">Approved Submissions &amp; XP Ledger</h3>
          <span className="text-xs text-secondary font-semibold font-label-xs-caps uppercase">
            {ledger.length} Verified Entries
          </span>
        </div>

        {ledger.length === 0 && !loading ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">
            No approved submissions yet. Submit your tasks &amp; complete them to earn XP.
          </p>
        ) : (
          <div className="space-y-3">
            {ledger.map((entry, idx) => (
              <motion.div
                key={entry.id || idx}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
                className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/10 shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-on-surface-variant">{entry.reviewedAt ? new Date(entry.reviewedAt).toLocaleDateString() : ''}</span>
                  </div>
                  <h4 className="font-title-md text-sm text-primary font-semibold">{entry.task}</h4>
                  <p className="text-xs text-on-surface-variant italic mt-1 max-w-xl">"{entry.feedback}"</p>
                </div>

                <div className="text-right self-start sm:self-center shrink-0">
                  <span className="font-headline-sm text-base text-secondary font-bold">
                    +{entry.pointsAwarded} XP
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-label-xs-caps uppercase block">
                    Attested
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
