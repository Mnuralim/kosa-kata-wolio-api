import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import type { Request } from 'express'
import { quizService } from './quiz.service'
import { sendSuccess, sendCreated, sendPaginated } from '@/utils/response'

export const quizController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizService.list(req.query as Record<string, string>)
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.getById(req.params.id!)
      sendSuccess(res, quiz)
    } catch (err) {
      next(err)
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.create(req.body)
      sendCreated(res, quiz, 'Kuis berhasil dibuat')
    } catch (err) {
      next(err)
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.update(req.params.id!, req.body)
      sendSuccess(res, quiz, 'Kuis berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await quizService.delete(req.params.id!)
      sendSuccess(res, null, 'Kuis berhasil dihapus')
    } catch (err) {
      next(err)
    }
  },

  async addQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const question = await quizService.addQuestion(req.params.id!, req.body)
      sendCreated(res, question, 'Soal berhasil ditambahkan')
    } catch (err) {
      next(err)
    }
  },

  async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await quizService.deleteQuestion(req.params.questionId!)
      sendSuccess(res, null, 'Soal berhasil dihapus')
    } catch (err) {
      next(err)
    }
  },

  // --- Public ---

  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const level = (req.query.level as string) ?? 'EASY'
      const quizzes = await quizService.listPublicByLevel(level)
      sendSuccess(res, quizzes)
    } catch (err) {
      next(err)
    }
  },

  async play(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.getForPlay(req.params.id!)
      sendSuccess(res, quiz)
    } catch (err) {
      next(err)
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await quizService.submitAnswers(req.params.id!, req.body)
      sendSuccess(res, result, 'Jawaban berhasil dikirim')
    } catch (err) {
      next(err)
    }
  }
}
