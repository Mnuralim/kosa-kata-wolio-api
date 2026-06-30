import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { imagekit } from '@/config/imagekit'
import { env } from '@/config/env'
import { sendSuccess } from '@/utils/response'

export const uploadController = {
  getImageKitAuth(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authParams = imagekit.getAuthenticationParameters()
      sendSuccess(res, {
        ...authParams,
        publicKey: env.IMAGEKIT_PUBLIC_KEY
      }, 'Parameter autentikasi ImageKit')
    } catch (err) {
      next(err)
    }
  }
}
