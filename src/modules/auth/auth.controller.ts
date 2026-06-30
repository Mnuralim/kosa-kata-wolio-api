import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { authService } from './auth.service'
import { sendSuccess } from '@/utils/response'

export const authController = {
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      sendSuccess(res, result, 'Login berhasil')
    } catch (err) {
      next(err)
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.sub)
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  },

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await authService.changePassword(req.user!.sub, req.body)
      sendSuccess(res, null, 'Password berhasil diperbarui')
    } catch (err) {
      next(err)
    }
  }
}
