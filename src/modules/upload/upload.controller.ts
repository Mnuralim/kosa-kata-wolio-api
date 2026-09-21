import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { imagekit } from '@/config/imagekit'
import { env } from '@/config/env'
import { HttpException } from '@/exceptions/http-exception'
import { cleanAudio } from '@/utils/audio-cleaner'
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
  },

  async uploadAudio(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const file = (req as unknown as { file?: Express.Multer.File }).file
      if (!file) {
        throw new HttpException(400, 'File audio tidak ditemukan')
      }

      const cleaned = await cleanAudio(file.buffer)

      const uploaded = await imagekit.upload({
        file: cleaned,
        fileName: file.originalname || `words-audio-${Date.now()}.m4a`,
        folder: 'words/audio',
        useUniqueFileName: true
      })

      sendSuccess(res, { url: uploaded.url }, 'Audio berhasil diupload')
    } catch (err) {
      next(err)
    }
  }
}
