import { describe, expect, it } from 'vitest'
import { orderStatus, type Order } from '../domain/order'

describe('orderStatus', () => {
  it('przyjete when no raport', () => {
    const o: Order = { id: 1 }
    expect(orderStatus(o)).toBe('przyjete')
  })

  it('gotowe when raport exists', () => {
    const o: Order = {
      id: 1,
      raportKoncowy: { items: [], subs: [], total: '0' },
    }
    expect(orderStatus(o)).toBe('gotowe')
  })

  it('wydane when archived', () => {
    const o: Order = { id: 1, archivedAt: '2026-01-01' }
    expect(orderStatus(o)).toBe('wydane')
  })
})
