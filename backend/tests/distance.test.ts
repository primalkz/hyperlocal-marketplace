import { describe, it, expect } from 'vitest'
import { haversine } from '../src/distance'

describe('haversine', () => {
  it('is zero for the same point', () => {
    expect(haversine(19.076, 72.8777, 19.076, 72.8777)).toBe(0)
  })

  it('matches a known distance within tolerance', () => {
    const d = haversine(0, 0, 0, 1)
    expect(d).toBeGreaterThan(110)
    expect(d).toBeLessThan(112)
  })
})
