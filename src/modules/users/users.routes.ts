import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import { createUserSchema, updateUserSchema } from './users.schema'

export const usersRoutes = Router()

usersRoutes.use(authenticate, authorize('SUPER_ADMIN'))

usersRoutes.get('/', usersController.list)
usersRoutes.get('/:id', usersController.getById)
usersRoutes.post('/', validate(createUserSchema), usersController.create)
usersRoutes.patch('/:id', validate(updateUserSchema), usersController.update)
usersRoutes.delete('/:id', usersController.delete)
