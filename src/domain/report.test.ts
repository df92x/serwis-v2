import { describe, expect, it } from 'vitest'
import { orderReportText } from './report'

describe('orderReportText', () => {
  it('includes bike, phone and total', () => {
    const text = orderReportText({
      id: 1,
      marka: 'KROSS',
      model: 'LEVEL',
      tel: '123-456-789',
      total: '120,00',
      state: JSON.stringify({
        items: [{ name: 'Łańcuch', price: 40, checked: true }],
        subs: [],
      }),
    })
    expect(text).toContain('KROSS LEVEL')
    expect(text).toContain('123-456-789')
    expect(text).toContain('120,00')
    expect(text).toContain('Łańcuch')
  })
})
