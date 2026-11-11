import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'

const SETTINGS_KEY = 'tasknest_faculty_settings'

export default function FacultySettings() {
  const { user } = useAuth()

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) return JSON.parse(saved)
    } catch { }
    return {
      emailOnSubmission: true,
      emailOnOverdue: true,
      defaultPriority: 'High',
      defaultDueDays: 7,
      compactView: false,
      lockEditsPostDeadline: false
    }
  })

  const [savedMsg, setSavedMsg] = useState(false)

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 3000)
    } catch (err) {
      console.warn('Failed to save settings:', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/dashboard"
              className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
              Faculty Settings
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Settings &amp; Preferences
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Configure system notifications, review preferences, and default task assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/profile"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Edit Profile</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {savedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
            <span>Faculty settings successfully saved!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Notification & Review Config (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[20px]">notifications_active</span>
              <h3 className="font-headline-sm text-lg text-primary font-medium">Email &amp; System Notifications</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="pr-4">
                  <div className="text-sm font-semibold text-primary">New Submission Notifications</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Receive an immediate email alert when an intern submits a task deliverable.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailOnSubmission}
                  onChange={() => handleToggle('emailOnSubmission')}
                  className="w-5 h-5 rounded accent-secondary cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="pr-4">
                  <div className="text-sm font-semibold text-primary">Overdue Task Alerts</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Receive alerts when assigned tasks pass their deadline without a submission.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailOnOverdue}
                  onChange={() => handleToggle('emailOnOverdue')}
                  className="w-5 h-5 rounded accent-secondary cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="pr-4">
                  <div className="text-sm font-semibold text-primary">Lock Submissions Post Deadline</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Prevent interns from submitting work after the deadline has expired without faculty extension.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lockEditsPostDeadline}
                  onChange={() => handleToggle('lockEditsPostDeadline')}
                  className="w-5 h-5 rounded accent-secondary cursor-pointer shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Task Defaults */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
              <h3 className="font-headline-sm text-lg text-primary font-medium">Task Assignment Defaults</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Default Priority Tier
                </label>
                <select
                  value={settings.defaultPriority}
                  onChange={(e) => handleChange('defaultPriority', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Default Deadline (Days)
                </label>
                <select
                  value={settings.defaultDueDays}
                  onChange={(e) => handleChange('defaultDueDays', Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Summary & Save (Col-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Logged In Faculty</h3>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-headline-sm text-base flex items-center justify-center font-bold">
                {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'FC')}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-primary truncate">{user?.name || 'Faculty Member'}</div>
                <div className="text-xs text-on-surface-variant font-mono truncate">{user?.email}</div>
                <div className="text-[10px] text-secondary font-semibold uppercase mt-0.5">Faculty / Administrator</div>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant leading-relaxed">
              These settings are saved to your current browser profile and apply to your task dispatch workflows.
            </div>

            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Settings</span>
              </button>

              <Link
                to="/admin/profile"
                className="w-full py-2.5 px-6 rounded-full bg-surface-container text-on-surface font-label-md text-xs hover:bg-surface-container-high transition-all border border-outline-variant/30 flex items-center justify-center gap-2 text-center"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Faculty Profile Details</span>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
