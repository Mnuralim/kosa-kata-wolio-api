import { z } from 'zod'

export const createWordSchema = z.object({
  indonesian: z.string().min(1, 'Bahasa Indonesia wajib diisi'),
  localLanguage: z.string().min(1, 'Bahasa lokal wajib diisi'),
  localScript: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Kategori wajib diisi'),
  audioUrls: z.array(z.string().url()).optional().default([])
})

export const updateWordSchema = z.object({
  indonesian: z.string().min(1, 'Bahasa Indonesia wajib diisi'),
  localLanguage: z.string().min(1, 'Bahasa lokal wajib diisi'),
  localScript: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Kategori wajib diisi'),
  audioUrls: z.array(z.string().url()).optional()
})

export const updateLocalScriptSchema = z.object({
  localScript: z.string().optional().nullable()
})

export const audioUrlSchema = z.object({
  url: z.string().url('URL audio tidak valid')
})

export const wordIdSchema = z.object({
  wordId: z.string().min(1, 'ID kata wajib diisi')
})

export const addAudioSchema = audioUrlSchema.merge(wordIdSchema)
export const replaceAudioSchema = audioUrlSchema.merge(wordIdSchema)

export type CreateWordInput = z.infer<typeof createWordSchema>
export type UpdateWordInput = z.infer<typeof updateWordSchema>
export type AddAudioInput = z.infer<typeof addAudioSchema>
export type ReplaceAudioInput = z.infer<typeof replaceAudioSchema>
