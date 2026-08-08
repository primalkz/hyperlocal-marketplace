import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('app', () => {
  it('returns null user when not logged in', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ user: null })
  })
})
