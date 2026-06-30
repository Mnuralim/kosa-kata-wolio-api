import { Router } from 'express'
import { uploadController } from './upload.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'

export const uploadRoutes = Router()

uploadRoutes.use(authenticate, authorizeAll)

uploadRoutes.get('/imagekit-auth', uploadController.getImageKitAuth)
