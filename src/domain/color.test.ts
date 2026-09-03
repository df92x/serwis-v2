import { describe, expect, it } from 'vitest'
import { kolorBackgroundStyle, kolorCss } from './color'

describe('kolor', () => {
  it('maps named colors and hex', () => {
    expect(kolorCss('CZERWONY')).toBe('#dc2626')
    expect(kolorCss('aabbcc')).toBe('#aabbcc')
  })

  it('builds dual gradient', () => {
    const bg = kolorBackgroundStyle('CZARNY/BIAŁY')
    expect(bg).toContain('linear-gradient')
    expect(bg).toContain('#111')
  })
})
