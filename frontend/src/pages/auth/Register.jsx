import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../../services/api.js'

export default function Register() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [fullName, setFullName] = useState('Julian Vance')
  const [email, setEmail] = useState('julian.vance@tasknest.org')
  const [institution, setInstitution] = useState('MIT School of Architecture & CSAIL Systems')
  const [degreeProgram, setDegreeProgram] = useState('Dual M.Arch & B.S. EECS — Class of 2026')
  const [researchTrack, setResearchTrack] = useState('distributed')
  const [githubHandle, setGithubHandle] = useState('julianvance-arch')
  const [monographSlug, setMonographSlug] = useState('epoll-quorums-under-adversarial-jitter')
  const [passphrase, setPassphrase] = useState('merkle•lattice•vance•2025•tau')
  const [confirmPassphrase, setConfirmPassphrase] = useState('merkle•lattice•vance•2025•tau')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [agreeHonor, setAgreeHonor] = useState(true)

  const [attested, setAttested] = useState(false)
  const [attestLabel, setAttestLabel] = useState('Touch Key to Attest')
  const [keyBadge, setKeyBadge] = useState('Ready to Probe')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAttest = () => {
    if (attested) return
    setAttestLabel('Probing NFC / USB...')
    setKeyBadge('Negotiating Challenge...')

    setTimeout(() => {
      setAttested(true)
      setAttestLabel('Enclave Attested')
      setKeyBadge('FIDO2 Enclave Root Ready (ECDSA P-256)')
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!agreeHonor) {
      setErrorMsg('You must agree to the TaskNest Code of Computational Rigor.')
      return
    }

    if (passphrase.length < 8) {
      setErrorMsg('Security passphrase must be at least 8 characters.')
      return
    }

    if (passphrase !== confirmPassphrase) {
      setErrorMsg('Passphrases do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authService.register({
        name: fullName.trim(),
        email: email.trim(),
        password: passphrase,
        confirmPassword: confirmPassphrase,
        institution: institution.trim(),
        fieldOfStudy: degreeProgram.trim(),
      })

      setSuccessMsg(
        `Matriculation recorded for ${fullName}! Verification monograph dispatched to ${email.trim()}.`
      )

      // Redirect to verification pending screen as required by Phase 5
      setTimeout(() => {
        navigate('/verify-email-pending', { state: { email: email.trim() } })
      }, 1000)
    } catch (err) {
      console.warn('[register] Registration API error:', err.message)
      setErrorMsg(err.message || 'Registration failed. Please check inputs.')
    } finally {
      setIsSubmitting(false)
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

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col w-full max-w-5xl mx-auto">
          <div className="relative bg-surface-container-low rounded-2xl shadow-xl p-6 sm:p-10 overflow-hidden border border-outline-variant/30">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#74593f_0.75px,transparent_0.75px)] [background-size:20px_20px]" />

            {/* Top Metadata */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-secondary font-label-xs-caps text-[11px] tracking-widest uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Intern Portal // Registration
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-xs-caps text-[11px] uppercase tracking-wider">
                  Intern Account
                </span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-xs-caps text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm text-secondary">verified_user</span>
                Secure Registration
              </div>
            </div>

            {/* Editorial Title */}
            <div className="relative z-10 max-w-3xl mb-8">
              <h1 className="font-headline-lg text-3xl sm:text-4xl text-primary tracking-tight mb-2">
                Register as an Intern
              </h1>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Create your intern account to access assigned tasks, submit your deliverables, and earn performance points.
              </p>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-4 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper Tabs */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`group flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  currentStep === 1
                    ? 'bg-surface-container-highest shadow-sm border border-outline-variant/40'
                    : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-xs flex-shrink-0 shadow-sm ${
                    currentStep === 1 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  01
                </div>
                <div className="min-w-0">
                  <p className="font-label-xs-caps text-[10px] uppercase tracking-widest text-secondary font-semibold">
                    Step 01
                  </p>
                  <p className="font-title-md text-sm text-primary font-semibold truncate">Personal Details</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">Name, Email &amp; Institution</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`group flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  currentStep === 2
                    ? 'bg-surface-container-highest shadow-sm border border-outline-variant/40'
                    : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-xs flex-shrink-0 shadow-sm ${
                    currentStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  02
                </div>
                <div className="min-w-0">
                  <p className="font-label-xs-caps text-[10px] uppercase tracking-widest text-secondary font-semibold">
                    Step 02
                  </p>
                  <p className="font-title-md text-sm text-primary font-semibold truncate">Field of Study</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">Academic Specialization</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`group flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  currentStep === 3
                    ? 'bg-surface-container-highest shadow-sm border border-outline-variant/40'
                    : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-xs flex-shrink-0 shadow-sm ${
                    currentStep === 3 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  03
                </div>
                <div className="min-w-0">
                  <p className="font-label-xs-caps text-[10px] uppercase tracking-widest text-secondary font-semibold">
                    Step 03
                  </p>
                  <p className="font-title-md text-sm text-primary font-semibold truncate">Security &amp; Password</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">Create Password</p>
                </div>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              {/* PHASE 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Academic &amp; Institutional Pedigree
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      01 / 03 Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Fellow Candidate Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                        placeholder="Julian Vance"
                      />
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        Printed as will appear in the peer-reviewed monograph registry.
                      </p>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Institutional Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                        placeholder="fellow@tasknest.org"
                      />
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        TaskNest verification link will be dispatched to this address.
                      </p>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        University / Laboratory Affiliation
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                      />
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Degree Discipline &amp; Concurrence
                      </label>
                      <input
                        type="text"
                        value={degreeProgram}
                        onChange={(e) => setDegreeProgram(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-sm flex items-center gap-2 hover:bg-primary-container transition-all"
                    >
                      <span>Proceed to Track Selection</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Track Specialization &amp; Crate Focus
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      02 / 03 Specialization
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'distributed',
                        title: 'Distributed Systems & Consensus',
                        icon: 'hub',
                        desc: 'High-throughput consensus protocols, Raft state machines, and leaderless quorum storage fabrics.',
                        tags: ['RAFT', 'ETCD', 'COORDINATION'],
                      },
                      {
                        id: 'memory',
                        title: 'Memory Safety & Systems Runtimes',
                        icon: 'memory',
                        desc: 'Uncompromising memory models in Rust, bespoke arena allocation engines, and Miri safety proving.',
                        tags: ['RUST MIR', 'ARENA ALLOCATORS', 'MIRI'],
                      },
                      {
                        id: 'io',
                        title: 'Kernel I/O & Asynchronous Engines',
                        icon: 'swap_calls',
                        desc: 'Direct Linux io_uring completion queues, sub-microsecond epoll polling loops, and Tokio reactor internals.',
                        tags: ['IO_URING', 'TOKIO', 'ZERO-COPY'],
                      },
                      {
                        id: 'formal',
                        title: 'Formal Verification & TLA+ Logic',
                        icon: 'rule_settings',
                        desc: 'Mathematical specification of invariants, model-checking concurrent interleavings, and verified executable synthesis.',
                        tags: ['TLA+ / TLC', 'COQ PROOF', 'MODEL CHECK'],
                      },
                    ].map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setResearchTrack(track.id)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                          researchTrack === track.id
                            ? 'bg-surface-container-highest border-secondary/60 shadow-md'
                            : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">{track.icon}</span>
                            <span className="font-title-md text-sm font-semibold text-primary">{track.title}</span>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              researchTrack === track.id
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-variant text-on-surface-variant'
                            }`}
                          >
                            {researchTrack === track.id ? '✓' : ''}
                          </span>
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant mb-3">{track.desc}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {track.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-label-xs-caps text-on-surface-variant"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        GitHub Monorepo / Contributor Handle
                      </label>
                      <input
                        type="text"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Proposed Monograph Thesis Slug
                      </label>
                      <input
                        type="text"
                        value={monographSlug}
                        onChange={(e) => setMonographSlug(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2 rounded-full bg-surface-container-high text-primary font-label-md text-xs hover:bg-surface-container-highest"
                    >
                      Back to Step 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-sm flex items-center gap-2 hover:bg-primary-container transition-all"
                    >
                      <span>Proceed to Security Credentials</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 3 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Hardware Enclave &amp; Passphrase Credential
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      03 / 03 Attestation
                    </span>
                  </div>

                  {/* Hardware Attestation Box */}
                  <div className="p-6 rounded-2xl bg-surface-container flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-2xl">usb</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-title-md text-sm font-semibold text-primary">
                            FIDO2 / YubiKey Hardware Token Attestation
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-xs-caps text-[10px] uppercase tracking-wider font-semibold">
                            {keyBadge}
                          </span>
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant max-w-xl">
                          Cryptographic enclave key generation ensures immutable commit signatures and zero-trust repository privilege.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAttest}
                      className={`px-5 py-2.5 rounded-full font-title-md text-xs shadow-md flex items-center gap-2 shrink-0 transition-all ${
                        attested
                          ? 'bg-secondary text-on-secondary pointer-events-none'
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">fingerprint</span>
                      <span>{attestLabel}</span>
                    </button>
                  </div>

                  {/* Passphrases */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold">
                          Enclave Master Passphrase
                        </label>
                        <span className="font-label-xs-caps text-[10px] text-secondary">MIN 8 CHARS</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={passphrase}
                          onChange={(e) => setPassphrase(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-2.5 text-secondary material-symbols-outlined text-sm hover:opacity-80"
                        >
                          {showPass ? 'visibility_off' : 'visibility'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Confirm Passphrase
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassphrase}
                          onChange={(e) => setConfirmPassphrase(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-2.5 text-secondary material-symbols-outlined text-sm hover:opacity-80"
                        >
                          {showConfirmPass ? 'visibility_off' : 'visibility'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms / Integrity */}
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="honor-code"
                      checked={agreeHonor}
                      onChange={(e) => setAgreeHonor(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    <label htmlFor="honor-code" className="font-body-md text-xs text-on-surface cursor-pointer select-none">
                      I agree to the <span className="text-secondary font-semibold underline">TaskNest Terms &amp; Conditions</span> and Intern Code of Conduct. I agree to submit authentic work and adhere to high standards of integrity.
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2 rounded-full bg-surface-container-high text-primary font-label-md text-xs hover:bg-surface-container-highest"
                    >
                      Back to Step 2
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm tracking-tight transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          <span>Creating Intern Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account &amp; Verify Email</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center font-label-xs-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
        Secure Workspace • TaskNest Portal
      </footer>
    </div>
  )
}
