import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { syncService } from './sync.service'
import { sendSuccess, sendPaginated } from '@/utils/response'

export const syncController = {
  async getWords(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await syncService.getWords(
        (req as unknown as { validatedQuery: unknown }).validatedQuery as {
          page?: string
          limit?: string
          updatedAfter?: string
        } || req.query
      )
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getCategories(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await syncService.getCategories(
        (req as unknown as { validatedQuery: unknown }).validatedQuery as {
          page?: string
          limit?: string
          updatedAfter?: string
        } || req.query
      )
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getVersion(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const version = await syncService.getSyncVersion()
      sendSuccess(res, version)
    } catch (err) {
      next(err)
    }
  }
}
