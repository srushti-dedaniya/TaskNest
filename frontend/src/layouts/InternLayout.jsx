import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function InternLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span className="absolute left-16 px-2.5 py-1 bg-primary text-on-primary rounded font-label-xs-caps text-[11px] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
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
      <header className="fixed top-4 left-4 right-4 md:left-32 md:right-8 h-16 z-30 bg-surface-bright/80 backdrop-blur-xl rounded-full shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] border border-outline-variant/30 flex items-center justify-between px-6">
        {/* Left: Brand + Role Badge */}
        <div className="flex items-center gap-3">
          <Link to="/intern/dashboard" className="flex items-baseline gap-1">
            <span className="font-headline-sm text-2xl tracking-tight text-primary font-medium">TaskNest</span>
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
        <div className="flex items-center gap-3">
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-xs shadow-sm">
              {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'IN')}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Viewport */}
      <div className="md:pl-28 pt-24 px-4 md:px-8 pb-24 min-h-screen">
        <main className="max-w-[1440px] mx-auto w-full">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-surface-bright/90 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(53,51,45,0.12)] border border-outline-variant/30 flex items-center justify-around py-2 px-3">
        {navLinks.map((item) => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
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
