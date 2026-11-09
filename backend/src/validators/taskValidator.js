import { z } from 'zod'

const isoDate = z
  .string({ required_error: 'Deadline is required' })
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Deadline must be a valid date')

export const createTaskSchema = z.object({
  title: z.string({ required_error: 'Task title is required' }).trim().min(4, 'Title must be at least 4 characters').max(140),
  code: z.string().trim().max(24).optional().or(z.literal('')),
  description: z.string({ required_error: 'Task description is required' }).trim().min(10, 'Description must be at least 10 characters').max(4000),
  instructions: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  type: z.enum(['daily', 'weekly']).default('daily'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  points: z
    .number({ required_error: 'Points available is required', invalid_type_error: 'Points must be a number' })
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(100000),
  deadline: isoDate,
  assignment: z
    .object({
      mode: z.enum(['all', 'individual']).default('all'),
      interns: z.array(z.string().length(24, 'Invalid intern id')).max(500).default([]),
    })
    .default({ mode: 'all', interns: [] }),
})

export const updateTaskSchema = createTaskSchema.partial()
