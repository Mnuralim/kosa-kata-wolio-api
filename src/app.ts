import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from '@/config/env'
import { httpLogger } from '@/middlewares/http-logger.middleware'
import { errorMiddleware } from '@/middlewares/error.middleware'
import { apiRoutes } from '@/routes'

export const app = express()

app.use(helmet())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(httpLogger)

app.use(
  cors({
    origin: env.NODE_ENV === 'production'
      ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : '*',
    credentials: true
  })
)

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: `${env.APP_NAME} is running`,
    environment: env.NODE_ENV
  })
})

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

app.use('/api/v1', apiRoutes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  })
})

app.use(errorMiddleware)
