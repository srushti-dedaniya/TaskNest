import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { taskService, userService } from '../../services/api.js'

export default function CreateTask() {
  const navigate = useNavigate()

  const [interns, setInterns] = useState([])
  const [scope, setScope] = useState('Daily')
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(`SPEC-${Math.floor(1000 + Math.random() * 9000)}`)
  const [category, setCategory] = useState('Core Protocol')
  const [priority, setPriority] = useState('High')
  const [points, setPoints] = useState(350)
  const [assignedTo, setAssignedTo] = useState('all')
  const [deadline, setDeadline] = useState('2026-11-20T23:59')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState([
    'Branch from main with feat/ prefix.',
    'Include benchmark telemetry alongside verification artifact.',
    'Comply with TaskNest Monograph Styleguide v2.4.'
  ])
  const [newInstruction, setNewInstruction] = useState('')

  const [rubric, setRubric] = useState([
    { criterion: 'Protocol Invariant Verification', maxPoints: 200 },
    { criterion: 'Code Quality & Formal Monograph Documentation', maxPoints: 150 }
  ])

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInterns() {
      try {
        const res = await userService.list()
        setInterns(res?.interns ?? [])
      } catch (err) {
        console.warn('[CreateTask] Loading interns failed:', err.message)
        setInterns([])
      }
    }
    loadInterns()
  }, [])

  const handleAddInstruction = (e) => {
    e.preventDefault()
    if (!newInstruction.trim()) return
    setInstructions([...instructions, newInstruction.trim()])
    setNewInstruction('')
  }

  const handleRemoveInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const handleAddRubric = () => {
    setRubric([...rubric, { criterion: 'Benchmark Validation', maxPoints: 50 }])
  }

  const handleUpdateRubric = (index, field, value) => {
    const updated = [...rubric]
    updated[index][field] = field === 'maxPoints' ? Number(value) : value
    setRubric(updated)
  }

  const handleRemoveRubric = (index) => {
    setRubric(rubric.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Please provide a task title and comprehensive monograph description.')
      return
    }

    setSubmitting(true)
    try {
      const isAll = assignedTo === 'all'
      // If assignedTo is an ID that is not a valid 24-char hex mongo ObjectId (like usr-001 from mock), broadcast to all
      const isValidMongoId = typeof assignedTo === 'string' && /^[0-9a-fA-F]{24}$/.test(assignedTo)

      await taskService.create({
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim(),
        instructions,
        type: scope.toLowerCase() === 'weekly' ? 'weekly' : 'daily',
        priority: priority.toLowerCase(),
        points: Number(points),
        deadline: new Date(deadline).toISOString(),
        assignment: {
          mode: isAll || !isValidMongoId ? 'all' : 'individual',
          interns: !isAll && isValidMongoId ? [assignedTo] : []
        }
      })

      setSubmitted(true)
      setTimeout(() => {
        navigate('/admin/tasks')
      }, 1000)
    } catch (err) {
      console.warn('[CreateTask] Error dispatching task:', err.message)
      setError(err.message || 'Failed to dispatch task.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/tasks" className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold hover:underline">
              Task Registry
            </Link>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
              Dispatch Forge
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            Create &amp; Assign Task
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Configure fellowship deliverables, bind grading rubrics, and assign to prospective fellows with deterministic XP values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/tasks"
            className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-label-md hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {submitted && (
        <div className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          <span>Task successfully dispatched and assigned! Redirecting to Task Registry...</span>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details & Rubric */}
        <div className="lg:col-span-8 space-y-6">
          {/* Scope Selector */}
          <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <label className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
              Task Scope & Cadence
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScope('Daily')}
                className={`flex-1 py-3 px-4 rounded-2xl font-label-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  scope === 'Daily'
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                <span>Daily Sprint Task (Micro-Deliverable)</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('Weekly')}
                className={`flex-1 py-3 px-4 rounded-2xl font-label-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  scope === 'Weekly'
                    ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                <span>Weekly Milestone Goal</span>
              </button>
            </div>
          </div>

          {/* Core Info */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-xl text-primary font-medium">Task Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Spec Code / Index
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm font-mono text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                  placeholder="SPEC-0841"
                />
              </div>

              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none"
                >
                  <option>Core Protocol</option>
                  <option>Cryptography</option>
                  <option>Storage & WAL</option>
                  <option>Documentation</option>
                  <option>Benchmarking & Telemetry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Deliverable Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest font-medium"
                placeholder="e.g. Implement Raft Consensus Leader Election Protocol"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Architectural Abstract &amp; Monograph Guidelines *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-2xl bg-surface-container-high/60 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                placeholder="Detail the technical expectations, formal invariants, algorithms, and documentation requirements..."
                required
              />
            </div>
          </div>

          {/* Instructions List Builder */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <h3 className="font-headline-sm text-xl text-primary font-medium">Deliverable Milestones &amp; Steps</h3>
            <p className="text-xs text-on-surface-variant">
              Checklist items that the fellow must complete prior to submitting the verification bundle.
            </p>

            <div className="space-y-2">
              {instructions.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-primary">{inst}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="Add milestone requirement..."
                className="flex-1 h-10 px-4 rounded-full bg-surface-container-high/60 text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-4 py-2 rounded-full bg-surface-container-highest hover:bg-surface-container text-xs font-label-md text-on-surface transition-colors"
              >
                + Add Step
              </button>
            </div>
          </div>

          {/* Grading Rubric Builder */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-xl text-primary font-medium">Evaluation Rubric</h3>
                <p className="text-xs text-on-surface-variant">
                  Points distribution criteria for faculty assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRubric}
                className="text-xs text-secondary hover:underline font-label-md flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add Criterion</span>
              </button>
            </div>

            <div className="space-y-3">
              {rubric.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={r.criterion}
                    onChange={(e) => handleUpdateRubric(i, 'criterion', e.target.value)}
                    className="flex-1 h-10 px-4 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                    placeholder="Criterion description"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={r.maxPoints}
                      onChange={(e) => handleUpdateRubric(i, 'maxPoints', e.target.value)}
                      className="w-20 h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary font-bold border border-outline-variant/30 focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant">XP</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRubric(i)}
                    className="p-1 text-on-surface-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Assignment, Deadline, XP Value & Dispatch CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Assignment &amp; Schedule</h3>

            {/* Assign To */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Assign To Fellow
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none font-medium"
              >
                <option value="all">Cohort 09 (Broadcast to All Fellows)</option>
                {interns.map((fellow) => (
                  <option key={fellow._id || fellow.id} value={fellow._id || fellow.id}>
                    {fellow.name} ({fellow.institution || 'Fellow'})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none font-medium"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {/* XP Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                  Reward XP Value
                </label>
                <span className="text-sm font-bold text-secondary">+{points} XP</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-outline mt-1 font-mono">
                <span>50 XP</span>
                <span>500 XP</span>
                <span>1000 XP</span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                Canonical Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-title-md text-sm hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Dispatching Task...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    <span>Dispatch &amp; Notify Fellow</span>
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
