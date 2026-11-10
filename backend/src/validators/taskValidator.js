import { z } from 'zod'

const isoDate = z
  .string({ required_error: 'Deadline is required' })
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Deadline must be a valid date')

const baseTaskSchema = z.object({
  title: z.string({ required_error: 'Task title is required' }).trim().min(1, 'Task title is required').max(140),
  code: z.string().trim().max(24).optional().or(z.literal('')),
  description: z.string({ required_error: 'Task description is required' }).trim().min(1, 'Task description is required').max(4000),
  instructions: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  type: z.enum(['daily', 'weekly']).default('daily'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  points: z
    .coerce
    .number({ required_error: 'Points available is required', invalid_type_error: 'Points must be a number' })
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(100000),
  deadline: isoDate,
  assignment: z
    .object({
      mode: z.enum(['all', 'individual']).default('all'),
      interns: z.array(z.string()).max(500).default([]),
    })
    .refine(
      (data) => data.mode !== 'individual' || (Array.isArray(data.interns) && data.interns.length > 0),
      { message: 'Please select at least one intern to assign this task.', path: ['interns'] }
    )
    .default({ mode: 'all', interns: [] }),
})

function preprocessTaskInput(raw) {
  if (typeof raw !== 'object' || raw === null) return raw
  const obj = { ...raw }
  if (!obj.assignment && (obj.assignmentMode || obj.assignedInterns)) {
    obj.assignment = {
      mode: obj.assignmentMode || (Array.isArray(obj.assignedInterns) && obj.assignedInterns.length > 0 ? 'individual' : 'all'),
      interns: Array.isArray(obj.assignedInterns) ? obj.assignedInterns : [],
    }
  }
  if (typeof obj.instructions === 'string') {
    obj.instructions = obj.instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return obj
}

export const createTaskSchema = z.preprocess(preprocessTaskInput, baseTaskSchema)
export const updateTaskSchema = z.preprocess(preprocessTaskInput, baseTaskSchema.partial())
