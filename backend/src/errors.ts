import type { ErrorRequestHandler } from 'express'

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof AppError ? err.status : 500
  const message = err instanceof AppError ? err.message : 'server error'
  if (status >= 500) console.error(err)
  res.status(status).json({ error: message })
}
