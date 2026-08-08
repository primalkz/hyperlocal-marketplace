import { describe, it, expect } from 'vitest'
import { registerSchema, productSchema, nearbySchema, cartQtySchema } from '../src/validate'

describe('validation', () => {
  it('rejects a bad email on register', () => {
    expect(registerSchema.safeParse({ email: 'no', password: '123456', role: 'CUSTOMER' }).success).toBe(false)
  })

  it('accepts a valid vendor register', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: '123456', role: 'VENDOR' }).success).toBe(true)
  })

  it('rejects a negative product price', () => {
    expect(productSchema.safeParse({ title: 'x', image: 'https://x.com/i.png', price: -5, available: true }).success).toBe(false)
  })

  it('coerces nearby query strings to numbers', () => {
    const r = nearbySchema.safeParse({ lat: '19.07', lng: '72.87', radius: '5' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.lat).toBe(19.07)
  })

  it('rejects a non-integer cart quantity', () => {
    expect(cartQtySchema.safeParse({ quantity: 1.5 }).success).toBe(false)
  })
})
