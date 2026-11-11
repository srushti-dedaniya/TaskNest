import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { PageTransition } from '../components/common/Motion.jsx'

export default function AuthLayout({ children }) {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Header */}
      <header className="w-full py-6 px-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-lg shadow-sm group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-sm text-2xl text-primary font-medium tracking-tight">TaskNest</span>
            <span className="font-label-xs-caps text-[10px] text-secondary uppercase tracking-widest hidden sm:inline">
              Internship Portal
            </span>
          </div>
        </Link>

        {/* Register shortcut */}
        <Link
          to="/register"
          className="px-3 py-1.5 rounded-full bg-surface-container-high/70 border border-outline-variant/30 text-xs font-label-xs-caps uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
        >
          Register
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-8">
        <div className="w-full max-w-5xl mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center font-label-xs-caps text-[11px] text-on-surface-variant uppercase tracking-widest border-t border-outline-variant/20">
        TaskNest • Task Management &amp; Intern Performance Portal
      </footer>
    </div>
  )
}
