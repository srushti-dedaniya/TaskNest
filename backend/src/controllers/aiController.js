import { asyncHandler } from '../utils/ApiError.js'
import {
  getAiHelp,
  getSuggestedQuestionsForRole,
  generateTaskDescription,
} from '../services/aiService.js'

/**
 * Handle incoming question for AI Help Assistant.
 * POST /api/ai/help
 */
export const askHelp = asyncHandler(async (req, res) => {
  const { message, history } = req.body

  const result = await getAiHelp({
    user: req.user,
    message,
    history,
  })

  res.json({
    ok: true,
    answer: result.answer,
    source: result.source,
    provider: result.provider,
    role: result.role,
    suggestedQuestions: result.suggestedQuestions,
  })
})

/**
 * Fetch suggested questions based on user's role.
 * GET /api/ai/suggested-questions
 */
export const getSuggestedQuestions = asyncHandler(async (req, res) => {
  const role = req.user?.role || 'intern'
  const questions = getSuggestedQuestionsForRole(role)

  res.json({
    ok: true,
    role,
    questions,
  })
})

/**
 * Generate a professional, structured task description for faculty.
 * POST /api/ai/generate-task-description
 */
export const handleGenerateTaskDescription = asyncHandler(async (req, res) => {
  const { taskIdea, category, difficulty, expectedOutcome } = req.body

  const result = await generateTaskDescription({
    user: req.user,
    taskIdea,
    category,
    difficulty,
    expectedOutcome,
  })

  res.json({
    ok: true,
    title: result.title,
    description: result.description,
    instructions: result.instructions,
    objectives: result.objectives,
    deliverables: result.deliverables,
    criteria: result.criteria,
    source: result.source,
    provider: result.provider,
  })
})

