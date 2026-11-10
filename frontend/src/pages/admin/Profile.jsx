import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/api.js'

export default function FacultyProfile() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState(user?.institution || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setInstitution(user.institution || '')
      setBio(user.bio || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Full name cannot be blank.')
      return
    }

    if (newPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.')
        return
      }
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.')
        return
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        institution: institution.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || name.trim().slice(0, 2).toUpperCase()
      }

      if (newPassword && currentPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const res = await authService.updateProfile(payload)
      if (res?.user) {
        updateUser(res.user)
      }
      setSuccessMsg('Faculty profile successfully updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/dashboard"
              className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
              Faculty Profile
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Faculty Profile
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Manage your personal profile, institutional affiliation, and faculty credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/settings"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Settings</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card & Info (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-6">
            <h3 className="font-headline-sm text-xl text-primary font-medium">Personal Information</h3>

            {/* Avatar & Display Name preview */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary font-headline-sm text-xl flex items-center justify-center font-bold shadow-sm shrink-0">
                {avatar || (name ? name.slice(0, 2).toUpperCase() : 'FC')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-base text-primary truncate">{name || 'Faculty Member'}</div>
                <div className="text-xs text-on-surface-variant font-mono">{user?.email}</div>
                <div className="text-[11px] text-secondary font-semibold uppercase mt-0.5">Faculty / Admin</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-medium"
                  placeholder="e.g. Elena Rostova"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-11 px-4 rounded-xl bg-surface-container text-sm text-on-surface-variant/80 border border-outline-variant/20 cursor-not-allowed font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                    Institution / Department
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                    placeholder="e.g. Department of Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                    Avatar Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm font-mono text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest uppercase"
                    placeholder="ER"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Faculty Bio / About
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                  placeholder="Share a brief bio about your academic background or internship supervision focus..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password & Save (Col-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Change Password</h3>
            <p className="text-xs text-on-surface-variant">
              Leave these fields blank if you do not wish to change your password.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                  placeholder="Min 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-6 rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

