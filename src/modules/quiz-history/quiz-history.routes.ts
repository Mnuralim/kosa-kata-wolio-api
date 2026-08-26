import { Router } from 'express'
import { quizHistoryController } from './quiz-history.controller'
import { authenticate, authorizeAll, authorize } from '@/middlewares/auth.middleware'

export const quizHistoryRoutes = Router()

quizHistoryRoutes.use(authenticate, authorizeAll)

quizHistoryRoutes.get('/me', quizHistoryController.listMine)
quizHistoryRoutes.get('/me/:attemptId', quizHistoryController.getMine)

quizHistoryRoutes.get('/admin', authorize('ADMIN', 'SUPER_ADMIN'), quizHistoryController.listAll)
quizHistoryRoutes.get('/admin/:attemptId', authorize('ADMIN', 'SUPER_ADMIN'), quizHistoryController.getById)
