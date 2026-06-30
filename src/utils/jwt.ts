import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import type { Role } from '@/generated/prisma/client'

export interface TokenPayload {
  sub: string
  username: string
  name: string
  role: Role
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
