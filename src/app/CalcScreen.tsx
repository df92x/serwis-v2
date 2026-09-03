import { useState } from 'react'
import { eurToPln, fetchEuroRate, plnToEur, todayIsoDate } from '../integrations/euro'

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
  const [date, setDate] = useState(todayIsoDate())
  const [rate, setRate] = useState<number | null>(null)
  const [rateDate, setRateDate] = useState('')
  const [pln, setPln] = useState('')
  const [eur, setEur] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const n = evalExpr(expr)

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
      <input value={expr} onChange={e => setExpr(e.target.value)} placeholder="np. 12+8*2" />
      <div className="total-line">{Number.isFinite(n) ? String(n) : '—'}</div>

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
