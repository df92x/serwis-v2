import { useMemo, useState } from 'react'
import {
  createPromoRab,
  createRabForEntry,
  hasRabForEntry,
  markRabSmsSent,
  moveRabToUsed,
  readRabatyActive,
  readRabatyUsed,
  templateById,
} from '../data/rabatyStore'
import { readArchive } from '../data/storage'
import { fmtDatePl, RABATY_TEMPLATES, smsRabatyBody, type ValidityKey } from '../domain/rabaty'
import { bikeDisplayName } from '../domain/parse'
import type { Order } from '../domain/order'

const VALID: { key: ValidityKey; label: string }[] = [
  { key: '1', label: '1 m' },
  { key: '3', label: '3 m' },
  { key: '6', label: '6 m' },
  { key: '12', label: '12 m' },
  { key: 'fix2026', label: 'do 2026' },
]

function smsHref(tel: string, body: string) {
  const n = tel.replace(/[^0-9+]/g, '')
  return `sms:${n}?body=${encodeURIComponent(body)}`
}

export function RabatyScreen() {
  const [tab, setTab] = useState<'active' | 'used' | 'new'>('active')
  const [q, setQ] = useState('')
  const [templateId, setTemplateId] = useState(RABATY_TEMPLATES[0].id)
  const [validity, setValidity] = useState<ValidityKey>('6')
  const [assignFor, setAssignFor] = useState<Order | null>(null)
  const [msg, setMsg] = useState('')
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(n => n + 1)

  const active = useMemo(() => {
    void tick
    return readRabatyActive().slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }, [tick])
  const used = useMemo(() => {
    void tick
    return readRabatyUsed().slice().sort((a, b) => (b.usedAt || 0) - (a.usedAt || 0))
  }, [tick])
  const eligible = useMemo(() => {
    void tick
    return readArchive().filter(o => !hasRabForEntry(o)).slice(0, 40)
  }, [tick])

  const filter = <T extends { code?: string; tel?: string; model?: string }>(list: T[]) => {
    const s = q.trim().toUpperCase()
    const d = q.replace(/\D/g, '')
    if (!s) return list
    return list.filter(r =>
      String(r.code || '').toUpperCase().includes(s)
      || (d && String(r.tel || '').replace(/\D/g, '').includes(d))
      || String(r.model || '').toUpperCase().includes(s),
    )
  }

  function makePromo() {
    const row = createPromoRab(templateById(templateId), validity)
    setMsg(`Kod ${row.code}`)
    setTab('active')
    refresh()
  }

  function assign(order: Order) {
    const row = createRabForEntry(order, templateById(templateId), validity)
    if (!row) {
      setMsg('Dla tego zlecenia kod już istnieje.')
      return
    }
    setAssignFor(null)
    setMsg(`Kod ${row.code}`)
    setTab('active')
    refresh()
  }

  return (
    <div className="orders">
      <nav className="tabs tabs-3">
        <button type="button" className={tab === 'active' ? 'tab on' : 'tab'} onClick={() => setTab('active')}>Aktywne</button>
        <button type="button" className={tab === 'used' ? 'tab on' : 'tab'} onClick={() => setTab('used')}>Użyte</button>
        <button type="button" className={tab === 'new' ? 'tab on' : 'tab'} onClick={() => setTab('new')}>Nowy</button>
      </nav>

      {(tab === 'active' || tab === 'used') && (
        <input className="search" placeholder="Kod / tel / model" value={q} onChange={e => setQ(e.target.value)} />
      )}
      {msg && <p className="hint">{msg}</p>}

      {tab === 'new' && (
        <div className="new-order">
          <label>
            Promocja
            <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
              {RABATY_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <div className="chip-row">
            {VALID.map(v => (
              <button
                key={v.key}
                type="button"
                className={validity === v.key ? 'chip on' : 'chip'}
                onClick={() => setValidity(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button type="button" className="cta cta-add" onClick={makePromo}>Tylko promocja</button>
          <p className="list-h">Przypisz do wydanego</p>
          {!eligible.length && <p className="muted">Brak wydanych bez kodu.</p>}
          <ul className="order-list">
            {eligible.map(o => (
              <li key={String(o.id)} className="order-card">
                <div className="order-title">{bikeDisplayName(o.marka, o.model)}</div>
                <div className="order-meta">
                  {o.tel && <span>{o.tel}</span>}
                  {o.dataWydania && <span>{o.dataWydania}</span>}
                </div>
                <div className="card-actions">
                  <button type="button" onClick={() => setAssignFor(o)}>Przydziel</button>
                </div>
              </li>
            ))}
          </ul>
          {assignFor && (
            <div className="order-card">
              <p className="hint">Przydzielasz: {bikeDisplayName(assignFor.marka, assignFor.model)}</p>
              <div className="card-actions">
                <button type="button" className="ok" onClick={() => assign(assignFor)}>Potwierdź</button>
                <button type="button" onClick={() => setAssignFor(null)}>Anuluj</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'active' && (
        <ul className="order-list">
          {filter(active).map(r => (
            <li key={r.code} className="order-card" data-code={r.code}>
              <div className="order-title">{r.code}</div>
              <div className="order-meta"><span>{r.templateLabel}</span><span>do {fmtDatePl(r.validUntil)}</span></div>
              {(r.model || r.tel) && <div className="order-date">{[r.model, r.tel].filter(Boolean).join(' · ')}</div>}
              <div className="card-actions">
                {r.tel && (
                  <a
                    className="link-btn"
                    href={smsHref(r.tel, smsRabatyBody(r))}
                    onClick={() => { markRabSmsSent(r.code); refresh() }}
                  >
                    SMS
                  </a>
                )}
                <button type="button" onClick={() => { moveRabToUsed(r.code); refresh() }}>Użyty</button>
              </div>
            </li>
          ))}
          {!filter(active).length && <p className="muted">Brak aktywnych kodów.</p>}
        </ul>
      )}

      {tab === 'used' && (
        <ul className="order-list">
          {filter(used).map(r => (
            <li key={r.code} className="order-card">
              <div className="order-title">{r.code}</div>
              <div className="order-meta"><span>{r.templateLabel}</span><span>{r.usedAt ? fmtDatePl(r.usedAt) : ''}</span></div>
            </li>
          ))}
          {!filter(used).length && <p className="muted">Brak użytych kodów.</p>}
        </ul>
      )}
    </div>
  )
}
