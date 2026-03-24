import { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const body = registerSchema.parse(req.body)
      const result = await authService.register(
        body.name, body.email, body.password
      )
      sendSuccess(res, { token: result.token, user: result.user }, 'Account created successfully', 201)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return sendError(res, err.errors[0].message, 400, 'VALIDATION_ERROR')
      }
      if (err.message === 'Email already registered') {
        return sendError(res, 'Email already registered', 409, 'DUPLICATE_EMAIL')
      }
      sendError(res, 'Registration failed. Please try again.', 500)
    }
  },

  async login(req: Request, res: Response) {
    try {
      const body = loginSchema.parse(req.body)
      const result = await authService.login(
        body.email, body.password
      )
      sendSuccess(res, { token: result.token, user: result.user }, 'Login successful')
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return sendError(res, err.errors[0].message, 400, 'VALIDATION_ERROR')
      }
      if (err.message === 'Invalid credentials') {
        return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS')
      }
      sendError(res, 'Login failed. Please try again.', 500)
    }
  }
}
