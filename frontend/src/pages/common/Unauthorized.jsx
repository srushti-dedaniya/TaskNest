import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'

export default function Unauthorized() {
  const { user } = useAuth()
  const home = user?.role === 'admin' ? '/admin/dashboard' : '/intern/dashboard'

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col">
      <header className="h-20 w-full px-margin flex items-center justify-between shadow-[0_1px_8px_rgba(53,51,45,0.04)] sticky top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl">
        <div className="flex items-center gap-space-md">
          <span className="font-headline-md text-headline-md tracking-tight text-primary font-medium">TaskNest</span>
          <span className="px-space-sm py-space-xs rounded-full bg-error-container text-on-error-container font-label-xs-caps text-label-xs-caps uppercase">Access Control</span>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col items-center justify-center py-space-xl px-gutter">
        <section className="w-full max-w-[1100px] mx-auto flex flex-col gap-space-lg items-center text-center">
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase tracking-widest">Errno: 0x0F03 &middot; Clearance Denied</span>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">This registry requires a higher clearance.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Your credential set does not satisfy the role binding for this workspace. Return to your own dispatch console, or contact faculty systems if this is an error.
          </p>
          <div className="flex flex-col sm:flex-row gap-space-md">
            <Link to={home} className="py-space-sm px-space-lg rounded-full bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md inline-flex items-center justify-center gap-space-sm">
              <span>Back to my console</span>
              <span className="material-symbols-outlined text-title-md">arrow_forward</span>
            </Link>
            <Link to="/" className="py-space-sm px-space-lg rounded-full bg-surface-container-high text-on-surface font-title-md text-title-md hover:bg-surface-container-highest transition-all inline-flex items-center justify-center gap-space-sm">
              <span>Landing registry</span>
            </Link>
          </div>
          <blockquote className="font-headline-sm text-headline-sm italic font-serif text-primary pt-space-md">
            &ldquo;Every credential is scoped &mdash; no key opens every door.&rdquo;
          </blockquote>
        </section>
      </main>
      <footer className="w-full h-16 px-margin flex items-center justify-between border-t border-surface-container-high bg-surface/60 backdrop-blur-xl">
        <div className="flex items-center gap-space-sm font-label-xs-caps text-label-xs-caps uppercase text-outline">
          <span className="w-1.5 h-1.5 rounded-full bg-outline inline-block"></span>RBAC Guard &middot; Role Binding Active
        </div>
        <div className="font-label-xs-caps text-label-xs-caps uppercase text-outline">&copy; 2026 TaskNest Kernel Space</div>
      </footer>
    </div>
  )
}
