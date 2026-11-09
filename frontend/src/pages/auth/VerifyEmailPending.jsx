import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../../services/api.js'

export default function VerifyEmailPending() {
  const location = useLocation()
  const initialEmail = location.state?.email || new URLSearchParams(location.search).get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async (e) => {
    e?.preventDefault()
    if (!email.trim() || cooldown > 0) return

    setResending(true)
    setMessage('')
    setError('')

    try {
      const res = await authService.resendVerification({ email: email.trim() })
      setMessage(res.message || 'A fresh verification monograph has been dispatched to your institutional inbox.')
      setCooldown(60)
    } catch (err) {
      if (err.data?.code === 'RESEND_COOLDOWN' || err.status === 429) {
        const retryAfter = err.data?.retryAfter || 60
        setCooldown(retryAfter)
        setError(`Please wait ${retryAfter} seconds before requesting another email.`)
      } else {
        setError(err.message || 'Failed to dispatch verification email.')
      }
    } finally {
      setResending(false)
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
          <span className="font-headline-sm text-2xl text-primary tracking-tight font-medium">TaskNest</span>
          <span className="font-label-xs-caps text-[10px] text-secondary uppercase tracking-widest hidden sm:inline">
            Identity Access
          </span>
        </Link>
        <Link
          to="/login"
          className="px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-xs-caps text-xs uppercase tracking-wider transition-all border border-outline-variant/30"
        >
          Sign In ⚡
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <div className="relative rounded-3xl bg-surface-bright shadow-2xl p-8 sm:p-12 border border-outline-variant/30 overflow-hidden text-center space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />

            {/* Emblem Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-4xl text-secondary animate-pulse">
                mark_email_unread
              </span>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2">
              <span className="font-label-xs-caps text-xs uppercase tracking-[0.2em] text-secondary font-semibold">
                Matriculation Step 02 // Enclave Attestation
              </span>
              <h1 className="font-headline-lg text-3xl sm:text-4xl text-primary tracking-tight font-medium">
                Verify Institutional Email
              </h1>
              <p className="font-body-md text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                A single-use cryptographic verification monograph was transmitted to your address. Click the link in your email to authenticate your fellowship clearance.
              </p>
            </div>

            {/* Target Address Card */}
            {email && (
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 inline-flex items-center gap-2 max-w-md mx-auto">
                <span className="material-symbols-outlined text-secondary text-base">alternate_email</span>
                <span className="font-mono text-xs text-primary font-semibold truncate">{email}</span>
              </div>
            )}

            {/* Success and Error Feedback */}
            {message && (
              <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-lg text-secondary">check_circle</span>
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Resend Control */}
            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <p className="text-xs text-on-surface-variant">
                Didn't receive the dispatch? Check spam folders or request a new cryptographic challenge.
              </p>

              {!initialEmail && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your institutional email"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none mb-2"
                />
              )}

              <button
                type="button"
                disabled={resending || cooldown > 0 || !email}
                onClick={handleResend}
                className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Dispatching Monograph...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    <span>Resend Available in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Resend Verification Monograph</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs text-secondary hover:text-primary transition-colors font-label-md inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Return to Atelier Sign In</span>
              </Link>
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

