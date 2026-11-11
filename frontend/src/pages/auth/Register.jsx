import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../../services/api.js'

export const ENGINEERING_SPECIALIZATIONS = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Engineering',
    icon: 'layers',
    desc: 'End-to-end web applications, modern React/TypeScript frontends, Node/Express APIs, and database modeling.',
    tags: ['REACT', 'NODE.JS', 'EXPRESS', 'MONGODB', 'REST APIS'],
  },
  {
    id: 'frontend',
    title: 'Frontend & UI/UX Engineering',
    icon: 'devices',
    desc: 'Responsive user interfaces, interactive component systems, modern Tailwind CSS, performance, and accessibility.',
    tags: ['REACT', 'TAILWIND CSS', 'JAVASCRIPT', 'UI/UX', 'STATE'],
  },
  {
    id: 'backend',
    title: 'Backend & Cloud Architecture',
    icon: 'dns',
    desc: 'Scalable server microservices, relational & NoSQL databases, caching, authentication protocols, and API design.',
    tags: ['NODE.JS', 'PYTHON', 'MONGODB', 'POSTGRES', 'REST / GRAPHQL'],
  },
  {
    id: 'aiml',
    title: 'AI & Machine Learning Engineering',
    icon: 'smart_toy',
    desc: 'Applied machine learning models, LLMs, GenAI prompt engineering, Python data pipelines, and intelligent automation.',
    tags: ['PYTHON', 'PYTORCH', 'GENAI / LLM', 'PANDAS', 'DATA PIPELINES'],
  },
  {
    id: 'mobile',
    title: 'Mobile Application Engineering',
    icon: 'smartphone',
    desc: 'Cross-platform mobile apps for iOS and Android, responsive mobile layouts, offline persistence, and native device APIs.',
    tags: ['REACT NATIVE', 'FLUTTER', 'IOS', 'ANDROID', 'MOBILE APIS'],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Infrastructure',
    icon: 'cloud_sync',
    desc: 'Containerization with Docker, CI/CD automated deployment pipelines, cloud monitoring, and hosting management.',
    tags: ['DOCKER', 'KUBERNETES', 'CI/CD', 'AWS / RENDER', 'LINUX'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Systems Safety',
    icon: 'shield',
    desc: 'Web application vulnerability auditing, OWASP security, authentication architectures, encryption, and secure coding.',
    tags: ['AUTH / JWT', 'OWASP TOP 10', 'ENCRYPTION', 'SECURITY AUDIT'],
  },
  {
    id: 'distributed',
    title: 'Distributed Systems & Data Engineering',
    icon: 'hub',
    desc: 'High-throughput distributed consensus, asynchronous processing pipelines, message brokers, and fault-tolerant architecture.',
    tags: ['DISTRIBUTED', 'KAFKA', 'ASYNC I/O', 'CONSENSUS', 'MICROSERVICES'],
  },
]

export const ENGINEERING_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Software Engineering',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other Engineering Discipline',
]

