import { z } from 'zod'

export const quizLevelSchema = z.enum(['EASY', 'MEDIUM', 'HARD'])

export const quizQuestionTypeSchema = z.enum([
  'ID_TO_LOCAL',
  'LOCAL_TO_ID',
  'SCRIPT_TO_ID',
  'SCRIPT_TO_LOCAL',
  'AUDIO_TO_ID',
  'AUDIO_TO_LOCAL'
])

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Judul kuis wajib diisi'),
  level: quizLevelSchema
})

export const updateQuizSchema = z.object({
  title: z.string().min(1, 'Judul kuis wajib diisi'),
  level: quizLevelSchema
})

export const createQuestionSchema = z.object({
  wordId: z.string().min(1, 'Kata wajib dipilih'),
  type: quizQuestionTypeSchema.optional(),
  distractorWordIds: z
    .array(z.string())
    .length(3, 'Wajib pilih 3 pengecoh')
    .optional(),
  order: z.number().int().min(0).optional()
})

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        answer: z.string().min(1)
      })
    )
    .min(1, 'Jawaban wajib diisi')
})

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>
