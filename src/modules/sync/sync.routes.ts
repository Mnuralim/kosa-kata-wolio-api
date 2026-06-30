import { Router } from 'express'
import { syncController } from './sync.controller'
import { validate } from '@/middlewares/validate.middleware'
import { syncQuerySchema } from './sync.schema'

export const syncRoutes = Router()

// Public — mobile app akses tanpa auth
syncRoutes.get(
  '/words',
  validate(syncQuerySchema, 'query'),
  syncController.getWords
)
syncRoutes.get(
  '/categories',
  validate(syncQuerySchema, 'query'),
  syncController.getCategories
)
syncRoutes.get('/version', syncController.getVersion)
