/** Bezpieczna ewaluacja wyrażeń jak w starej appce (tylko + − * /). */
export function evalExpr(raw: string): number {
  let s = String(raw).replace(/,/g, '.').replace(/×/g, '*').replace(/x/gi, '*').replace(/\s/g, '')
  if (!s) return NaN
  if (!/^[\d.+\-*/]+$/.test(s)) return Number.parseFloat(s)
  const isNumToken = (t: string) => /^(\d+(\.\d+)?|\.\d+)$/.test(t)
  try {
    if (/[*/]{2,}|[+\-*/]$/.test(s)) return NaN
    const tokens = s.match(/[+\-]?[^+\-]+/g) || []
    let sum = 0
    for (const token of tokens) {
      const negative = token.charAt(0) === '-'
      const expr = (token.charAt(0) === '+' || token.charAt(0) === '-') ? token.slice(1) : token
      if (!expr) return NaN
      let val = 1
      const mparts = expr.split('*')
      for (let mi = 0; mi < mparts.length; mi++) {
        if (!mparts[mi]) return NaN
        const d = mparts[mi].split('/')
        if (!d[0] || !isNumToken(d[0])) return NaN
        let n = Number.parseFloat(d[0])
        if (!Number.isFinite(n)) return NaN
        for (let di = 1; di < d.length; di++) {
          if (!isNumToken(d[di]!)) return NaN
          const denom = Number.parseFloat(d[di]!)
          if (!Number.isFinite(denom) || denom === 0) return NaN
          n /= denom
        }
        val = mi === 0 ? n : val * n
      }
      sum += negative ? -val : val
    }
    return Math.round(sum * 100) / 100
  } catch {
    return NaN
  }
}

export function kpAppend(expr: string, val: string, justCalc: boolean): { expr: string; justCalc: boolean } {
  if (val === 'C') return { expr: '', justCalc: false }
  if (val === '⌫') return { expr: expr.slice(0, -1), justCalc: false }
  if (val === '=') {
    const result = evalExpr(expr)
    if (!Number.isNaN(result)) return { expr: String(result), justCalc: true }
    return { expr, justCalc: false }
  }
  let next = expr
  let jc = justCalc
  if (jc && '0123456789.'.includes(val)) {
    next = ''
  }
  jc = false
  if (val === '.') {
    const parts = next.split(/[+\-*/]/)
    if ((parts[parts.length - 1] || '').includes('.')) return { expr: next, justCalc: jc }
  }
  return { expr: next + val, justCalc: jc }
}
