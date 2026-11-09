import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/api.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token.trim()) {
      setError('Please provide the reset token from your email.')
      return
    }

    if (password.length < 8) {
      setError('Passphrase must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passphrases do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await authService.resetPassword({
        token: token.trim(),
        password
      })
      setSuccess(res.message || 'Passphrase updated successfully. Redirecting to sign in...')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      setError(err.message || 'Failed to rotate key. The token may be expired or invalid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
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

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col w-full max-w-5xl mx-auto my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl bg-surface-container-low border border-outline-variant/30">
            {/* Left Monolith Side */}
            <div className="lg:col-span-5 relative flex flex-col justify-between p-8 sm:p-12 bg-surface-container overflow-hidden min-h-[320px] lg:min-h-full">
              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-25"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtet-rDiOAfgkDpzxyFWZxSohdrS773Tv6HZulDLmtq-BmghpaQmXe76_aECW5Tg-Nh5vUgh-loAcMqMh09mdcrpDP6YO4XZbRif4f2oGqLmz9VDm-1D555SGX5bn45fq1U19v7on8TRqnK4EOH_0nFZmET-PSne6DLU_mGXtDtbEcebH9T5TO0E7ah9oRzAXpz7aZHzTvBrPDX9D-3TB4XaxsskOtfJsCLbEiEEYY')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/70 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-label-xs-caps text-xs text-secondary px-3 py-1 rounded-full bg-surface-container-high font-semibold">
                  ENCLAVE SEC-256
                </span>
              </div>

              <div className="relative z-10 my-auto py-8">
                <div className="p-6 rounded-2xl bg-surface-bright/80 backdrop-blur-md shadow-md space-y-3 max-w-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="font-label-xs-caps text-[11px] text-on-surface-variant tracking-widest uppercase">
                      CREDENTIAL PROFILE • KEY ROTATION
                    </span>
                    <span className="material-symbols-outlined text-secondary text-xl">key</span>
                  </div>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Reset tokens are single-use and expire after 30 minutes. Once consumed, the token is automatically purged.
                  </p>
                </div>
              </div>

              <div className="relative z-10 space-y-1">
                <p className="font-headline-sm text-lg text-primary italic leading-snug">
                  "A secure key is quietly rotated, never merely misplaced."
                </p>
                <p className="font-label-xs-caps text-[10px] text-secondary tracking-widest uppercase">
                  TaskNest Security Codex // Folio 12
                </p>
              </div>
            </div>

            {/* Right Form Side */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-surface-bright">
              <div className="max-w-md w-full mx-auto space-y-6">
                <div className="space-y-1">
                  <span className="font-label-xs-caps text-xs text-secondary tracking-widest uppercase font-semibold block">
                    Secure Re-Entry Point
                  </span>
                  <h1 className="font-headline-lg text-3xl text-primary tracking-tight font-medium">
                    Reset Passphrase
                  </h1>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Provide your verification token and designate a new passphrase.
                  </p>
                </div>

                {success && (
                  <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-secondary">check_circle</span>
                    <span>{success}</span>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label
                      className="font-label-md text-xs text-primary flex items-center justify-between"
                      htmlFor="reset-token"
                    >
                      <span className="font-semibold">Reset Token</span>
                      <span className="font-label-xs-caps text-[10px] text-secondary uppercase tracking-wider">
                        Single Use
                      </span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                        password
                      </span>
                      <input
                        id="reset-token"
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste cryptographic token from email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container text-primary font-mono text-xs placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-high border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-md text-xs font-semibold text-primary" htmlFor="reset-password">
                      New Passphrase
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                        lock
                      </span>
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container text-primary text-xs placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-high border border-outline-variant/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      className="font-label-md text-xs font-semibold text-primary"
                      htmlFor="reset-confirm-password"
                    >
                      Confirm New Passphrase
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                        lock
                      </span>
                      <input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter passphrase"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container text-primary text-xs placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-high border border-outline-variant/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-title-md text-xs uppercase tracking-wider hover:bg-primary-container active:scale-[0.99] transition-all duration-200 shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        <span>Rotating Key...</span>
                      </>
                    ) : (
                      <>
                        <span>Rotate Key &amp; Confirm</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center font-body-sm text-xs text-on-surface-variant pt-2">
                  Remembered it after all?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center font-label-xs-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
        Secure Workspace • Editorial Monograph Protocol
      </footer>
    </div>
  )
}
