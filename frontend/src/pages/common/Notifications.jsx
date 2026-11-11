import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { notificationService } from '../../services/api.js'
import { Skeleton } from '../../components/common/Motion.jsx'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')

  function formatCategory(category = '') {
    const cat = category.toUpperCase()
    if (cat.includes('DEADLINE_24H')) return 'Deadline: 24h'
    if (cat.includes('DEADLINE_1H')) return 'Deadline: 1h'
    if (cat.includes('DEADLINE_NOW')) return 'Deadline Now'
    if (cat.includes('OVERDUE')) return 'Task Overdue'
    if (cat.includes('TASK_ASSIGNED')) return 'Task Assigned'
    if (cat.includes('REVIEW')) return 'Faculty Review'
    if (cat.includes('POINTS')) return 'Points'
    return category
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const res = await notificationService.list()
      setNotifications(
        (res?.notifications ?? []).map((n) => ({
          id: n._id || n.id,
          category: n.type || 'System',
          title: n.title,
          timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(n.createdAt).toLocaleDateString(),
          body: n.body,
          read: n.isRead ?? false,
          link: n.meta?.taskId ? `/intern/tasks/${n.meta.taskId}` : '/intern/submissions'
        }))
      )
    } catch (err) {
      console.warn('[Notifications] API load failed:', err.message)
      setLoadError(err.message || 'Could not load notifications.')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'deadline') {
      return (
        n.category?.toLowerCase().includes('deadline') ||
        n.category?.toLowerCase().includes('overdue')
      )
    }
    return n.category?.toLowerCase().includes(filter.toLowerCase())
  })

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead()
    } catch (err) {
      console.warn('[Notifications] markAllRead error:', err.message)
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markItemRead = async (id) => {
    try {
      await notificationService.markRead(id)
    } catch (err) {
      console.warn('[Notifications] markRead error:', err.message)
    }
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Signal Feed // Realtime Event Telemetry
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Signal Feed Registry
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Live stream of task assignments, peer reviews, SLA milestones, and faculty evaluations across your active cohort.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs transition-all active:scale-[0.97] border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container rounded-full w-fit border border-outline-variant/20">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'task', label: 'Assignments' },
          { id: 'review', label: 'Reviews' },
          { id: 'points', label: 'Points' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full font-label-xs-caps text-[11px] uppercase tracking-wider transition-all active:scale-[0.97] ${
              filter === tab.id
                ? 'bg-primary text-on-primary shadow-xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{loadError}</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-surface-bright rounded-3xl p-16 text-center border border-outline-variant/20 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
            <span className="material-symbols-outlined text-4xl text-outline-variant">
              notifications_paused
            </span>
            <h3 className="font-headline-sm text-lg text-primary mt-2">Zero unread notifications</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Your signal feed has caught up with all cohort activities.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              onClick={() => markItemRead(notif.id)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className={`p-5 md:p-6 rounded-2xl border transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-surface-bright border-outline-variant/20 opacity-80 hover:opacity-100 hover:shadow-xs'
                  : 'bg-surface-container-low border-secondary/40 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.read
                      ? 'bg-surface-container text-on-surface-variant'
                      : 'bg-secondary-container text-on-secondary-container shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {notif.category?.toUpperCase().includes('DEADLINE') || notif.category?.toUpperCase().includes('OVERDUE')
                      ? 'alarm'
                      : notif.category?.includes('review')
                      ? 'rate_review'
                      : notif.category?.includes('points') || notif.category?.includes('honors')
                      ? 'military_tech'
                      : 'notifications'}
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-xs-caps text-[10px] uppercase font-semibold text-secondary">
                      {formatCategory(notif.category)}
                    </span>
                    <span className="text-outline-variant text-xs">•</span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {notif.timestamp || notif.date}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                    )}
                  </div>

                  <h3 className="font-title-md text-base text-primary font-semibold">
                    {notif.title}
                  </h3>

                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {notif.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.link && (
                  <Link
                    to={notif.link}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-container transition-colors shadow-xs"
                    title="View related task"
                  >
                    <span>View</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
