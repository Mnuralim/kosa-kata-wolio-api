import type { Request, Response, NextFunction } from 'express'
import type { Role } from '@/generated/prisma/client'
import { verifyAccessToken, type TokenPayload } from '@/utils/jwt'
import { UnauthorizedException, ForbiddenException } from '@/exceptions'

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token tidak ditemukan')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException('Token tidak valid')
    }

    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof UnauthorizedException) {
      next(err)
      return
    }
    next(new UnauthorizedException('Token tidak valid atau sudah kadaluarsa'))
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedException())
      return
    }

    if (roles.length === 0) {
      next()
      return
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenException())
      return
    }

    next()
  }
}

export function authorizeAll(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new UnauthorizedException())
    return
  }
  next()
}
