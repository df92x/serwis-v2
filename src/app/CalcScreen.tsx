import { useState } from 'react'

function evalExpr(raw: string) {
  const s = raw.replace(/,/g, '.').replace(/×/g, '*').replace(/x/gi, '*').replace(/\s/g, '')
  if (!s || /[^0-9.+\-*/]/.test(s)) return NaN
  try {
    return Function(`"use strict"; return (${s})`)() as number
  } catch {
    return NaN
  }
}

export function CalcScreen() {
  const [expr, setExpr] = useState('')
  const n = evalExpr(expr)
  return (
    <div className="new-order">
      <input value={expr} onChange={e => setExpr(e.target.value)} placeholder="np. 12+8*2" />
      <div className="total-line">{Number.isFinite(n) ? String(n) : '—'}</div>
    </div>
  )
}
