import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { MulterError } from 'multer'
import { Prisma } from '@/generated/prisma/client'
import { HttpException } from '@/exceptions/http-exception'
import { logger } from '@/utils/logger'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {

  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
    return
  }

  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    })
    return
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikat)'
    })
    return
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2025'
  ) {
    res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan'
    })
    return
  }

  if (err instanceof MulterError) {
    res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      success: false,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file melebihi batas 15MB'
          : 'File upload tidak valid'
    })
    return
  }

  logger.error(err, 'Unhandled error')

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server'
  })
}
