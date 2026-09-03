import { describe, expect, it, beforeEach } from 'vitest'
import { STORAGE } from './keys'
import { readHistory, writeHistory } from './storage'
import type { Order } from '../domain/order'

describe('storage history', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips legacy entries through wycena-history', () => {
    const sample: Order = {
      id: 1,
      marka: 'TREK',
      tel: '111-222-333',
      total: '80,00',
    }
    writeHistory([sample])
    expect(JSON.parse(localStorage.getItem(STORAGE.history) || '[]')[0].marka).toBe('TREK')
    expect(readHistory()[0].tel).toBe('111-222-333')
  })
})