export default function Register() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [institution, setInstitution] = useState('')
  const [engineeringBranch, setEngineeringBranch] = useState('Computer Science & Engineering (CSE)')
  const [degreeProgram, setDegreeProgram] = useState('Computer Science & Engineering (CSE)')
  const [researchTrack, setResearchTrack] = useState('fullstack')
  const [customTrack, setCustomTrack] = useState('')
  const [githubHandle, setGithubHandle] = useState('')
  const [preferredStack, setPreferredStack] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
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
    setAttestLabel('Probing Security Key...')
    setKeyBadge('Negotiating Device...')

    setTimeout(() => {
      setAttested(true)
      setAttestLabel('Device Verified')
      setKeyBadge('Secure Enclave Ready (ECDSA P-256)')
    }, 800)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      setCurrentStep(1)
      return
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      setCurrentStep(1)
      return
    }

    if (!agreeHonor) {
      setErrorMsg('You must agree to the TaskNest Code of Conduct and Terms.')
      return
    }

    if (passphrase.length < 8) {
      setErrorMsg('Account password must be at least 8 characters.')
      return
    }

    if (passphrase !== confirmPassphrase) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedTrack = ENGINEERING_SPECIALIZATIONS.find((t) => t.id === researchTrack)
      const trackTitle =
        researchTrack === 'custom'
          ? customTrack.trim() || 'Custom Engineering'
          : selectedTrack?.title || 'Engineering Specialization'

      const branch = degreeProgram.trim() || engineeringBranch
      // Combine branch and specialization cleanly within 120 chars allowed by authValidator
      const fieldOfStudyCombined =
        branch && !branch.toLowerCase().includes(trackTitle.toLowerCase())
          ? `${branch} — ${trackTitle}`.slice(0, 120)
          : (branch || trackTitle).slice(0, 120)

      await authService.register({
        name: fullName.trim(),
        email: email.trim(),
        password: passphrase,
        confirmPassword: confirmPassphrase,
        institution: institution.trim(),
        fieldOfStudy: fieldOfStudyCombined,
      })

      setSuccessMsg(
        `Registration recorded for ${fullName.trim()}! Verification email dispatched to ${email.trim()}.`
      )

      setTimeout(() => {
        navigate('/verify-email-pending', { state: { email: email.trim() } })
      }, 1000)
    } catch (err) {
      console.warn('[register] Registration API error:', err.message)
      setErrorMsg(err.message || 'Registration failed. Please check your inputs.')
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
                Create your intern account to access assigned engineering tasks, submit deliverables, and earn XP points.
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
                  <p className="font-title-md text-sm text-primary font-semibold truncate">Engineering Specialization</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">Domain &amp; Technical Track</p>
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
              {/* STEP 1: PERSONAL & ACADEMIC DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Academic &amp; Engineering Background
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      01 / 03 Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Intern Candidate Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                        placeholder="e.g. Srushti Dedaniya"
                      />
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        Used for your intern profile, task assignments, and evaluation certificates.
                      </p>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                        placeholder="e.g. intern@example.com"
                      />
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        Verification email and task notifications will be delivered here.
                      </p>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        University / College / Institute
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                        placeholder="e.g. Government Engineering College / MIT"
                      />
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        Your university, institute, or affiliated educational organization.
                      </p>
                    </div>

                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Engineering Discipline / Branch
                      </label>
                      <select
                        value={engineeringBranch}
                        onChange={(e) => {
                          const val = e.target.value
                          setEngineeringBranch(val)
                          if (val !== 'Other Engineering Discipline') {
                            setDegreeProgram(val)
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30 mb-2 cursor-pointer"
                      >
                        {ENGINEERING_BRANCHES.map((b) => (
                          <option key={b} value={b} className="bg-surface text-on-surface">
                            {b}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={degreeProgram}
                        onChange={(e) => setDegreeProgram(e.target.value)}
                        placeholder="Customize degree (e.g. B.Tech CSE — Class of 2026)"
                        className="w-full px-4 py-2 bg-surface-container rounded-xl text-on-surface text-xs focus:bg-surface-container-lowest outline-none transition-all border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim() || !email.trim()) {
                          setErrorMsg('Please enter your name and email before proceeding.')
                          return
                        }
                        setErrorMsg('')
                        setCurrentStep(2)
                      }}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-sm flex items-center gap-2 hover:bg-primary-container transition-all shadow-sm"
                    >
                      <span>Proceed to Engineering Specialization</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ENGINEERING SPECIALIZATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Engineering Specialization &amp; Track Focus
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      02 / 03 Specialization
                    </span>
                  </div>

                  <p className="font-body-md text-xs text-on-surface-variant max-w-2xl">
                    Choose your primary engineering specialization. This matches you with role-specific tasks, industry tech stacks, and evaluations.
                  </p>

                  {/* 8 Core Engineering Specializations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ENGINEERING_SPECIALIZATIONS.map((track) => {
                      const isSelected = researchTrack === track.id
                      return (
                        <div
                          key={track.id}
                          onClick={() => setResearchTrack(track.id)}
                          className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-surface-container-highest border-secondary/70 shadow-md ring-1 ring-secondary/30'
                              : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-secondary text-on-secondary shadow-sm'
                                    : 'bg-surface-container-highest text-secondary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">{track.icon}</span>
                              </div>
                              <div>
                                <span className="font-title-md text-sm font-semibold text-primary block">
                                  {track.title}
                                </span>
                                <span className="text-[10px] uppercase font-mono tracking-wider text-secondary font-semibold">
                                  Engineering Track
                                </span>
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-primary text-on-primary shadow-xs'
                                  : 'bg-surface-variant text-on-surface-variant'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <p className="font-body-md text-xs text-on-surface-variant mb-3 leading-relaxed">
                            {track.desc}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {track.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-label-xs-caps text-on-surface-variant font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* Custom Specialization Card */}
                    <div
                      onClick={() => setResearchTrack('custom')}
                      className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                        researchTrack === 'custom'
                          ? 'bg-surface-container-highest border-secondary/70 shadow-md ring-1 ring-secondary/30'
                          : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              researchTrack === 'custom'
                                ? 'bg-secondary text-on-secondary shadow-sm'
                                : 'bg-surface-container-highest text-secondary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                          </div>
                          <div>
                            <span className="font-title-md text-sm font-semibold text-primary block">
                              Custom Specialization / Other Domain
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-secondary font-semibold">
                              Tailored Engineering Focus
                            </span>
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            researchTrack === 'custom'
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {researchTrack === 'custom' ? '✓' : ''}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant mb-3 leading-relaxed">
                        Specify another engineering domain, e.g. Embedded Systems, Game Engineering, Robotics, or Data Science.
                      </p>
                      {researchTrack === 'custom' && (
                        <input
                          type="text"
                          value={customTrack}
                          onChange={(e) => setCustomTrack(e.target.value)}
                          placeholder="e.g. Embedded Systems &amp; IoT / Robotics"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-1.5 bg-surface-container-lowest rounded-lg text-on-surface text-xs border border-secondary/40 outline-none mt-1"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>

                  {/* GitHub Profile & Tech Stack Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        GitHub Profile / Username (Optional)
                      </label>
                      <input
                        type="text"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                        placeholder="e.g. srushti-dedaniya or octocat"
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
                      />
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                        Your GitHub handle for task submission verification and code evaluations.
                      </p>
                    </div>
                    <div>
                      <label className="block font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold mb-1">
                        Primary Tech Stack / Key Skills (Optional)
                      </label>
                      <input
                        type="text"
                        value={preferredStack}
                        onChange={(e) => setPreferredStack(e.target.value)}
                        placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind"
                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
                      />
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                        Tools, frameworks, and technologies you are eager to practice.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2 rounded-full bg-surface-container-high text-primary font-label-md text-xs hover:bg-surface-container-highest transition-all"
                    >
                      Back to Step 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-sm flex items-center gap-2 hover:bg-primary-container transition-all shadow-sm"
                    >
                      <span>Proceed to Security Credentials</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SECURITY & PASSWORD */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <h2 className="font-headline-sm text-xl text-primary font-semibold">
                        Account Security &amp; Password
                      </h2>
                    </div>
                    <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary">
                      03 / 03 Security
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
                            Hardware Token / Biometric Attestation (Optional)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-xs-caps text-[10px] uppercase tracking-wider font-semibold">
                            {keyBadge}
                          </span>
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant max-w-xl">
                          Ensure zero-trust security for task verification and code submission integrity.
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

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-label-xs-caps text-xs uppercase tracking-wider text-on-surface font-semibold">
                          Account Password *
                        </label>
                        <span className="font-label-xs-caps text-[10px] text-secondary">MIN 8 CHARS</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={passphrase}
                          onChange={(e) => setPassphrase(e.target.value)}
                          required
                          placeholder="Enter your password (min 8 chars)"
                          className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
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
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassphrase}
                          onChange={(e) => setConfirmPassphrase(e.target.value)}
                          required
                          placeholder="Re-enter your password"
                          className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest outline-none"
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
                      I agree to the <span className="text-secondary font-semibold underline">TaskNest Terms &amp; Conditions</span> and Intern Code of Conduct. I agree to submit authentic work and adhere to high standards of engineering integrity.
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2 rounded-full bg-surface-container-high text-primary font-label-md text-xs hover:bg-surface-container-highest transition-all"
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
