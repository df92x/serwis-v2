import { describe, expect, it } from 'vitest'
import { hydrateStateItems, parseOrder, parseOrderList, parseState } from './parse'

const sampleEntry = {
  id: 1710000000000,
  label: '03.09.2026 10:00',
  marka: 'KROSS',
  model: 'HEXAGON',
  kolor: 'CZARNY',
  tel: '123-456-789',
  termin: '04.09.2026',
  total: '150,00',
  state: JSON.stringify({
    items: [
      { name: 'Naprawa', price: 150, checked: true, customName: 'Przegląd podstawowy' },
      { name: 'Owijka/Chwyty', price: 0, checked: false },
    ],
    subs: [{ name: 'Łożyska', price: 40, checked: true }],
    tel: '123-456-789',
    marka: 'KROSS',
  }),
}

describe('parseOrder', () => {
  it('reads a legacy history entry', () => {
    const order = parseOrder(sampleEntry)
    expect(order?.id).toBe(1710000000000)
    expect(order?.marka).toBe('KROSS')
    expect(order?.tel).toBe('123-456-789')
    expect(order?.total).toBe('150,00')
  })

  it('skips entries without id', () => {
    expect(parseOrder({ marka: 'KROSS' })).toBeNull()
  })

  it('parses a list and drops junk', () => {
    const list = parseOrderList([sampleEntry, null, { foo: 1 }])
    expect(list).toHaveLength(1)
  })
})

describe('parseState + hydrate', () => {
  it('parses slim state JSON', () => {
    const st = parseState(sampleEntry.state)
    expect(st?.items[0].price).toBe(150)
    expect(st?.subs[0].name).toBe('Łożyska')
  })

  it('maps old part names and fills DEFAULTS', () => {
    const st = parseState(sampleEntry.state)
    expect(st).toBeTruthy()
    const full = hydrateStateItems(st!)
    expect(full.items.find(i => i.name === 'Owijka')).toBeTruthy()
    expect(full.items.find(i => i.name === 'Owijka/Chwyty')).toBeFalsy()
    expect(full.items.length).toBeGreaterThan(st!.items.length)
    expect(full.items.find(i => i.name === 'Naprawa')?.checked).toBe(true)
  })
})
