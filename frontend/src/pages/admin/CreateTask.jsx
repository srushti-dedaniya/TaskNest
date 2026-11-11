import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { taskService, userService, aiService } from '../../services/api.js'
import { Sparkles, Bot, RefreshCw, Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

export default function CreateTask() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editTaskId = searchParams.get('edit')
  const isEditing = Boolean(editTaskId)

  const [interns, setInterns] = useState([])
  const [scope, setScope] = useState('Daily')
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(`TASK-${Math.floor(1000 + Math.random() * 9000)}`)
  const [category, setCategory] = useState('Core Development')
  const [priority, setPriority] = useState('High')
  const [points, setPoints] = useState(350)
  const [deadline, setDeadline] = useState('2026-11-20T23:59')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState([
    'Create branch from main with your feature name.',
    'Write clean, readable code with descriptive comments.',
    'Ensure all unit tests pass before submitting.'
  ])
  const [newInstruction, setNewInstruction] = useState('')

  const [rubric, setRubric] = useState([
    { criterion: 'Implementation & Functionality', maxPoints: 200 },
    { criterion: 'Code Quality & Documentation', maxPoints: 150 }
  ])

  // Multi-intern assignment state
  const [assignMode, setAssignMode] = useState('all') // 'all' | 'individual'
  const [selectedInternIds, setSelectedInternIds] = useState([])
  const [internSearch, setInternSearch] = useState('')

  const [loadingTask, setLoadingTask] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // AI Task Description Helper state
  const [showAiHelper, setShowAiHelper] = useState(true)
  const [aiTaskIdea, setAiTaskIdea] = useState('')
  const [aiCategory, setAiCategory] = useState('Frontend & UI')
  const [aiDifficulty, setAiDifficulty] = useState('Intermediate')
  const [aiExpectedOutcome, setAiExpectedOutcome] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiGeneratedResult, setAiGeneratedResult] = useState(null)
  const [aiEditableTitle, setAiEditableTitle] = useState('')
  const [aiEditableDescription, setAiEditableDescription] = useState('')
  const [aiAppliedNotification, setAiAppliedNotification] = useState('')

  // Load interns list
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

  // If in Edit mode, load the existing task
  useEffect(() => {
    async function loadTaskForEdit() {
      if (!editTaskId) return
      try {
        setLoadingTask(true)
        const res = await taskService.get(editTaskId)
        if (res?.task) {
          const t = res.task
          setTitle(t.title || '')
          setCode(t.code || '')
          setDescription(t.description || '')
          setScope(t.type === 'weekly' ? 'Weekly' : 'Daily')
          setPriority(t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium')
          setPoints(t.points ?? 350)

          if (t.deadline) {
            const dateObj = new Date(t.deadline)
            if (!isNaN(dateObj.getTime())) {
              const pad = (n) => String(n).padStart(2, '0')
              const formatted = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`
              setDeadline(formatted)
            }
          }

          if (Array.isArray(t.instructions) && t.instructions.length > 0) {
            setInstructions(t.instructions)
          }

          const mode = t.assignment?.mode || 'all'
          setAssignMode(mode)
          if (mode === 'individual' && Array.isArray(t.assignment?.interns)) {
            const ids = t.assignment.interns.map((i) => i._id || i)
            setSelectedInternIds(ids)
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load task for editing.')
      } finally {
        setLoadingTask(false)
      }
    }
    loadTaskForEdit()
  }, [editTaskId])

  // Multi-select helpers
  const handleToggleIntern = (internId) => {
    if (fieldErrors.interns) setFieldErrors((prev) => ({ ...prev, interns: null }))
    setSelectedInternIds((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    )
  }

  const handleSelectAllFiltered = () => {
    if (fieldErrors.interns) setFieldErrors((prev) => ({ ...prev, interns: null }))
    const filteredIds = filteredInterns.map((i) => i._id || i.id)
    setSelectedInternIds((prev) => [...new Set([...prev, ...filteredIds])])
  }

  const handleClearAllSelected = () => {
    setSelectedInternIds([])
  }

  const handleRemoveChip = (internId) => {
    setSelectedInternIds((prev) => prev.filter((id) => id !== internId))
  }

  const filteredInterns = interns.filter((i) => {
    const q = internSearch.toLowerCase().trim()
    if (!q) return true
    return (
      (i.name || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q) ||
      (i.institution || '').toLowerCase().includes(q) ||
      (i.fieldOfStudy || '').toLowerCase().includes(q)
    )
  })

  // Selected intern objects for chips
  const selectedInternsList = interns.filter((i) =>
    selectedInternIds.includes(i._id || i.id)
  )

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
    setRubric([...rubric, { criterion: 'Code Quality & Testing', maxPoints: 50 }])
  }

  const handleUpdateRubric = (index, field, value) => {
    const updated = [...rubric]
    updated[index][field] = field === 'maxPoints' ? Number(value) : value
    setRubric(updated)
  }

  const handleRemoveRubric = (index) => {
    setRubric(rubric.filter((_, i) => i !== index))
  }

  // AI Task Description Generator Handlers
  const handleGenerateDescription = async () => {
    if (!aiTaskIdea.trim()) {
      setAiError('Please enter a task idea before generating.')
      return
    }
    setAiError('')
    setAiGenerating(true)
    try {
      const res = await aiService.generateTaskDescription({
        taskIdea: aiTaskIdea.trim(),
        category: aiCategory,
        difficulty: aiDifficulty,
        expectedOutcome: aiExpectedOutcome.trim()
      })
      setAiGeneratedResult(res)
      setAiEditableTitle(res.title || '')
      setAiEditableDescription(res.description || '')
    } catch (err) {
      setAiError(err.message || 'Failed to generate task description.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleApplyGeneratedDescription = () => {
    if (aiEditableTitle.trim()) {
      setTitle(aiEditableTitle.trim())
    }
    if (aiEditableDescription.trim()) {
      setDescription(aiEditableDescription.trim())
    }
    if (
      aiGeneratedResult?.instructions &&
      Array.isArray(aiGeneratedResult.instructions) &&
      aiGeneratedResult.instructions.length > 0
    ) {
      setInstructions(aiGeneratedResult.instructions)
    }
    if (aiCategory) {
      setCategory(aiCategory)
    }
    setAiAppliedNotification('✓ AI-generated title and structured description applied to form!')
    setTimeout(() => setAiAppliedNotification(''), 4500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const errors = {}
    if (!title.trim()) {
      errors.title = 'Please provide a task title.'
    }
    if (!description.trim()) {
      errors.description = 'Please provide task description and instructions.'
    }

    let parsedDeadline
    try {
      const d = new Date(deadline)
      if (isNaN(d.getTime())) throw new Error()
      parsedDeadline = d.toISOString()
    } catch {
      errors.deadline = 'Please provide a valid deadline.'
    }

    if (assignMode === 'individual' && selectedInternIds.length === 0) {
      errors.interns = 'Please select at least one intern to assign this task.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(Object.values(errors).join(' '))
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim(),
        instructions,
        type: scope.toLowerCase() === 'weekly' ? 'weekly' : 'daily',
        priority: priority.toLowerCase(),
        points: Number(points),
        deadline: parsedDeadline,
        assignment: {
          mode: assignMode,
          interns: assignMode === 'all' ? [] : [...new Set(selectedInternIds)]
        }
      }

      if (isEditing) {
        await taskService.update(editTaskId, payload)
      } else {
        await taskService.create(payload)
      }

      setSubmitted(true)
      setTimeout(() => {
        navigate('/admin/tasks')
      }, 1000)
    } catch (err) {
      console.warn('[CreateTask] Error saving task:', err.message)
      const details = err.data?.details || err.details
      if (Array.isArray(details)) {
        const mapped = {}
        details.forEach((d) => {
          if (d.field) mapped[d.field] = d.message
        })
        setFieldErrors(mapped)
      }
      setError(err.message || 'Failed to save task.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingTask) {
    return (
      <div className="py-24 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-3xl animate-spin text-secondary">
          progress_activity
        </span>
        <p className="text-sm">Loading task details for editing...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/tasks"
              className="font-label-xs-caps text-[11px] uppercase tracking-[0.2em] text-secondary font-semibold hover:underline"
            >
              Tasks
            </Link>
            <span className="text-outline-variant font-label-xs-caps">/</span>
            <span className="font-label-xs-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
              {isEditing ? 'Edit Task' : 'Create Task'}
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary tracking-tight font-medium">
            {isEditing ? 'Edit Task' : 'Create & Assign Task'}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
            {isEditing
              ? 'Update task instructions, deadline, points, and assigned interns.'
              : 'Create a new task, assign it to all or specific interns, and set deadline and points.'}
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

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </motion.div>
        )}

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-secondary-container text-on-secondary-container text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
            <span>
              {isEditing
                ? 'Task updated successfully! Redirecting to tasks list...'
                : 'Task successfully created and assigned! Redirecting to tasks list...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details & Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scope Selector */}
          <div className="bg-surface-bright rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <label className="font-label-xs-caps text-xs uppercase tracking-wider text-secondary font-semibold">
              Task Cadence
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
                <span>Daily Task</span>
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
                <span>Weekly Goal</span>
              </button>
            </div>
          </div>

          {/* AI Task Description Helper Section */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-secondary/35 space-y-5 relative overflow-hidden transition-all">
            {/* Header with badge and collapse toggle */}
            <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#74593f] text-[#ffdcbd] flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5 text-[#fed9b8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-lg sm:text-xl text-primary font-medium">
                      Create Task with AI
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                      AI Helper
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Enter a short task idea to generate a structured, intern-ready description.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiHelper(!showAiHelper)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                title={showAiHelper ? 'Minimize AI Helper' : 'Expand AI Helper'}
              >
                {showAiHelper ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {aiAppliedNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-3.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-secondary shrink-0" />
                  <span>{aiAppliedNotification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {showAiHelper && (
              <div className="space-y-4 pt-1">
                {/* Task Idea Input */}
                <div>
                  <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1.5">
                    Task Idea *
                  </label>
                  <textarea
                    rows={2}
                    value={aiTaskIdea}
                    onChange={(e) => setAiTaskIdea(e.target.value)}
                    placeholder="Example: Build a responsive login page using React."
                    className="w-full p-3.5 rounded-xl bg-surface-container-high/50 text-sm text-primary border border-outline-variant/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary/25 transition-all resize-none"
                  />
                  {/* Quick example prompt chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[10px] font-semibold text-outline uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-secondary" />
                      Ideas:
                    </span>
                    {[
                      'Build a responsive login page using React',
                      'Design JWT authentication API with Express',
                      'Create MongoDB schema for ecommerce products',
                      'Write comprehensive unit tests with Jest'
                    ].map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiTaskIdea(idea)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-on-secondary-container transition-colors border border-outline-variant/20"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                      Category (Optional)
                    </label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                    >
                      <option>Frontend &amp; UI</option>
                      <option>Backend &amp; API</option>
                      <option>Full Stack</option>
                      <option>Database &amp; Storage</option>
                      <option>Testing &amp; QA</option>
                      <option>Documentation</option>
                      <option>General Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                      Difficulty (Optional)
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                      Expected Outcome (Optional)
                    </label>
                    <input
                      type="text"
                      value={aiExpectedOutcome}
                      onChange={(e) => setAiExpectedOutcome(e.target.value)}
                      placeholder="e.g. Tested component on GitHub"
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                    />
                  </div>
                </div>

                {aiError && (
                  <p className="text-xs text-error font-medium">{aiError}</p>
                )}

                {/* Generate Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiGenerating || !aiTaskIdea.trim()}
                    className="w-full py-3 px-5 rounded-xl bg-[#74593f] hover:bg-[#5a422a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-label-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm transform active:scale-[0.99]"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        <span>Creating your task description...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#ffdcbd]" />
                        <span>Generate Description</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Result Preview */}
                {aiGeneratedResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-4 border-t border-outline-variant/25 space-y-3.5 bg-surface-container-lowest/60 rounded-2xl p-4 sm:p-5 border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        AI-Generated Task Draft
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        Source: {aiGeneratedResult.source === 'ai' ? 'Live AI' : 'Verified Template'}
                      </span>
                    </div>

                    {/* Editable Title */}
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                        Suggested Title (Editable)
                      </label>
                      <input
                        type="text"
                        value={aiEditableTitle}
                        onChange={(e) => setAiEditableTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white text-xs sm:text-sm font-semibold text-primary border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>

                    {/* Editable Description */}
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                        Structured Description Preview (Editable)
                      </label>
                      <textarea
                        rows={10}
                        value={aiEditableDescription}
                        onChange={(e) => setAiEditableDescription(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-white text-xs sm:text-sm text-primary font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-secondary leading-relaxed"
                      />
                    </div>

                    {/* Action Buttons: Regenerate & Use This Description */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={aiGenerating}
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyGeneratedDescription}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md transform active:scale-95"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Use This Description</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-xl text-primary font-medium">Task Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold mb-1">
                  Task Code / Tag
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm font-mono text-primary border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
                  placeholder="TASK-1001"
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
                  <option>Core Development</option>
                  <option>Frontend & UI</option>
                  <option>Backend & API</option>
                  <option>Database & Storage</option>
                  <option>Documentation</option>
                  <option>Testing & QA</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                  Task Title *
                </label>
                {fieldErrors.title && <span className="text-xs text-error font-medium">{fieldErrors.title}</span>}
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: null }))
                }}
                className={`w-full h-11 px-4 rounded-xl bg-surface-container-high/60 text-sm text-primary border ${
                  fieldErrors.title ? 'border-error ring-1 ring-error/40' : 'border-outline-variant/30'
                } focus:outline-none focus:bg-surface-container-lowest font-medium transition-all`}
                placeholder="e.g. Build User Authentication and Profile Management"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                  Task Description &amp; Instructions *
                </label>
                {fieldErrors.description && <span className="text-xs text-error font-medium">{fieldErrors.description}</span>}
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: null }))
                }}
                rows={4}
                className={`w-full p-4 rounded-2xl bg-surface-container-high/60 text-sm text-primary border ${
                  fieldErrors.description ? 'border-error ring-1 ring-error/40' : 'border-outline-variant/30'
                } focus:outline-none focus:bg-surface-container-lowest transition-all`}
                placeholder="Describe the task requirements, technical guidelines, and what the intern needs to deliver..."
                required
              />
            </div>
          </div>

          {/* Instructions List Builder */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <h3 className="font-headline-sm text-xl text-primary font-medium">Checklist Steps</h3>
            <p className="text-xs text-on-surface-variant">
              Steps that interns should follow and check off before submitting their work.
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
                placeholder="Add another checklist step..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddInstruction(e)
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest text-xs font-label-md transition-colors"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Assessment Rubric */}
          <div className="bg-surface-bright rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-xl text-primary font-medium">Grading Rubric</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Criteria used by faculty to review and grade submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRubric}
                className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Criterion</span>
              </button>
            </div>

            <div className="space-y-3">
              {rubric.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <input
                    type="text"
                    value={r.criterion}
                    onChange={(e) => handleUpdateRubric(i, 'criterion', e.target.value)}
                    className="flex-1 bg-transparent text-xs text-primary focus:outline-none font-medium"
                    placeholder="Criterion name..."
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      value={r.maxPoints}
                      onChange={(e) => handleUpdateRubric(i, 'maxPoints', e.target.value)}
                      className="w-16 h-8 px-2 rounded-lg bg-surface-bright text-xs text-secondary font-bold text-center border border-outline-variant/30 focus:outline-none"
                    />
                    <span className="text-[11px] text-on-surface-variant font-medium">points</span>
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

        {/* Right Sidebar: Multi-Intern Assignment, Schedule, Points & Save */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-bright rounded-3xl p-6 md:p-7 shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-outline-variant/20 space-y-5">
            <h3 className="font-headline-sm text-lg text-primary font-medium">Assign Interns</h3>

            {/* Assignment Mode Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                Assignment Scope
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setAssignMode('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    assignMode === 'all'
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  <span>All Interns</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('individual')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    assignMode === 'individual'
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  <span>Specific Interns</span>
                </button>
              </div>
            </div>

            {/* Mode A: All Interns */}
            {assignMode === 'all' && (
              <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/20 text-xs text-on-secondary-container space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                  <span>Broadcast to All Active Interns ({interns.length})</span>
                </div>
                <p className="opacity-90 leading-relaxed">
                  Every current intern and any newly verified intern will automatically receive this task on their dashboard.
                </p>
              </div>
            )}

            {/* Mode B: Multi-Intern Searchable Selector */}
            {assignMode === 'individual' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                    Select Interns
                  </span>
                  <span className="text-xs font-bold text-secondary">
                    {selectedInternIds.length} of {interns.length} selected
                  </span>
                </div>

                {fieldErrors.interns && (
                  <p className="text-xs text-error font-medium">{fieldErrors.interns}</p>
                )}

                {/* Selected Intern Chips */}
                {selectedInternsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-surface-container-low border border-outline-variant/30 max-h-32 overflow-y-auto">
                    {selectedInternsList.map((i) => (
                      <span
                        key={i._id || i.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium shadow-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-secondary text-on-secondary text-[9px] flex items-center justify-center font-bold">
                          {(i.name || 'I').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[130px]">{i.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChip(i._id || i.id)}
                          className="hover:text-error transition-colors ml-0.5"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Bar & Quick Select Actions */}
                <div className="space-y-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={internSearch}
                      onChange={(e) => setInternSearch(e.target.value)}
                      placeholder="Search interns by name or email..."
                      className="w-full h-9 pl-9 pr-8 rounded-xl bg-surface-container-high/60 text-xs text-primary border border-outline-variant/30 focus:outline-none"
                    />
                    {internSearch && (
                      <button
                        type="button"
                        onClick={() => setInternSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-primary"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-secondary hover:underline font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">select_all</span>
                      <span>Select All ({filteredInterns.length})</span>
                    </button>
                    {selectedInternIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllSelected}
                        className="text-error hover:underline font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Interns Scrollable Checkbox List */}
                <div className="border border-outline-variant/30 rounded-2xl max-h-56 overflow-y-auto divide-y divide-outline-variant/20 bg-surface-container-low/40">
                  {filteredInterns.length === 0 ? (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      No interns match your search.
                    </div>
                  ) : (
                    filteredInterns.map((intern) => {
                      const id = intern._id || intern.id
                      const isSelected = selectedInternIds.includes(id)
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleIntern(id)}
                          className={`flex items-center gap-3 p-2.5 hover:bg-surface-container-high/70 cursor-pointer transition-colors ${
                            isSelected ? 'bg-secondary-container/20' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            className="w-4 h-4 rounded accent-secondary cursor-pointer"
                          />
                          <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                            {(intern.name || 'I').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-primary truncate">
                              {intern.name}
                            </div>
                            <div className="text-[11px] text-on-surface-variant truncate">
                              {intern.email} {intern.institution ? `• ${intern.institution}` : ''}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

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
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                  Reward Points
                </label>
                <span className="text-sm font-bold text-secondary">+{points} points</span>
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
                <span>50</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-label-xs-caps uppercase text-on-surface-variant font-semibold">
                  Due Date &amp; Time
                </label>
                {fieldErrors.deadline && <span className="text-xs text-error font-medium">{fieldErrors.deadline}</span>}
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value)
                  if (fieldErrors.deadline) setFieldErrors((prev) => ({ ...prev, deadline: null }))
                }}
                className={`w-full h-11 px-3 rounded-xl bg-surface-container-high/60 text-xs text-primary border ${
                  fieldErrors.deadline ? 'border-error ring-1 ring-error/40' : 'border-outline-variant/30'
                } focus:outline-none transition-all`}
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
                    <span>{isEditing ? 'Saving Changes...' : 'Assigning Task...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      {isEditing ? 'save' : 'publish'}
                    </span>
                    <span>
                      {isEditing
                        ? 'Save Task Changes'
                        : assignMode === 'all'
                        ? 'Assign to All Interns'
                        : `Assign to ${selectedInternIds.length} Intern${selectedInternIds.length === 1 ? '' : 's'}`}
                    </span>
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
