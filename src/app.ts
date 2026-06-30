import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from '@/config/env'
import { httpLogger } from '@/middlewares/http-logger.middleware'
import { errorMiddleware } from '@/middlewares/error.middleware'
import { apiRoutes } from '@/routes'

export const app = express()

// Security headers
app.use(helmet())

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(httpLogger)

// CORS
app.use(
  cors({
    origin: env.NODE_ENV === 'production'
      ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : '*',
    credentials: true
  })
)

// Health check
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

// API routes
app.use('/api/v1', apiRoutes)

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  })
})

// Global error handler
app.use(errorMiddleware)
