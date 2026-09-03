import { useEffect, useState } from 'react'
import { calcChain } from '../domain/chain'

const KEY = 'lancuch-vals'

type Vals = { tarcza: string; kaseta: string; rozstaw: string }

function load(): Vals {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<Vals>
    return {
      tarcza: raw.tarcza || '50',
      kaseta: raw.kaseta || '16',
      rozstaw: raw.rozstaw || '42',
    }
  } catch {
    return { tarcza: '50', kaseta: '16', rozstaw: '42' }
  }
}

export function ChainScreen() {
  const [vals, setVals] = useState<Vals>(load)
  const result = calcChain(+vals.tarcza || 0, +vals.kaseta || 0, +vals.rozstaw || 0)

  useEffect(() => {
    if (+vals.tarcza || +vals.kaseta || +vals.rozstaw) {
      localStorage.setItem(KEY, JSON.stringify(vals))
    }
  }, [vals])

  return (
    <div className="new-order">
      <label>
        Zęby tarczy (F)
        <input
          inputMode="numeric"
          value={vals.tarcza}
          onChange={e => setVals(v => ({ ...v, tarcza: e.target.value }))}
        />
      </label>
      <label>
        Zęby kasety (R)
        <input
          inputMode="numeric"
          value={vals.kaseta}
          onChange={e => setVals(v => ({ ...v, kaseta: e.target.value }))}
        />
      </label>
      <label>
        Rozstaw osi (cm)
        <input
          inputMode="decimal"
          value={vals.rozstaw}
          onChange={e => setVals(v => ({ ...v, rozstaw: e.target.value }))}
        />
      </label>
      <div className="total-line">Ogniwa: {result ? result.ogniwa : '—'}</div>
      <p className="hint">
        Długość: {result ? `${result.dlugoscCm} cm (${result.dlugoscMm} mm)` : '—'}
      </p>
      <p className="hint">Rozstaw: {result ? `${result.cale}"` : '—'}</p>
    </div>
  )
}
