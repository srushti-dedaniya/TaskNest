import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { PageTransition } from '../components/common/Motion.jsx'
import { getInitials } from '../utils/avatar.js'

export default function InternLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/intern/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/intern/daily-tasks', icon: 'assignment', label: 'Tasks' },
    { to: '/intern/weekly-goals', icon: 'flag', label: 'Goals' },
    { to: '/intern/submissions', icon: 'upload_file', label: 'Submissions' },
    { to: '/intern/points', icon: 'trending_up', label: 'Performance' }
  ]

  const isActive = (path) => {
    if (path === '/intern/dashboard') return location.pathname === '/intern/dashboard'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    if (location.pathname.startsWith('/intern/weekly-goals')) {
      navigate(`/intern/weekly-goals?q=${encodeURIComponent(trimmed)}`)
    } else if (location.pathname.startsWith('/intern/submissions')) {
      navigate(`/intern/submissions?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate(`/intern/daily-tasks?q=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    if (location.pathname.startsWith('/intern/weekly-goals')) {
      navigate('/intern/weekly-goals')
    } else if (location.pathname.startsWith('/intern/submissions')) {
      navigate('/intern/submissions')
    } else if (location.pathname.startsWith('/intern/daily-tasks')) {
      navigate('/intern/daily-tasks')
    }
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Floating Desktop Sidebar */}
      <aside className="fixed left-6 top-24 bottom-8 w-20 z-40 hidden md:flex flex-col items-center justify-between py-6 bg-surface-bright/80 backdrop-blur-xl rounded-xl shadow-[0_12px_32px_-4px_rgba(53,51,45,0.08),0_4px_12px_-2px_rgba(53,51,45,0.04)] border border-outline-variant/30">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Brand Monogram */}
          <Link
            to="/intern/dashboard"
            className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline-sm font-semibold hover:scale-105 transition-transform"
            title="TaskNest Intern Portal"
          >
            TN
          </Link>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {navLinks.map((item) => {
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-95 ${
                    active
                      ? 'text-on-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="internNavActivePill"
                      className="absolute inset-0 rounded-full bg-secondary shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="absolute left-16 px-2.5 py-1 bg-primary text-on-primary rounded font-label-xs-caps text-[11px] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap shadow-md z-50">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions: Profile, Role Switch, Logout */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          <Link
            to="/intern/profile"
            title="Profile"
            className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              location.pathname === '/intern/profile'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="absolute left-16 px-2.5 py-1 bg-primary text-on-primary rounded font-label-xs-caps text-[11px] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
              Profile
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="group relative flex items-center justify-center w-12 h-12 rounded-full text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="absolute left-16 px-2.5 py-1 bg-primary text-on-primary rounded font-label-xs-caps text-[11px] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
              Sign Out
            </span>
          </button>

          <div className="w-8 h-px bg-outline-variant/40 my-1" />
          <div className="w-2 h-2 rounded-full bg-secondary" />
        </div>
      </aside>

      {/* Floating Top Header */}
      <header className="fixed top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 md:left-32 md:right-8 h-14 sm:h-16 z-30 bg-surface-bright/80 backdrop-blur-xl rounded-full shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] border border-outline-variant/30 flex items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Menu Toggle + Brand + Role Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors active:scale-95 shrink-0"
            aria-label="Toggle Navigation Menu"
            title="Open Menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link to="/intern/dashboard" className="flex items-baseline gap-1">
            <span className="font-headline-sm text-xl sm:text-2xl tracking-tight text-primary font-medium">TaskNest</span>
            <span className="hidden sm:inline-block font-label-xs-caps text-[10px] uppercase tracking-widest text-on-surface-variant/80 ml-1">
              Portal
            </span>
          </Link>
          <div className="h-4 w-px bg-outline-variant/50 hidden sm:block" />
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container/60 font-label-xs-caps text-[10px] uppercase tracking-wider text-on-secondary-container font-semibold">
            Intern
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden lg:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, goals, submissions... (press Enter)"
              className="w-full h-10 pl-10 pr-16 bg-surface-container-high/60 rounded-full font-body-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest transition-all border border-outline-variant/20 focus:border-secondary"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs"
                title="Clear search"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-xs-caps text-[9px] uppercase tracking-wider">
                Enter
              </span>
            )}
          </form>
        </div>

        {/* Right: Actions, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Link */}
          <Link
            to="/intern/notifications"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              location.pathname === '/intern/notifications'
                ? 'bg-secondary text-on-secondary'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
          </Link>

          <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

          {/* User Profile Chip */}
          <Link
            to="/intern/profile"
            className="flex items-center gap-2 pl-1 hover:opacity-90 transition-opacity"
            title="View Profile"
          >
            <div className="text-right hidden sm:block">
              <div className="font-title-md text-sm text-on-surface leading-tight font-medium">
                {user?.name || 'Intern'}
              </div>
              <div className="font-label-xs-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                {user?.fieldOfStudy || user?.institution || 'Intern'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-xs shadow-sm font-semibold tracking-wider">
              {getInitials(user?.name, 'IN')}
            </div>
          </Link>
        </div>
      </header>

      {/* Collapsible Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-primary/40 backdrop-blur-xs"
            />
            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-[290px] max-w-[85vw] z-50 bg-surface-bright border-r border-outline-variant/30 flex flex-col justify-between p-5 shadow-2xl overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Brand & Close */}
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm font-semibold">
                      TN
                    </div>
                    <div>
                      <div className="font-headline-sm text-lg font-medium text-primary">TaskNest</div>
                      <div className="font-label-xs-caps text-[10px] text-secondary uppercase tracking-widest font-semibold">
                        Intern Portal
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    aria-label="Close menu"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* User Info Card */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-headline-sm text-xs flex items-center justify-center font-semibold tracking-wider shrink-0 shadow-xs">
                    {getInitials(user?.name, 'IN')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-title-md text-xs font-semibold text-primary truncate">
                      {user?.name || 'Intern'}
                    </div>
                    <div className="text-[11px] text-on-surface-variant truncate font-body-sm">
                      {user?.fieldOfStudy || user?.institution || user?.email || 'Intern Fellow'}
                    </div>
                  </div>
                </div>

                {/* Mobile Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, goals... (Enter)"
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-on-surface-variant/70 border border-outline-variant/20 focus:outline-none"
                  />
                </form>

                {/* Navigation Links */}
                <nav className="space-y-1 pt-2">
                  {navLinks.map((item) => {
                    const active = isActive(item.to)
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-label-md transition-all ${
                          active
                            ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Bottom Drawer Actions */}
              <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                <Link
                  to="/intern/profile"
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-label-md transition-all ${
                    location.pathname === '/intern/profile'
                      ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span>My Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-label-md text-error hover:bg-error-container/30 transition-all text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className="md:pl-28 pt-20 sm:pt-24 px-3 sm:px-6 md:px-8 pb-28 md:pb-12 min-h-screen">
        <main className="max-w-[1440px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 sm:left-4 sm:right-4 z-40 bg-surface-bright/95 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(53,51,45,0.12)] border border-outline-variant/30 flex items-center justify-around py-2 px-2">
        {navLinks.map((item) => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-colors ${
                active ? 'bg-secondary text-on-secondary shadow-xs' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </Link>
          )
        })}
        <Link
          to="/intern/profile"
          title="Profile"
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-colors ${
            location.pathname === '/intern/profile'
              ? 'bg-secondary text-on-secondary shadow-xs'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
        </Link>
      </nav>
    </div>
  )
}
