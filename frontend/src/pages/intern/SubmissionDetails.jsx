import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { submissionService } from '../../services/api.js'

export default function SubmissionDetails() {
  const { submissionId } = useParams()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await submissionService.get(submissionId)
        setSubmission(res.submission)
      } catch (err) {
        setError(err.message || 'Failed to retrieve submission ledger.')
      } finally {
        setLoading(false)
      }
    }
    if (submissionId) {
      load()
    }
  }, [submissionId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-secondary animate-spin">
          progress_activity
        </span>
        <p className="font-label-xs-caps text-xs uppercase tracking-widest text-on-surface-variant">
          Retrieving Submission Dossier...
        </p>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>
        <h2 className="font-headline-sm text-2xl text-primary">Submission Not Found</h2>
        <p className="text-sm text-on-surface-variant">{error || 'Unable to locate this deliverable record.'}</p>
        <Link
          to="/intern/submissions"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-title-md text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Submissions</span>
        </Link>
      </div>
    )
  }

  const statusToneMap = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    under_review: 'bg-secondary-container text-on-secondary-container border-secondary/30',
    submitted: 'bg-amber-100 text-amber-900 border-amber-200'
  }

  const statusTone = statusToneMap[submission.status] || 'bg-surface-container-high text-on-surface-variant'
  const taskTitle = submission.task?.title || 'Deliverable Submission'
  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-space-xs font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-widest">
          <Link to="/intern/submissions" className="hover:text-on-surface transition-colors">
            My Submissions
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">
            {submission._id ? `ID #${submission._id.slice(-6).toUpperCase()}` : 'Submission Detail'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-[0.2em] text-secondary font-semibold">
              Intern Portal // Submission Details
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 mb-2">
              {taskTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className={`px-space-sm py-1 rounded-full font-label-xs-caps text-label-xs-caps uppercase border ${statusTone}`}>
                {submission.status.replace('_', ' ')}
              </span>
              <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase">
                Submitted {submittedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <div className="xl:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30">
              <div className="flex items-center gap-2 pb-space-md border-b border-outline-variant/20 mb-4">
                <span className="material-symbols-outlined text-secondary text-[20px]">link</span>
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                  Submitted Links &amp; Repository
                </span>
              </div>
              <div className="space-y-space-sm">
                {submission.repoUrl && (
                  <a
                    href={submission.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl p-space-md hover:bg-surface-container transition-all group border border-outline-variant/20"
                  >
                    <div className="min-w-0">
                      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">
                        Code Repository
                      </div>
                      <div className="font-title-md text-title-md text-on-surface truncate">
                        {submission.repoUrl}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">
                      arrow_outward
                    </span>
                  </a>
                )}
                {submission.liveUrl && (
                  <a
                    href={submission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl p-space-md hover:bg-surface-container transition-all group border border-outline-variant/20"
                  >
                    <div className="min-w-0">
                      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">
                        Live Deployment / Artifact URL
                      </div>
                      <div className="font-title-md text-title-md text-on-surface truncate">
                        {submission.liveUrl}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">
                      arrow_outward
                    </span>
                  </a>
                )}
          {!submission.repoUrl && !submission.liveUrl && (
          <p className="text-sm text-on-surface-variant italic">No external URLs submitted.</p>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30">
              <div className="flex items-center gap-2 pb-space-md border-b border-outline-variant/20 mb-4">
                <span className="material-symbols-outlined text-secondary text-[20px]">sticky_note_2</span>
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                  Deliverable Notes & Monograph
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {submission.notes || 'No accompanying notes provided for this submission.'}
              </p>
            </div>
          </div>

          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-primary text-on-primary rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)]">
              <div className="flex items-center justify-between pb-space-md">
                <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-80">
                  Evaluation Ledger
                </span>
                <span className="material-symbols-outlined text-[20px] opacity-70">verified_user</span>
              </div>
              <div className="flex items-end justify-between gap-space-md">
                <div>
                  <div className="font-label-xs-caps text-label-xs-caps uppercase opacity-70">
                    Points Awarded
                  </div>
                  <div className="font-headline-sm text-headline-sm tracking-tight mt-1">
                    {submission.review ? `${submission.review.pointsAwarded ?? 0} XP` : 'Pending'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-label-xs-caps text-label-xs-caps uppercase opacity-70">
                    Review Status
                  </div>
                  <div className="font-title-md text-title-md mt-1 capitalize">
                    {submission.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {submission.review ? (
              <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-[20px]">rate_review</span>
                  <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">
                    Faculty Critique & Assessment
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {submission.review.feedback}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-xs-caps">
                  <span>Evaluator: {submission.review.reviewer?.name || 'Academic Board'}</span>
                  <span>
                    {submission.review.reviewedAt
                      ? new Date(submission.review.reviewedAt).toLocaleDateString()
                      : 'Evaluated'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/30 flex flex-col items-center text-center gap-space-md">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
                    rate_review
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                  Faculty feedback is on the way
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
                  Reviewer critique and awarded XP will publish to this ledger right after the attestation pass.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
