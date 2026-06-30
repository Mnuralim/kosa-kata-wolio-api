import { Router } from 'express'
import { categoriesController } from './categories.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import { createCategorySchema, updateCategorySchema } from './categories.schema'

export const categoriesRoutes = Router()

categoriesRoutes.use(authenticate, authorizeAll)

categoriesRoutes.get('/', categoriesController.list)
categoriesRoutes.get('/simple', categoriesController.listSimple)
categoriesRoutes.get('/:id', categoriesController.getById)
categoriesRoutes.post(
  '/',
  validate(createCategorySchema),
  categoriesController.create
)
categoriesRoutes.patch(
  '/:id',
  validate(updateCategorySchema),
  categoriesController.update
)
categoriesRoutes.delete('/:id', categoriesController.delete)
