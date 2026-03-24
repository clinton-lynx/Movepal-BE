import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`)

  sendError(
    res,
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
    500,
    'INTERNAL_ERROR'
  )
}
