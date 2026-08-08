import { Router } from 'express'
import { prisma } from '../prisma'
import { hashPassword, verifyPassword, signToken, setTokenCookie, clearTokenCookie, readSession } from '../auth'
import { validate, registerSchema, loginSchema } from '../validate'
import { AppError } from '../errors'

const router = Router()

function publicUser(u: { id: string; email: string; role: string }) {
  return { id: u.id, email: u.email, role: u.role }
}

router.post('/register', validate(registerSchema), async (req, res, next) => {
  const { email, password, role } = req.body
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return next(new AppError(409, 'email already registered'))
  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password), role },
  })
  setTokenCookie(res, signToken(user.id, user.role))
  res.status(201).json({ user: publicUser(user) })
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return next(new AppError(401, 'invalid credentials'))
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return next(new AppError(401, 'invalid credentials'))
  setTokenCookie(res, signToken(user.id, user.role))
  res.json({ user: publicUser(user) })
})

router.post('/logout', (_req, res) => {
  clearTokenCookie(res)
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  const session = readSession(req)
  res.json({ user: session })
})

export default router
