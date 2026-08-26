import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { quizHistoryService } from './quiz-history.service'
import { sendSuccess, sendPaginated } from '@/utils/response'

export const quizHistoryController = {
  async listMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizHistoryService.listMine(req.user!.sub, req.query as Record<string, string>)
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attempt = await quizHistoryService.getMine(req.user!.sub, req.params.attemptId!)
      sendSuccess(res, attempt)
    } catch (err) {
      next(err)
    }
  },

  async listAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizHistoryService.listAll(req.query as Record<string, string>)
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attempt = await quizHistoryService.getById(req.params.attemptId!)
      sendSuccess(res, attempt)
    } catch (err) {
      next(err)
    }
  }
}
