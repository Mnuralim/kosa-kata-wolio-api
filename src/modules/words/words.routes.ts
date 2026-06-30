import { Router } from 'express'
import { wordsController } from './words.controller'
import { authenticate, authorizeAll } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import {
  createWordSchema,
  updateWordSchema,
  addAudioSchema,
  replaceAudioSchema,
  updateLocalScriptSchema
} from './words.schema'

export const wordsRoutes = Router()

wordsRoutes.use(authenticate, authorizeAll)

// Stats
wordsRoutes.get('/stats', wordsController.stats)

// Words CRUD
wordsRoutes.get('/', wordsController.list)
wordsRoutes.get('/:id', wordsController.getById)
wordsRoutes.post('/', validate(createWordSchema), wordsController.create)
wordsRoutes.patch('/:id', validate(updateWordSchema), wordsController.update)
wordsRoutes.patch(
  '/:id/local-script',
  validate(updateLocalScriptSchema),
  wordsController.updateLocalScript
)
wordsRoutes.delete('/:id', wordsController.delete)

// Audio
wordsRoutes.post(
  '/audio',
  validate(addAudioSchema),
  wordsController.addAudio
)
wordsRoutes.delete('/audio/:audioId', wordsController.deleteAudio)
wordsRoutes.post(
  '/audio/replace',
  validate(replaceAudioSchema),
  wordsController.replaceAudio
)
