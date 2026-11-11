import {
  TASKNEST_KNOWLEDGE_DOCS,
  ROLE_SUGGESTED_QUESTIONS,
  findBestFaqMatch,
  getRoleHelpOverview,
} from './aiKnowledgeBase.js'

/**
 * Builds the system instruction prompt with TaskNest verified knowledge.
 */
function buildSystemPrompt(userRole = 'intern', userName = 'User') {
  return `You are the TaskNest Assistant, an intelligent and friendly in-app guide for TaskNest (a task management and intern performance portal).

Current User Information:
- Name: ${userName}
- Role: ${userRole === 'admin' ? 'Faculty / Admin' : 'Intern'}

TaskNest Verified Knowledge Base:
${TASKNEST_KNOWLEDGE_DOCS}

Strict Guidelines:
1. Answer in simple, natural, polite English.
2. Provide concise, actionable instructions (2 to 4 sentences or a short bulleted list).
3. Always tailor your advice to the user's role (${userRole === 'admin' ? 'Faculty/Admin' : 'Intern'}).
4. Only describe features and screens that actually exist in TaskNest. Do NOT invent non-existent features, menus, or external tools.
5. If you do not know the answer or the question is outside TaskNest, politely explain what TaskNest does and offer relevant suggestions.
6. Never expose private credentials or other users' personal information.
7. Be encouraging and helpful!`
}

/**
 * Attempts to generate an answer via Google Gemini API.
 */
