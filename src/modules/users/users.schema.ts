import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional()
})

export const updateUserSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  password: z.string().optional()
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
