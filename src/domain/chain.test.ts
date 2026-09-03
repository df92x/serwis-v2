import { describe, expect, it } from 'vitest'
import { calcChain } from './chain'

describe('calcChain', () => {
  it('returns even link count for typical road bike', () => {
    const r = calcChain(50, 16, 42)
    expect(r).not.toBeNull()
    expect(r!.ogniwa % 2).toBe(0)
    expect(r!.ogniwa).toBeGreaterThan(90)
  })

  it('returns null when incomplete', () => {
    expect(calcChain(0, 16, 42)).toBeNull()
  })
})
