import { useState } from 'react'
import { evalExpr, kpAppend } from '../domain/evalExpr'
import { eurToPln, fetchEuroRate, plnToEur, todayIsoDate } from '../integrations/euro'

const KEYS: { label: string; val: string; op?: boolean }[][] = [
  [
    { label: 'C', val: 'C', op: true },
    { label: '⌫', val: '⌫', op: true },
    { label: '÷', val: '/', op: true },
    { label: '×', val: '*', op: true },
  ],
  [
    { label: '7', val: '7' },
    { label: '8', val: '8' },
    { label: '9', val: '9' },
    { label: '−', val: '-', op: true },
  ],
  [
    { label: '4', val: '4' },
    { label: '5', val: '5' },
    { label: '6', val: '6' },
    { label: '+', val: '+', op: true },
  ],
  [
    { label: '1', val: '1' },
    { label: '2', val: '2' },
    { label: '3', val: '3' },
    { label: '=', val: '=', op: true },
  ],
  [
    { label: '0', val: '0' },
    { label: ',', val: '.' },
  ],
]

export function CalcScreen() {
  const [expr, setExpr] = useState('')
  const [justCalc, setJustCalc] = useState(false)
  const [date, setDate] = useState(todayIsoDate())
  const [rate, setRate] = useState<number | null>(null)
  const [rateDate, setRateDate] = useState('')
  const [pln, setPln] = useState('')
  const [eur, setEur] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const live = evalExpr(expr)
  const display = !expr
    ? '0'
    : Number.isFinite(live)
      ? live.toLocaleString('pl-PL', { maximumFractionDigits: 8 })
      : (expr.slice(-1) || '0')

  function tap(val: string) {
    const next = kpAppend(expr, val, justCalc)
    setExpr(next.expr)
    setJustCalc(next.justCalc)
  }

  async function loadRate() {
    setLoading(true)
    setErr('')
    try {
      const r = await fetchEuroRate(date)
      setRate(r.rate)
      setRateDate(r.date)
    } catch {
      setErr('Brak kursu dla tej daty / brak sieci.')
      setRate(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-order">
      <div className="kp-display-wrap">
        <div className="kp-expr">{expr || ' '}</div>
        <div className="kp-display">{display}</div>
      </div>
      <div className="kp-pad">
        {KEYS.map((row, i) => (
          <div key={i} className="kp-row">
            {row.map(k => (
              <button
                key={k.val + k.label}
                type="button"
                className={k.op ? 'kp-btn op' : 'kp-btn'}
                onClick={() => tap(k.val)}
              >
                {k.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="list-h">Euro (EBC)</p>
      <label>
        Data
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </label>
      <button type="button" className="cta cta-browse" disabled={loading} onClick={() => void loadRate()}>
        {loading ? 'Pobieram…' : 'Pobierz kurs'}
      </button>
      {err && <p className="form-error">{err}</p>}
      {rate != null && (
        <>
          <p className="hint">{rate.toFixed(2).replace('.', ',')} zł · {rateDate.split('-').reverse().join('.')}</p>
          <label>
            PLN → EUR
            <input
              inputMode="decimal"
              value={pln}
              onChange={e => {
                setPln(e.target.value)
                const v = parseFloat(e.target.value.replace(',', '.'))
                setEur(Number.isFinite(v) ? String(plnToEur(v, rate)) : '')
              }}
            />
          </label>
          <label>
            EUR → PLN
            <input
              inputMode="decimal"
              value={eur}
              onChange={e => {
                setEur(e.target.value)
                const v = parseFloat(e.target.value.replace(',', '.'))
                setPln(Number.isFinite(v) ? String(eurToPln(v, rate)) : '')
              }}
            />
          </label>
        </>
      )}
    </div>
  )
}
