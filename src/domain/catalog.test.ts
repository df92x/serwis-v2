import { describe, expect, it } from 'vitest'
import { applyNaprawaOptions, applyPreset, findDefault, NAPRAWA_SERVICES } from './catalog'

describe('catalog presets', () => {
  it('has chain and cassette presets', () => {
    expect(findDefault('Łańcuch')?.presets?.length).toBeGreaterThan(5)
    expect(findDefault('Kaseta')?.presets?.[0].label).toContain('Wolnobieg')
  })

  it('sums Naprawa options', () => {
    const r = applyNaprawaOptions([
      { id: 'drobne', label: 'Drobne naprawy', price: 50 },
      { id: 'przygotowanie', label: 'Przygotowanie', price: 100 },
    ])
    expect(r.price).toBe(150)
    expect(r.customName).toContain('Drobne')
    expect(r.checked).toBe(true)
    expect(NAPRAWA_SERVICES).toHaveLength(9)
  })

  it('applyPreset sets price and label', () => {
    const p = applyPreset(79, '10s Shimano', 2)
    expect(p).toEqual({ price: 79, customName: '10s Shimano', selectedPreset: 3, checked: true })
  })
})
