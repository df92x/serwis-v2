import { describe, expect, it } from 'vitest'
import { DEFAULTS } from './catalog'
import { draftHasProgress } from './draft'

function emptyItems() {
  return DEFAULTS.map(d => ({ name: d.name, price: d.price, checked: !!d.checked, qty: d.qty }))
}

describe('draftHasProgress', () => {
  it('ignores empty new form defaults', () => {
    expect(draftHasProgress({
      marka: 'ROWER',
      model: '',
      items: emptyItems(),
      subs: [{ name: '', price: 0, checked: false }],
    })).toBe(false)
  })

  it('detects phone or extra service', () => {
    expect(draftHasProgress({
      marka: 'ROWER',
      tel: '123456789',
      items: emptyItems(),
      subs: [],
    })).toBe(true)
    const items = emptyItems()
    items[1] = { ...items[1], checked: true, price: 40 }
    expect(draftHasProgress({ marka: 'ROWER', items, subs: [] })).toBe(true)
  })
})
