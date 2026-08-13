import { Router } from 'express'
import { authRoutes } from '@/modules/auth/auth.routes'
import { usersRoutes } from '@/modules/users/users.routes'
import { categoriesRoutes } from '@/modules/categories/categories.routes'
import { wordsRoutes } from '@/modules/words/words.routes'
import { uploadRoutes } from '@/modules/upload/upload.routes'
import { syncRoutes } from '@/modules/sync/sync.routes'
import { quizRoutes, quizAdminRoutes } from '@/modules/quiz/quiz.routes'

export const apiRoutes = Router()

apiRoutes.use('/auth', authRoutes)
apiRoutes.use('/users', usersRoutes)
apiRoutes.use('/categories', categoriesRoutes)
apiRoutes.use('/words', wordsRoutes)
apiRoutes.use('/upload', uploadRoutes)
apiRoutes.use('/sync', syncRoutes)
apiRoutes.use('/quiz/admin', quizAdminRoutes)
apiRoutes.use('/quiz', quizRoutes)