async function callGeminiApi({ apiKey, userRole, userName, message, history = [] }) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const systemInstruction = buildSystemPrompt(userRole, userName)

  // Format contents array for Gemini
  const contents = []

  // Add conversation history (up to last 6 turns)
  const recentHistory = history.slice(-6)
  for (const h of recentHistory) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`Gemini API error status ${res.status}: ${errBody.slice(0, 100)}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('Gemini API returned empty text')
    }
    return text.trim()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * Attempts to generate an answer via OpenAI API.
 */
async function callOpenAiApi({ apiKey, userRole, userName, message, history = [] }) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const endpoint = 'https://api.openai.com/v1/chat/completions'

  const systemPrompt = buildSystemPrompt(userRole, userName)

  const messages = [{ role: 'system', content: systemPrompt }]
  const recentHistory = history.slice(-6)
  for (const h of recentHistory) {
    messages.push({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })
  }
  messages.push({ role: 'user', content: message })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`OpenAI API error status ${res.status}: ${errBody.slice(0, 100)}`)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI API returned empty text')
    }
    return text.trim()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * Main AI Help Orchestrator.
 * Checks for configured AI providers; falls back seamlessly to the verified FAQ engine.
 */
export async function getAiHelp({ user, message, history = [] }) {
  const userRole = user?.role || 'intern'
  const userName = user?.name || 'there'

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  // 1. Try Gemini API if key is available
  if (geminiKey) {
    try {
      const answer = await callGeminiApi({
        apiKey: geminiKey,
        userRole,
        userName,
        message,
        history,
      })
      return {
        answer,
        source: 'ai',
        provider: 'gemini',
        role: userRole,
        suggestedQuestions: getSuggestedQuestionsForRole(userRole),
      }
    } catch (err) {
      console.warn('[aiService] Gemini API call failed, using verified FAQ fallback:', err.message)
    }
  }

  // 2. Try OpenAI API if key is available
  if (openaiKey) {
    try {
      const answer = await callOpenAiApi({
        apiKey: openaiKey,
        userRole,
        userName,
        message,
        history,
      })
      return {
        answer,
        source: 'ai',
        provider: 'openai',
        role: userRole,
        suggestedQuestions: getSuggestedQuestionsForRole(userRole),
      }
    } catch (err) {
      console.warn('[aiService] OpenAI API call failed, using verified FAQ fallback:', err.message)
    }
  }

  // 3. Verified FAQ Engine (Deterministic, instant, and 100% accurate)
  const matchResult = findBestFaqMatch(message, userRole)

  if (matchResult.matched && matchResult.faq) {
    return {
      answer: matchResult.faq.answer,
      source: 'faq',
      provider: 'tasknest_knowledge_base',
      role: userRole,
      suggestedQuestions: getSuggestedQuestionsForRole(userRole),
    }
  }

  return {
    answer: matchResult.fallbackHelp || getRoleHelpOverview(userRole),
    source: 'faq',
    provider: 'tasknest_knowledge_base',
    role: userRole,
    suggestedQuestions: getSuggestedQuestionsForRole(userRole),
  }
}

/**
 * Returns the suggested questions list tailored to the user's role.
 */
export function getSuggestedQuestionsForRole(role = 'intern') {
  if (role === 'admin' || role === 'faculty') {
    return ROLE_SUGGESTED_QUESTIONS.admin
  }
  return ROLE_SUGGESTED_QUESTIONS.intern
}

/**
 * Deterministic, structured template fallback for task descriptions.
 */
export function generateTemplateTaskDescription({
  taskIdea = '',
  category = 'General Engineering',
  difficulty = 'Intermediate',
  expectedOutcome = '',
}) {
  let cleanTitle = taskIdea
    .replace(/^(build|create|implement|develop|design|add|set up|write)\s+/i, '')
    .trim()
  const firstWordMatch = taskIdea.match(/^(build|create|implement|develop|design|add|set up|write)\b/i)
  const verb = firstWordMatch
    ? firstWordMatch[0].charAt(0).toUpperCase() + firstWordMatch[0].slice(1).toLowerCase()
    : 'Implement'

  let title = `${verb} ${cleanTitle}`
  if (!cleanTitle) title = taskIdea.trim()
  title = title
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ')
  if (title.length > 70) title = title.slice(0, 67) + '...'

  const overview = `This task requires you to ${taskIdea.toLowerCase().trim()}.${
    expectedOutcome ? ` The primary expected outcome is: ${expectedOutcome}.` : ''
  } Ensure your solution is clean, modular, and adheres to standard software engineering best practices suitable for an internship deliverable.`

  const objectives = [
    `Understand the core requirements and architecture for ${taskIdea.toLowerCase().trim()}.`,
    `Implement a clean, robust, and well-structured solution within the ${category} domain.`,
    `Ensure the deliverable is responsive, tested, and handles standard edge cases gracefully.`,
    expectedOutcome
      ? `Achieve the specific goal: ${expectedOutcome}.`
      : `Demonstrate clean code structure, separation of concerns, and effective problem-solving.`,
  ]

  const instructions = [
    `Set up your development workspace and ensure all necessary dependencies are installed.`,
    `Review the task scope and design your implementation structure before writing code.`,
    `Develop the core functionality to satisfy all task objectives.`,
    `Write readable, self-documenting code with meaningful variable and function names.`,
    `Perform manual and automated testing to ensure all edge cases are handled.`,
    `Commit your work to a Git repository with clear, descriptive commit messages.`,
  ]

  const deliverables = [
    `Complete working source code repository (e.g. GitHub or GitLab).`,
    `Optional live demo URL, test script, or deployment link proving functionality.`,
    `Short submission notes explaining your approach, architecture, and testing steps.`,
  ]

  const guidelines = [
    `Submit your repository URL on TaskNest under this task.`,
    `Ensure your repository is accessible to faculty reviewers with a helpful README.`,
    `Submit your deliverable before the scheduled deadline to receive full XP points.`,
  ]

  const criteria = [
    `All requirements of the task idea ("${taskIdea}") are successfully satisfied.`,
    `Code is modular, cleanly formatted, and free of runtime errors or unhandled warnings.`,
    `Repository demonstrates clear, incremental commit history and documentation.`,
  ]

  const fullDescription = [
    `### Task Overview`,
    overview,
    ``,
    `### Objectives`,
    ...objectives.map((o) => `• ${o}`),
    ``,
    `### Instructions`,
    ...instructions.map((i) => `• ${i}`),
    ``,
    `### Expected Deliverables`,
    ...deliverables.map((d) => `• ${d}`),
    ``,
    `### Submission Guidelines`,
    ...guidelines.map((g) => `• ${g}`),
    ``,
    `### Acceptance Criteria`,
    ...criteria.map((c) => `• ${c}`),
  ].join('\n')

  return {
    title,
    description: fullDescription,
    instructions,
    objectives,
    deliverables,
    criteria,
    source: 'template',
    provider: 'tasknest_template_generator',
  }
}

