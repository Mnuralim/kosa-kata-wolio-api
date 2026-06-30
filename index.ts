import { app } from '@/app'
import { env } from '@/config/env'
import { logger } from '@/utils/logger'

const server = app.listen(env.PORT, () => {
  logger.info(`${env.APP_NAME} berjalan di port ${env.PORT}`)
  logger.info(`Environment: ${env.NODE_ENV}`)
  logger.info(`Health check: http://localhost:${env.PORT}/health`)
  logger.info(`API base: http://localhost:${env.PORT}/api/v1`)
})

// Graceful shutdown
function shutdown(signal: string) {
  logger.info(`${signal} diterima, menutup server...`)

  server.close((err) => {
    if (err) {
      logger.error(err, 'Error saat menutup server')
      process.exit(1)
    }
    logger.info('Server ditutup')
    process.exit(0)
  })

  // Force shutdown after 10 detik
  setTimeout(() => {
    logger.error('Force shutdown setelah 10 detik')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled Rejection')
  process.exit(1)
})
