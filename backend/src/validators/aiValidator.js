import { z } from 'zod'

export const askHelpSchema = z.object({
  message: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(1, 'Please enter a question')
    .max(1000, 'Question must be under 1000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().max(1000),
      })
    )
    .max(20, 'Conversation history too long')
    .optional()
    .default([]),
})

export const generateTaskDescriptionSchema = z.object({
  taskIdea: z
    .string({ required_error: 'Task idea is required' })
    .trim()
    .min(3, 'Please enter a task idea of at least 3 characters')
    .max(1000, 'Task idea must be under 1000 characters'),
  category: z.string().trim().max(100).optional().default('General Engineering'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).optional().default('Intermediate'),
  expectedOutcome: z.string().trim().max(500).optional().default(''),
})

