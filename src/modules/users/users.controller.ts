import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { usersService } from './users.service'
import { sendSuccess, sendCreated, sendPaginated } from '@/utils/response'

export const usersController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await usersService.list(req.query as Record<string, string>)
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.params.id!)
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body, req.user!)
      sendCreated(res, user, 'User berhasil dibuat')
    } catch (err) {
      next(err)
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id!, req.body, req.user!)
      sendSuccess(res, user, 'User berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id!, req.user!)
      sendSuccess(res, null, 'User berhasil dihapus')
    } catch (err) {
      next(err)
    }
  }
}
