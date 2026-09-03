import { describe, expect, it } from 'vitest'
import { entryMergeRank, mergeOrderBuckets, pickMergeWinner } from './merge'
import type { Order } from './order'

function o(partial: Partial<Order> & { id: number | string }): Order {
  return { ...partial, id: partial.id }
}

describe('pickMergeWinner', () => {
  it('prefers wydane over gotowe', () => {
    const a = o({ id: 1, raportKoncowy: { items: [], subs: [], total: '10' } })
    const b = o({ id: 1, dataWydania: '01.01.2026', archivedAt: '2026-01-01T10:00:00.000Z' })
    expect(pickMergeWinner(a, b).dataWydania).toBe('01.01.2026')
    expect(entryMergeRank(b)).toBeGreaterThan(entryMergeRank(a))
  })

  it('newer re-release beats older unarchive', () => {
    const un = o({
      id: 1,
      unarchivedAt: '2026-01-01T10:00:00.000Z',
      raportKoncowy: { items: [], subs: [], total: '10' },
    })
    const ar = o({
      id: 1,
      dataWydania: '02.01.2026',
      archivedAt: '2026-01-02T12:00:00.000Z',
    })
    expect(pickMergeWinner(un, ar).archivedAt).toBe('2026-01-02T12:00:00.000Z')
  })

  it('merges smsSent on equal status', () => {
    const left = o({ id: 1, total: '10', smsSent: true })
    const right = o({ id: 1, total: '12', marka: 'KROSS', smsSent: true })
    const m = pickMergeWinner(left, right)
    expect(m.smsSent).toBe(true)
    expect(m.marka).toBe('KROSS')
    expect(m.total).toBe('12')
  })
})

describe('mergeOrderBuckets', () => {
  it('keeps local on equal rank and drops purged', () => {
    const result = mergeOrderBuckets({
      localHistory: [o({ id: 1, marka: 'LOCAL', total: '1' })],
      localArchive: [],
      localTrash: [],
      localPurged: { '2': 1 },
      remoteHistory: [o({ id: 1, marka: 'REMOTE', total: '1' }), o({ id: 2, marka: 'GONE' })],
      remoteArchive: [],
      remoteTrash: [],
      remotePurged: {},
    })
    expect(result.history).toHaveLength(1)
    expect(result.history[0].marka).toBe('LOCAL')
    expect(result.history.find(x => String(x.id) === '2')).toBeUndefined()
  })
})
