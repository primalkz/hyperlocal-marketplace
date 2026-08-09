import bcrypt from 'bcryptjs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from './errors'

const COOKIE = 'token'
const MAX_AGE = 60 * 60 * 24 * 7

const secret = process.env.JWT_SECRET as string

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function signToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: '7d' })
}

export function setTokenCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: MAX_AGE * 1000,
    path: '/',
  })
}

export function clearTokenCookie(res: Response) {
  const secure = process.env.NODE_ENV === 'production'
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  })
}

type Session = { userId: string; role: string }

export function readSession(req: Request): Session | null {
  const header = req.headers.cookie
  if (!header) return null
  const token = parseCookie(header, COOKIE)
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null
    return { userId: payload.sub, role: payload.role }
  } catch {
    return null
  }
}

function parseCookie(header: string, name: string): string | undefined {
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const session = readSession(req)
    if (!session) return next(new AppError(401, 'login required'))
    if (session.role !== role) return next(new AppError(403, 'not allowed'))
    req.user = session
    next()
  }
}
