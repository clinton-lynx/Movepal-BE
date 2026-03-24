import { Response } from 'express'

export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  })
}

export const sendError = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errorCode?: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode: errorCode || null,
    timestamp: new Date().toISOString(),
  })
}
