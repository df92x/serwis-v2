import { describe, expect, it } from 'vitest'
import { applyCrToItems, calcCrTotal } from './cr'
import { DEFAULTS } from './catalog'

describe('cr', () => {
  it('sums assembly + extras', () => {
    expect(calcCrTotal({ assemblyId: 'mtb', extras: ['stopka'] }, false)).toBe(168)
    expect(calcCrTotal({ assemblyId: 'mtb', extras: [] }, true)).toBe(199)
  })

  it('writes Naprawa customName and clears other checks', () => {
    const items = DEFAULTS.map(d => ({ name: d.name, price: d.price, checked: !!d.checked, qty: d.qty }))
    items[1] = { ...items[1], checked: true, price: 40 }
    const next = applyCrToItems(items, { assemblyId: 'kids', extras: ['licznik'] }, false)
    const naprawa = next.find(x => x.name === 'Naprawa')!
    expect(naprawa.checked).toBe(true)
    expect(naprawa.price).toBe(128)
    expect(naprawa.customName).toContain('Dziecięcy')
    expect(next.find(x => x.name === 'Mechanizm korbowy')!.checked).toBe(false)
  })
})
