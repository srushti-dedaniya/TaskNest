import { z } from 'zod'

const url = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(4, `${label} is required`)
    .max(600)
    .refine((s) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?$/i.test(s), `${label} is not a valid URL`)

export const createSubmissionSchema = z.object({
  taskId: z.string({ required_error: 'taskId is required' }).length(24, 'Invalid task id'),
  repoUrl: url('GitHub repository URL'),
  liveUrl: url('Live deployment URL'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  attachmentPath: z.string().trim().max(400).optional().or(z.literal('')),
})
