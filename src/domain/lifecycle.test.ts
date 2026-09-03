import { describe, expect, it } from 'vitest'
import { finishRepair, releaseOrder, upsertById } from './lifecycle'

const base = {
  id: 1,
  marka: 'KROSS',
  total: '100,00',
  state: '{"items":[],"subs":[]}',
}

describe('lifecycle', () => {
  it('finishRepair writes raport and keeps acceptance total', () => {
    const done = finishRepair(base, {
      items: [{ name: 'Naprawa', price: 120, checked: true }],
      subs: [],
    }, 'ok')
    expect(done.raportKoncowy?.total).toBe('120,00')
    expect(done.total).toBe('120,00')
    expect(done.totalPrzedRaportem).toBe('100,00')
    expect(done.kodOdbioru).toHaveLength(5)
  })

  it('releaseOrder archives without dropping raport', () => {
    const ready = finishRepair(base, {
      items: [{ name: 'Naprawa', price: 80, checked: true }],
      subs: [],
    }, '')
    const out = releaseOrder({ ...ready, unarchivedAt: '2026-01-01T00:00:00.000Z' })
    expect(out.dataWydania).toBeTruthy()
    expect(out.archivedAt).toBeTruthy()
    expect(out.raportKoncowy).toBeTruthy()
    expect(out.unarchivedAt).toBeUndefined()
  })

  it('upsertById replaces matching id', () => {
    const list = upsertById([base], { ...base, tel: '111-111-111' })
    expect(list).toHaveLength(1)
    expect(list[0].tel).toBe('111-111-111')
  })
})
