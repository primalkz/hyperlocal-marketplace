import { describe, it, expect } from 'vitest'
import type { Request } from 'express'
import { hashPassword, verifyPassword, signToken, readSession } from '../src/auth'

function reqWithCookie(cookie: string) {
  return { headers: { cookie } } as unknown as Request
}

describe('auth', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('hunter22')
    expect(await verifyPassword('hunter22', hash)).toBe(true)
    expect(await verifyPassword('nope', hash)).toBe(false)
  })

  it('round trips a token through the cookie', () => {
    const token = signToken('user-1', 'CUSTOMER')
    const session = readSession(reqWithCookie(`token=${token}; other=x`))
    expect(session).toEqual({ userId: 'user-1', role: 'CUSTOMER' })
  })

  it('returns no session without a cookie', () => {
    expect(readSession(reqWithCookie(''))).toBeNull()
    expect(readSession({ headers: {} } as unknown as Request)).toBeNull()
  })
})
