import { describe, expect, it } from 'vitest'
import { computeValidUntil, genUnique8, rabEntryKey, validityMonthsStored } from './rabaty'

describe('rabaty', () => {
  it('entry key prefers id', () => {
    expect(rabEntryKey({ id: 12, tel: '111' })).toBe('12')
  })

  it('validity months and until', () => {
    expect(validityMonthsStored('6')).toBe(6)
    expect(validityMonthsStored('fix2026')).toBe(0)
    const until = computeValidUntil(Date.UTC(2026, 0, 1), 'fix2026')
    expect(new Date(until).getFullYear()).toBe(2026)
  })

  it('unique 8-digit codes', () => {
    const c = genUnique8(['11111111'])
    expect(c).toHaveLength(8)
    expect(c).not.toBe('11111111')
  })
})
