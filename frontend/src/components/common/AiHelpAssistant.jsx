import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { aiService } from '../../services/aiService.js'
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

const ROLE_DEFAULT_QUESTIONS = {
  intern: [
    'How do I submit a task?',
    'Where can I see my assigned tasks?',
    'What does Waiting for Review mean?',
    'How can I check my points?',
    'Where can I find faculty feedback?',
    'How can I update my profile?'
  ],
  faculty: [
    'How do I assign a task to multiple interns?',
    'How can I review submissions?',
    'Where can I see intern performance?',
    'How do I find an intern?',
    'How can I track pending submissions?'
  ],
  admin: [
    'How do I manage users?',
    'How can I monitor tasks?',
    'Where can I view platform activity?',
    'How do I assign a task to multiple interns?',
    'How can I review submissions?',
    'Where can I see intern performance?'
  ]
}

function getWelcomeMessage(currentUser) {
  if (currentUser?.role === 'intern') {
    return "Hi Intern! I'm your TaskNest Assistant. How can I help you today?"
  }
  if (currentUser?.role === 'admin') {
    return "Hi Faculty! I'm your TaskNest Assistant. How can I help you today?"
  }
  return "Hi! I'm your TaskNest Assistant. How can I help you today?"
}

export default function AiHelpAssistant() {
  const { user, isAuthenticated } = useAuth()
  const role = user?.role || 'intern'
  const isFacultyOrAdmin = role === 'admin'
  const userId = user?._id || user?.email || role
  const userStorageKey = `tasknest_ai_chat_${userId}`

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestedQuestions, setSuggestedQuestions] = useState(() => {
    return isFacultyOrAdmin ? ROLE_DEFAULT_QUESTIONS.admin : ROLE_DEFAULT_QUESTIONS.intern
  })

  // Initialize messages for current user/role
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(userStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If previous session had outdated "Hi Dr." or wrong role greeting, update welcome message
          const updated = parsed.map((m) =>
            m.id === 'welcome'
              ? { ...m, content: getWelcomeMessage(user) }
              : m
          )
          return updated
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(user),
        source: 'system',
        timestamp: new Date().toISOString()
      }
    ]
  })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // When user or role changes, update chat session and suggested questions
  useEffect(() => {
    try {
      // Clear legacy storage key if present
      sessionStorage.removeItem('tasknest_ai_chat_session')

      const saved = sessionStorage.getItem(userStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = parsed.map((m) =>
            m.id === 'welcome'
              ? { ...m, content: getWelcomeMessage(user) }
              : m
          )
          setMessages(updated)
          return
        }
      }
    } catch {
      // fallback
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(user),
        source: 'system',
        timestamp: new Date().toISOString()
      }
    ])
    setSuggestedQuestions(
      isFacultyOrAdmin ? ROLE_DEFAULT_QUESTIONS.admin : ROLE_DEFAULT_QUESTIONS.intern
    )
  }, [user?._id, role, userStorageKey, isFacultyOrAdmin])

  // Sync session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(userStorageKey, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages, userStorageKey])

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized, loading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    }
  }, [isOpen, isMinimized])

  // Fetch role-specific suggested questions from backend if available
  useEffect(() => {
    if (isAuthenticated) {
      aiService
        .getSuggestedQuestions()
        .then((res) => {
          if (Array.isArray(res?.questions) && res.questions.length > 0) {
            setSuggestedQuestions(res.questions)
          }
        })
        .catch(() => {
          // keep defaults
        })
    }
  }, [isAuthenticated, role])

  // Only render for logged-in users (or general if required)
  if (!isAuthenticated) return null

  const handleSendMessage = async (textToSend) => {
    const trimmed = (textToSend || inputMessage).trim()
    if (!trimmed || loading) return

    setError('')
    setInputMessage('')

    const userMsgId = `user-${Date.now()}`
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString()
      }
    ]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Format history for backend
      const historyPayload = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content
        }))

      const res = await aiService.askHelp(trimmed, historyPayload)

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          res.answer ||
          "I'm here to help you navigate TaskNest! Please ask any question about tasks, submissions, or your profile.",
        source: res.source || 'ai',
        provider: res.provider || 'tasknest',
        timestamp: new Date().toISOString()
      }

      setMessages((prev) => [...prev, assistantMsg])
      if (Array.isArray(res.suggestedQuestions) && res.suggestedQuestions.length > 0) {
        setSuggestedQuestions(res.suggestedQuestions)
      }
    } catch (err) {
      const errMsg =
        err.message ||
        'Unable to reach TaskNest Assistant. Please check your connection and try again.'
      setError(errMsg)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an issue: ${errMsg}`,
          isError: true,
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    const reset = [
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(user),
        source: 'system',
        timestamp: new Date().toISOString()
      }
    ]
    setMessages(reset)
    sessionStorage.removeItem(userStorageKey)
    setError('')
  }

  // Text formatter for nice bullet points & bold keywords
  const renderMessageContent = (content) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />

          // Bullet point lines
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const clean = line.replace(/^[•\-]\s*/, '')
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-xs sm:text-sm">
                <span className="text-secondary mt-1 font-bold">•</span>
                <span>{formatBoldSpans(clean)}</span>
              </div>
            )
          }

          // Numbered step
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-xs sm:text-sm">
                <span className="text-secondary font-semibold">
                  {line.trim().slice(0, 2)}
                </span>
                <span>{formatBoldSpans(line.trim().slice(3))}</span>
              </div>
            )
          }

          return (
            <p key={idx} className="text-xs sm:text-sm">
              {formatBoldSpans(line)}
            </p>
          )
        })}
      </div>
    )
  }

  // Format **bold** substrings cleanly
  const formatBoldSpans = (text) => {
    if (!text.includes('**') && !text.includes('"')) return text
    const parts = text.split(/(\*\*[^*]+\*\*|"[^"]+")/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-primary">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true)
              setIsMinimized(false)
            }}
            aria-label="Open TaskNest AI Help Assistant"
            className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 px-4 py-3 bg-[#74593f] hover:bg-[#5a422a] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 animate-gentle-float focus:outline-none focus:ring-4 focus:ring-[#74593f]/30"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#fed9b8]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#74593f] animate-pulse" />
            </div>
            <span className="text-xs font-semibold tracking-wide font-serif hidden sm:inline">
              TaskNest Help
            </span>
            <Sparkles className="w-4 h-4 text-[#ffdcbd] opacity-80 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] bg-[#fff8f2] border border-[#e8e2d7] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
              isMinimized ? 'h-14' : 'h-[550px] max-h-[85vh]'
            }`}
            style={{ backdropFilter: 'blur(16px)' }}
          >
            {/* Header */}
            <div className="bg-[#f7ecde] border-b border-[#e7e2d9] px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#74593f] text-[#ffdcbd] flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#1f1b12] leading-tight">
                      TaskNest Assistant
                    </h3>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isFacultyOrAdmin
                          ? 'bg-[#fed9b8] text-[#5a422a] border-[#e3c0a0]'
                          : 'bg-[#e8e2d7] text-[#5a422a] border-[#cbc6bc]'
                      }`}
                    >
                      {isFacultyOrAdmin ? 'Faculty Guide' : 'Intern Guide'}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Ready to help in simple English
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1">
                {!isMinimized && (
                  <button
                    onClick={handleClearChat}
                    title="Clear conversation"
                    aria-label="Clear chat"
                    className="p-1.5 text-on-surface-variant hover:text-[#1f1b12] hover:bg-[#ebe1d3] rounded-full transition-colors active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                  className="p-1.5 text-on-surface-variant hover:text-[#1f1b12] hover:bg-[#ebe1d3] rounded-full transition-colors active:scale-95"
                >
                  {isMinimized ? (
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-full transition-colors active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body Content (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#fff8f2] to-[#fdf2e4]/40">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-[#201e19] text-white rounded-br-xs'
                            : msg.isError
                            ? 'bg-error-container text-on-error-container border border-error/20 rounded-bl-xs'
                            : 'bg-[#ffffff] border border-[#e8e2d7] text-[#1f1b12] rounded-bl-xs'
                        }`}
                      >
                        {msg.role === 'assistant' && !msg.isError && (
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#74593f]">
                            <Sparkles className="w-3 h-3 text-[#74593f]" />
                            <span>TaskNest Assistant</span>
                          </div>
                        )}
                        {renderMessageContent(msg.content)}
                      </div>
                    </motion.div>
                  ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white border border-[#e8e2d7] rounded-2xl rounded-bl-xs px-4 py-3 shadow-sm flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-[#74593f] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-[#74593f] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-[#74593f] rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">
                        TaskNest Assistant is thinking...
                      </span>
                    </div>
                  </div>
                )}

                {/* Suggested Questions Section */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      Suggested Questions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        disabled={loading}
                        className="text-left text-xs bg-[#f7ecde] hover:bg-[#fed9b8] active:bg-[#e3c0a0] text-[#49473f] hover:text-[#2a1704] font-medium px-3 py-1.5 rounded-full border border-[#e8e2d7] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-[#f7ecde] border-t border-[#e7e2d9]">
                {error && (
                  <p className="text-[11px] text-error mb-1.5 px-1 font-medium truncate">
                    {error}
                  </p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="Ask a question about TaskNest..."
                    maxLength={1000}
                    className="flex-1 bg-white border border-[#e8e2d7] rounded-full px-4 py-2 text-xs sm:text-sm text-[#1f1b12] placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#74593f]/30 focus:border-[#74593f] transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    aria-label="Send message"
                    className="w-9 h-9 rounded-full bg-[#74593f] hover:bg-[#5a422a] active:bg-[#201e19] text-white flex items-center justify-center shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-1.5 px-1.5 text-[10px] text-on-surface-variant/75">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-secondary" />
                    Verified TaskNest Guide
                  </span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </>
  )
}

