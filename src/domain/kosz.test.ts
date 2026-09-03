import { describe, expect, it } from 'vitest'
import { filterAliveKosz, isWithinKoszTtl, KOSZ_TTL_MS } from './kosz'

describe('kosz ttl', () => {
  it('keeps fresh entries', () => {
    const now = Date.now()
    expect(isWithinKoszTtl(now - 1000, now)).toBe(true)
    expect(isWithinKoszTtl(now - KOSZ_TTL_MS - 1, now)).toBe(false)
  })

  it('splits alive vs expired ids', () => {
    const now = Date.now()
    const { alive, expiredIds } = filterAliveKosz([
      { id: 1, deletedAt: now },
      { id: 2, deletedAt: now - KOSZ_TTL_MS - 5 },
    ], now)
    expect(alive.map(x => x.id)).toEqual([1])
    expect(expiredIds).toEqual([2])
  })
})
