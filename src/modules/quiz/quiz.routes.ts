import { Router } from 'express'
import { quizController } from './quiz.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  submitQuizSchema
} from './quiz.schema'

export const quizRoutes = Router()
export const quizAdminRoutes = Router()

// Public — no auth, dipakai halaman user
quizRoutes.get('/', quizController.listPublic)
quizRoutes.get('/:id/play', quizController.play)
quizRoutes.post('/:id/submit', validate(submitQuizSchema), quizController.submit)

// Admin — auth required, dipakai app admin buat kelola soal & kunci jawaban
quizAdminRoutes.use(authenticate, authorizeAll)

quizAdminRoutes.get('/', quizController.list)
quizAdminRoutes.get('/:id', quizController.getById)
quizAdminRoutes.post('/', validate(createQuizSchema), quizController.create)
quizAdminRoutes.patch('/:id', validate(updateQuizSchema), quizController.update)
quizAdminRoutes.delete('/:id', quizController.delete)

quizAdminRoutes.post(
  '/:id/questions',
  validate(createQuestionSchema),
  quizController.addQuestion
)
quizAdminRoutes.delete('/questions/:questionId', quizController.deleteQuestion)
