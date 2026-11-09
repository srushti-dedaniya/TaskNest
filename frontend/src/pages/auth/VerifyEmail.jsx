import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const queryStatus = searchParams.get('status')
  const queryError = searchParams.get('error')
  const queryEmail = searchParams.get('email') || ''

  const navigate = useNavigate()
  const { login } = useAuth()

  const [status, setStatus] = useState(queryStatus === 'success' ? 'success' : 'validating') // 'validating' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [user, setUser] = useState(null)
  const [countdown, setCountdown] = useState(3)

  // Resend state for failed/expired tokens
  const [resendEmail, setResendEmail] = useState(queryEmail)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    // If backend already verified via GET redirect
    if (queryStatus === 'success') {
      setStatus('success')
      const queryJwt = searchParams.get('jwt')
      if (queryJwt) {
        localStorage.setItem('tasknest_token', queryJwt)
      }
      authService.me().then((res) => {
        if (res?.user) {
          setUser(res.user)
          login(res.user, queryJwt || null)
        }
      }).catch(() => {})
      return
    }

    if (queryError) {
      setStatus('error')
      if (queryError === 'expired_token') {
        setErrorMessage('The verification challenge has expired. Please request a new verification monograph below.')
      } else if (queryError === 'missing_token') {
        setErrorMessage('No verification token provided in the challenge URL.')
      } else {
        setErrorMessage('This verification link is invalid or has already been consumed.')
      }
      return
    }

    async function executeVerification() {
      if (!token) {
        setStatus('error')
        setErrorMessage('No verification token provided in the challenge URL.')
        return
      }

      try {
        const res = await authService.verifyEmail({ token: token.trim() })
        setStatus('success')
        if (res.user) {
          setUser(res.user)
          if (res.token) {
            login(res.user, res.token)
          }
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage(
          err.message ||
            'The verification token is invalid, expired, or has already been consumed. Please request a new verification challenge.'
        )
      }
    }

    executeVerification()
  }, [token, queryStatus, queryError])

  // Automatic redirect countdown on successful verification
  useEffect(() => {
    let timer
    if (status === 'success' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    } else if (status === 'success' && countdown <= 0) {
      navigate('/intern/dashboard')
    }
    return () => clearTimeout(timer)
  }, [status, countdown, navigate])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail.trim()) return

    setResending(true)
    setResendMsg('')
    setResendError('')

    try {
      const res = await authService.resendVerification({ email: resendEmail.trim() })
      setResendMsg(res.message || 'A fresh verification monograph has been dispatched to your institutional inbox.')
    } catch (err) {
      setResendError(err.message || 'Failed to dispatch verification email.')
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <div className="relative rounded-3xl bg-surface-bright shadow-2xl p-8 sm:p-12 border border-outline-variant/30 overflow-hidden text-center space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />

            {/* VALIDATING STATE */}
            {status === 'validating' && (
              <div className="py-8 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
                    progress_activity
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-medium">
                  Attesting Enclave Credentials...
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant max-w-md mx-auto">
                  Validating cryptographic token against the TaskNest fellowship ledger.
                </p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-secondary">
                    verified
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-label-xs-caps text-xs uppercase tracking-[0.2em] text-secondary font-semibold">
                    Attestation Complete // Cleared
                  </span>
                  <h1 className="font-headline-lg text-3xl sm:text-4xl text-primary font-medium">
                    Institutional Email Verified
                  </h1>
                  <p className="font-body-md text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    Fellow candidate clearance confirmed. Your enclave credentials and sprint workspace are now unlocked.
                  </p>
                </div>

                {user && (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 inline-block text-left text-xs space-y-1">
                    <p className="font-semibold text-primary">{user.name}</p>
                    <p className="text-on-surface-variant font-mono">{user.email}</p>
                    <p className="text-secondary font-label-xs-caps uppercase text-[10px] font-bold">Clearance: Intern Fellow</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-secondary font-label-xs-caps uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Redirecting to atelier workspace in {countdown}s...</span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/intern/dashboard"
                    className="w-full py-4 px-8 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm transition-all shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <span>Enter Fellow Atelier Workspace Now</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ERROR / EXPIRED STATE */}
            {status === 'error' && (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-error-container text-on-error-container flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-error">
                    sync_problem
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-label-xs-caps text-xs uppercase tracking-[0.2em] text-error font-semibold">
                    Attestation Failed // Invalid Challenge
                  </span>
                  <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-medium">
                    Verification Link Expired or Invalid
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    {errorMessage}
                  </p>
                </div>

                {/* Inline Resend Form */}
                <div className="pt-4 border-t border-outline-variant/20 space-y-3 text-left">
                  <h3 className="font-title-md text-sm text-primary font-semibold">
                    Request a Fresh Verification Monograph
                  </h3>

                  {resendMsg && (
                    <div className="p-3.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
                      <span>{resendMsg}</span>
                    </div>
                  )}

                  {resendError && (
                    <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{resendError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResend} className="space-y-3">
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="institutional@university.edu"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="w-full py-3 px-6 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {resending ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span>Dispatch New Verification Link</span>
                          <span className="material-symbols-outlined text-sm">send</span>
                        </>
                      )}
                    </button>
                  </form>
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
            )}
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