function formatParsedDescription(parsed) {
  const parts = []
  if (parsed.overview) {
    parts.push(`### Task Overview\n${parsed.overview}\n`)
  }
  if (Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
    parts.push(`### Objectives\n${parsed.objectives.map((o) => `• ${o}`).join('\n')}\n`)
  }
  if (Array.isArray(parsed.instructions) && parsed.instructions.length > 0) {
    parts.push(`### Instructions\n${parsed.instructions.map((i) => `• ${i}`).join('\n')}\n`)
  }
  if (Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0) {
    parts.push(`### Expected Deliverables\n${parsed.deliverables.map((d) => `• ${d}`).join('\n')}\n`)
  }
  if (Array.isArray(parsed.submissionGuidelines) && parsed.submissionGuidelines.length > 0) {
    parts.push(`### Submission Guidelines\n${parsed.submissionGuidelines.map((g) => `• ${g}`).join('\n')}\n`)
  }
  if (Array.isArray(parsed.acceptanceCriteria) && parsed.acceptanceCriteria.length > 0) {
    parts.push(`### Acceptance Criteria\n${parsed.acceptanceCriteria.map((c) => `• ${c}`).join('\n')}\n`)
  }
  return parts.join('\n').trim()
}

/**
 * Generates a structured task description using AI (Gemini/OpenAI) or template fallback.
 */
export async function generateTaskDescription({
  user,
  taskIdea,
  category = 'General Engineering',
  difficulty = 'Intermediate',
  expectedOutcome = '',
}) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  const promptText = `You are an expert software engineering mentor in TaskNest creating tasks for college internship candidates.
Task Idea: "${taskIdea}"
Category: "${category}"
Difficulty: "${difficulty}"
Expected Outcome: "${expectedOutcome || 'A working, tested solution submitted on GitHub'}"

Guidelines:
- Use simple, professional English that is easy for college interns to understand.
- Avoid unnecessary technical jargon.
- Clear action-oriented sentences.
- Never invent specific requirements that were not provided.
- You must structure the task with these 7 sections:
  1. Task Title
  2. Task Overview
  3. Objectives
  4. Instructions
  5. Expected Deliverables
  6. Submission Guidelines
  7. Acceptance Criteria

Respond in valid JSON format with the following keys:
{
  "title": "Concise Task Title",
  "overview": "Short 2-3 sentence overview",
  "objectives": ["Objective 1", "Objective 2"],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "submissionGuidelines": ["Guideline 1", "Guideline 2"],
  "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
}`

  // Try Gemini if available
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText)
          if (parsed.title && (parsed.overview || parsed.instructions)) {
            const formattedDesc = formatParsedDescription(parsed)
            return {
              title: parsed.title,
              description: formattedDesc,
              instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
              source: 'ai',
              provider: 'gemini',
            }
          }
        }
      }
    } catch (err) {
      console.warn('[aiService] Gemini generateTaskDescription failed, using fallback:', err.message)
    }
  }

  // Try OpenAI if available
  if (openaiKey) {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
      const endpoint = 'https://api.openai.com/v1/chat/completions'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.4,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const rawText = data?.choices?.[0]?.message?.content
        if (rawText) {
          const parsed = JSON.parse(rawText)
          if (parsed.title && (parsed.overview || parsed.instructions)) {
            const formattedDesc = formatParsedDescription(parsed)
            return {
              title: parsed.title,
              description: formattedDesc,
              instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
              source: 'ai',
              provider: 'openai',
            }
          }
        }
      }
    } catch (err) {
      console.warn('[aiService] OpenAI generateTaskDescription failed, using fallback:', err.message)
    }
  }

  // Fallback to deterministic template generator
  return generateTemplateTaskDescription({ taskIdea, category, difficulty, expectedOutcome })
}

