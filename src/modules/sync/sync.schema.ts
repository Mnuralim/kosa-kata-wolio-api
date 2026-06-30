import { z } from 'zod'

export const syncQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  updatedAfter: z.string().datetime().optional()
})

export type SyncQuery = z.infer<typeof syncQuerySchema>
