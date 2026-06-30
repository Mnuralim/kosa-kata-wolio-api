import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      next(result.error)
      return
    }

    // Express 5: body is writable, but query/params are not
    if (target === 'body') {
      req.body = result.data
    } else if (target === 'query') {
      ;(req as unknown as { validatedQuery: unknown }).validatedQuery = result.data
    } else {
      ;(req as unknown as { validatedParams: unknown }).validatedParams = result.data
    }

    next()
  }
}
