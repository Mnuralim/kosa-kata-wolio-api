import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { wordsService } from './words.service'
import { sendSuccess, sendCreated, sendPaginated } from '@/utils/response'

export const wordsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await wordsService.list(
        req.query as Record<string, string>
      )
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const word = await wordsService.getById(req.params.id!)
      sendSuccess(res, word)
    } catch (err) {
      next(err)
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const word = await wordsService.create(req.body)
      sendCreated(res, word, 'Kata berhasil dibuat')
    } catch (err) {
      next(err)
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const word = await wordsService.update(req.params.id!, req.body)
      sendSuccess(res, word, 'Kata berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  },

  async updateLocalScript(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const word = await wordsService.updateLocalScript(
        req.params.id!,
        req.body.localScript
      )
      sendSuccess(res, word, 'Aksara wolio berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await wordsService.delete(req.params.id!)
      sendSuccess(res, null, 'Kata berhasil dihapus')
    } catch (err) {
      next(err)
    }
  },

  async addAudio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const audio = await wordsService.addAudio(
        req.body.wordId,
        req.body.url
      )
      sendCreated(res, audio, 'Audio berhasil ditambahkan')
    } catch (err) {
      next(err)
    }
  },

  async deleteAudio(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await wordsService.deleteAudio(req.params.audioId!)
      sendSuccess(res, null, 'Audio berhasil dihapus')
    } catch (err) {
      next(err)
    }
  },

  async replaceAudio(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const audio = await wordsService.replaceAudio(
        req.body.wordId,
        req.body.url
      )
      sendSuccess(res, audio, 'Audio berhasil diganti')
    } catch (err) {
      next(err)
    }
  },

  async stats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await wordsService.getStats()
      sendSuccess(res, stats)
    } catch (err) {
      next(err)
    }
  }
}
