import pinoHttp from 'pino-http'
import { logger } from '@/utils/logger'

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health'
  },
  customLogLevel: (req, res) => {
    if (res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  }
})
