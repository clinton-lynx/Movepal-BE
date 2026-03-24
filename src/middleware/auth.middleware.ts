import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthPayload } from '../types/auth'
import { sendError } from '../utils/response'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return sendError(res, 'Authentication token required', 401, 'NO_TOKEN')
  }
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET!
    ) as AuthPayload
    req.user = decoded
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401, 'INVALID_TOKEN')
  }
}
