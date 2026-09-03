import { describe, expect, it } from 'vitest'
import { eurToPln, plnToEur } from '../integrations/euro'
import { unarchiveOrder, releaseOrder } from './lifecycle'

describe('euro convert', () => {
  it('round-trips roughly', () => {
    const rate = 4.25
    expect(eurToPln(10, rate)).toBe(42.5)
    expect(plnToEur(42.5, rate)).toBe(10)
  })
})

describe('unarchiveOrder', () => {
  it('clears wydanie fields and stamps unarchivedAt', () => {
    const released = releaseOrder({
      id: 1,
      total: '50,00',
      raportKoncowy: { items: [], subs: [], total: '50,00' },
    })
    const back = unarchiveOrder(released)
    expect(back.archivedAt).toBeUndefined()
    expect(back.dataWydania).toBeUndefined()
    expect(back.unarchivedAt).toBeTruthy()
    expect(back.raportKoncowy).toBeTruthy()
  })
})
