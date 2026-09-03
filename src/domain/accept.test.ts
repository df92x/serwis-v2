import { describe, expect, it } from 'vitest'
import { buildAcceptedOrder, calcStateTotal, formatTotal } from './accept'

describe('accept order', () => {
  it('sums checked items and subs', () => {
    const total = calcStateTotal({
      items: [{ name: 'Naprawa', price: 150, checked: true }],
      subs: [{ name: 'Łożyska', price: 40, checked: true }],
    })
    expect(total).toBe(190)
    expect(formatTotal(total)).toBe('190,00')
  })

  it('stores client fields on the history entry', () => {
    const order = buildAcceptedOrder({
      marka: 'KROSS',
      model: 'X',
      kolor: 'CZARNY',
      tel: '123-456-789',
      termin: '04.09.2026',
      state: { items: [{ name: 'Naprawa', price: 50, checked: true }], subs: [] },
    })
    expect(order.marka).toBe('KROSS')
    expect(order.tel).toBe('123-456-789')
    expect(order.total).toBe('50,00')
    expect(order.state).toContain('Naprawa')
  })
})
