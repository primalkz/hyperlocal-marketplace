import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from './errors'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['VENDOR', 'CUSTOMER']),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const shopSchema = z.object({
  name: z.string().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export const productSchema = z.object({
  title: z.string().min(1).max(200),
  image: z.string().url(),
  price: z.number().nonnegative(),
  available: z.boolean(),
})

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
})

export const cartQtySchema = z.object({
  quantity: z.number().int().min(0),
})

export const adminStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'DISABLED']),
})

export const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(100).optional(),
})

export function validate<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const msg = result.error.issues.map(i => i.message).join(', ')
      return next(new AppError(400, msg))
    }
    req.body = result.data
    next()
  }
}
