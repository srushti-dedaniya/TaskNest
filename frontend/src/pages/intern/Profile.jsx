import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/api.js'
import { MOCK_INTERN } from '../../mock/mockData.js'
export default function Profile() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || MOCK_INTERN.name)
  const [email, setEmail] = useState(user?.email || MOCK_INTERN.email)
  const [focusArea, setFocusArea] = useState(user?.fieldOfStudy || 'Distributed Consensus Engines & Formal Verification')
  const [bio, setBio] = useState(
    user?.bio ||
      'Undergraduate fellow specializing in distributed systems, consensus engines, and formal cryptographic protocol verification.'
  )
  const [institution, setInstitution] = useState(user?.institution || 'MIT Laboratory for Computer Science')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setSaved(false)

    try {
      const res = await authService.updateProfile({
        name,
        bio,
        fieldOfStudy: focusArea,
        institution
      })
      if (res.user) {
        updateUser(res.user)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.warn('[Profile] API update failed:', err.message)
      setSaveError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold">
              Intern Portal // Profile
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Intern Profile
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Manage your profile details, field of study, institution, and personal information.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <span className="px-4 py-2 rounded-full bg-surface-container font-label-xs-caps text-xs text-secondary font-semibold uppercase">
            Intern Active
          </span>
        </div>
      </section>

      {saved && (
        <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* Grid: Profile Card + Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Identity Card */}
        <div className="lg:col-span-4 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-lg text-3xl shadow-md mb-4 border-4 border-surface-container">
              {user?.avatar || MOCK_INTERN.avatar}
            </div>
            <h3 className="font-headline-sm text-2xl text-primary font-medium">{name}</h3>
            <span className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold mt-1">
              {MOCK_INTERN.tier} · {MOCK_INTERN.rank}
            </span>
            <p className="text-xs text-on-surface-variant mt-2">{email}</p>
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-xs-caps text-[10px] font-bold uppercase tracking-wider border ${
                  user?.isEmailVerified !== false
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {user?.isEmailVerified !== false ? 'verified' : 'pending'}
                </span>
                <span>{user?.isEmailVerified !== false ? 'Email Verified' : 'Verification Pending'}</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low space-y-3 border border-outline-variant/20 text-xs">
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-label-xs-caps uppercase">Batch:</span>
              <span className="font-semibold text-primary">{MOCK_INTERN.batch}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-label-xs-caps uppercase">Total XP:</span>
              <span className="font-bold text-secondary">{user?.points ?? 0} XP</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-label-xs-caps uppercase">First Pass:</span>
              <span className="font-semibold text-primary">{MOCK_INTERN.firstPassRate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-on-surface-variant font-label-xs-caps uppercase">Faculty Advisor:</span>
              <span className="font-semibold text-primary">Elena Rostova</span>
            </div>
          </div>

          <div>
            <h4 className="font-label-xs-caps text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">
              Verified Honors &amp; Monographs
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-container flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  military_tech
                </span>
                <span className="text-xs text-on-surface font-medium">
                  Raft Leader Consensus State Pass
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  menu_book
                </span>
                <span className="text-xs text-on-surface font-medium">
                  TLS 1.3 Cipher Monograph Index
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profile Edit Form */}
        <div className="lg:col-span-8 bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
          <h3 className="font-headline-sm text-xl text-primary font-medium">Profile Settings</h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className="w-full h-11 px-4 rounded-xl bg-surface-container/60 text-sm text-on-surface-variant border border-outline-variant/30 cursor-not-allowed"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Email address cannot be changed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Field of Study / Specialization
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Computer Science, Full-Stack Development"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University / College"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Bio / About Me
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full p-4 rounded-2xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full bg-primary text-on-primary font-title-md text-sm hover:bg-primary-container transition-all shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
