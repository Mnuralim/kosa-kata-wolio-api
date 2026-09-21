import { Router } from 'express'
import multer from 'multer'
import { uploadController } from './upload.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'
import { HttpException } from '@/exceptions/http-exception'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true)
    else cb(new HttpException(415, 'File harus berupa audio'))
  }
})

export const uploadRoutes = Router()

uploadRoutes.use(authenticate, authorizeAll)

uploadRoutes.get('/imagekit-auth', uploadController.getImageKitAuth)
uploadRoutes.post('/audio', upload.single('file'), uploadController.uploadAudio)
