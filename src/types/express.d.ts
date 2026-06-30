import type { Role } from '@/generated/prisma/client'
import type { TokenPayload } from '@/utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
      validatedQuery?: unknown
      validatedParams?: unknown
    }
  }
}

export type { Role, TokenPayload }
