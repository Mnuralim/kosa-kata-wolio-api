import type { Response } from 'express'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: PaginationMeta
  errors?: unknown
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Berhasil',
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data
  } satisfies ApiResponse<T>)
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Berhasil dibuat'
): void {
  sendSuccess(res, data, message, 201)
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Berhasil'
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    meta
  } satisfies ApiResponse<T[]>)
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number,
  errors?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  } satisfies ApiResponse)
}
