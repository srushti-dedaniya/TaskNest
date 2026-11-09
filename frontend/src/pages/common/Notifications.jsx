import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notificationService } from '../../services/api.js'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')

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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs transition-colors border border-outline-variant/30"
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
          { id: 'all', label: 'All Signals' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'review', label: 'Reviews' },
          { id: 'task', label: 'Assignments' },
          { id: 'points', label: 'XP & Honors' }
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

      {/* Notifications Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>Synchronizing Signals...</span>
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
            <div
              key={notif.id}
              onClick={() => markItemRead(notif.id)}
              className={`p-5 md:p-6 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-surface-bright border-outline-variant/20 opacity-80 hover:opacity-100'
                  : 'bg-surface-container-low border-secondary/40 shadow-sm'
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
                    {notif.category?.includes('review')
                      ? 'rate_review'
                      : notif.category?.includes('points') || notif.category?.includes('honors')
                      ? 'military_tech'
                      : 'notifications'}
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-xs-caps text-[10px] uppercase font-semibold text-secondary">
                      {notif.category}
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
                    className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                    title="View related item"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
