import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || null

  const [role, setRole] = useState('intern')
  const [email, setEmail] = useState('julian.vance@tasknest.org')
  const [password, setPassword] = useState('Password@123')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Unverified account handling
  const [isUnverified, setIsUnverified] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const handleRoleSelect = (r) => {
    setRole(r)
    setIsUnverified(false)
    setError('')
    if (r === 'intern') {
      setEmail('julian.vance@tasknest.org')
      setPassword('Password@123')
    } else {
      setEmail('admin@tasknest.org')
      setPassword('Admin@12345')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please provide institutional email and security passphrase.')
      return
    }

    setLoading(true)
    setError('')
    setIsUnverified(false)
    setResendStatus('')

    try {
      const res = await authService.login({ email, password })
      if (res?.user) {
        login(res.user, res.token)
        if (res.user.role === 'admin') {
          navigate(from || '/admin/dashboard')
        } else {
          navigate(from || '/intern/dashboard')
        }
        return
      }
    } catch (err) {
      console.warn('[login] API attempt result:', err.message)

      // Handle unverified account explicitly as required by Phase 4 & 5
      if (err.data?.code === 'EMAIL_NOT_VERIFIED' || err.status === 403 || err.message?.includes('verification')) {
        setIsUnverified(true)
        setError(err.message || 'Your institutional email is pending verification.')
        return
      }

      if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
        setError('Cannot reach the TaskNest server. Please make sure the backend is running.')
        return
      }

      setError(err.message || 'Invalid email or passphrase credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendFromLogin = async () => {
    setResendStatus('dispatching')
    try {
      await authService.resendVerification({ email })
      setResendStatus('dispatched')
      setTimeout(() => {
        navigate('/verify-email-pending', { state: { email } })
      }, 1000)
    } catch (err) {
      setResendStatus('error')
      setError(err.message || 'Failed to dispatch verification email.')
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="w-full py-6 flex justify-between items-center px-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-sm">
            T
          </div>
          <span className="font-headline-sm text-2xl text-primary tracking-tight font-medium">
            TaskNest
          </span>
          <span className="font-label-xs-caps text-[10px] text-secondary uppercase tracking-widest hidden sm:inline">
            Identity Access
          </span>
        </Link>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/register"
            className="px-3 py-1.5 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-xs-caps text-xs uppercase tracking-wider transition-all border border-outline-variant/30"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl bg-surface-bright border border-outline-variant/30 min-h-[600px]">
            {/* Left Architectural Monograph Panel */}
            <div className="lg:col-span-5 relative flex flex-col justify-between p-8 md:p-10 bg-surface-container overflow-hidden min-h-[300px] lg:min-h-full">
              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-25"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtet-rDiOAfgkDpzxyFWZxSohdrS773Tv6HZulDLmtq-BmghpaQmXe76_aECW5Tg-Nh5vUgh-loAcMqMh09mdcrpDP6YO4XZbRif4f2oGqLmz9VDm-1D555SGX5bn45fq1U19v7on8TRqnK4EOH_0nFZmET-PSne6DLU_mGXtDtbEcebH9T5TO0E7ah9oRzAXpz7aZHzTvBrPDX9D-3TB4XaxsskOtfJsCLbEiEEYY')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/70 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-label-xs-caps text-[10px] text-secondary px-3 py-1 rounded-full bg-surface-container-high font-semibold uppercase tracking-wider">
                  Enclave Node 09
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary" />
              </div>

              <div className="relative z-10 space-y-4 my-auto py-8">
                <span className="font-label-xs-caps text-[11px] text-secondary uppercase tracking-[0.2em] font-semibold">
                  Architectural Fellowship Portal
                </span>
                <h2 className="font-headline-lg text-3xl md:text-4xl text-primary font-normal leading-tight">
                  Where Rigor Meets Distributed Systems.
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant max-w-sm">
                  Access assigned sprint tasks, dispatch verified monographs, and track your performance standing across cohorts.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant font-label-xs-caps uppercase tracking-wider">
                <span>TaskNest Protocol</span>
                <span>v2.4 Production</span>
              </div>
            </div>

            {/* Right Authentication Form Panel */}
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div>
                <h1 className="font-headline-lg text-3xl md:text-4xl text-primary font-normal">
                  Welcome back
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Authenticate your fellowship credentials to enter your workspace.
                </p>
              </div>

              {/* Role Toggle Selector */}
              <div className="flex p-1 rounded-full bg-surface-container border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('intern')}
                  className={`flex-1 py-2 px-4 rounded-full font-label-md text-xs sm:text-sm transition-all text-center ${
                    role === 'intern'
                      ? 'bg-surface-bright text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Intern Fellow
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex-1 py-2 px-4 rounded-full font-label-md text-xs sm:text-sm transition-all text-center ${
                    role === 'admin'
                      ? 'bg-surface-bright text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Faculty / Admin
                </button>
              </div>

              {/* Unverified Account Warning Box */}
              {isUnverified && (
                <div className="p-4 rounded-2xl bg-secondary-container/80 border border-secondary/40 text-on-secondary-container space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
                      mark_email_unread
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-secondary font-label-xs-caps">
                        Institutional Email Verification Pending
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Your account has not completed cryptographic email verification. You must attest your address before accessing the fellowship atelier.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={resendStatus === 'dispatching'}
                      onClick={handleResendFromLogin}
                      className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-label-md hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      {resendStatus === 'dispatching' ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                          <span>Dispatching...</span>
                        </>
                      ) : resendStatus === 'dispatched' ? (
                        <>
                          <span className="material-symbols-outlined text-xs">check</span>
                          <span>Dispatched! Opening Pending...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">send</span>
                          <span>Resend Verification Monograph</span>
                        </>
                      )}
                    </button>
                    <Link
                      to={`/verify-email-pending?email=${encodeURIComponent(email)}`}
                      className="text-xs text-secondary hover:underline font-label-md"
                    >
                      Open Verification Portal →
                    </Link>
                  </div>
                </div>
              )}

              {error && !isUnverified && (
                <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1"
                  >
                    Institutional Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      alternate_email
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold"
                    >
                      Passphrase / Security Token
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-secondary hover:underline font-label-md"
                    >
                      Forgot passphrase?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      key
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span className="text-xs text-on-surface-variant">
                      Remember session for 30 days
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-title-md text-sm hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Authenticate &amp; Enter</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Registration Prompt */}
              <div className="pt-4 border-t border-outline-variant/20 text-center">
                <p className="text-xs text-on-surface-variant mb-3">
                  Don't possess an active fellowship matriculation token?
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-label-md text-primary transition-colors border border-outline-variant/30"
                >
                  <span>Matriculate / Request Registration</span>
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center font-label-xs-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
        Secure Workspace • Editorial Monograph Protocol
      </footer>
    </div>
  )
}
