import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { categoriesService } from './categories.service'
import { sendSuccess, sendCreated, sendPaginated } from '@/utils/response'

export const categoriesController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await categoriesService.list(
        req.query as Record<string, string>
      )
      sendPaginated(res, result.data, result.meta)
    } catch (err) {
      next(err)
    }
  },

  async listSimple(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categories = await categoriesService.listSimple()
      sendSuccess(res, categories)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.getById(req.params.id!)
      sendSuccess(res, category)
    } catch (err) {
      next(err)
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.create(req.body)
      sendCreated(res, category, 'Kategori berhasil dibuat')
    } catch (err) {
      next(err)
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.update(req.params.id!, req.body)
      sendSuccess(res, category, 'Kategori berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await categoriesService.delete(req.params.id!)
      sendSuccess(res, null, 'Kategori berhasil dihapus')
    } catch (err) {
      next(err)
    }
  }
}
