import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import { loginSchema, changePasswordSchema } from './auth.schema'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), authController.login)
authRoutes.get('/me', authenticate, authorizeAll, authController.getMe)
authRoutes.post(
  '/change-password',
  authenticate,
  authorizeAll,
  validate(changePasswordSchema),
  authController.changePassword
)
