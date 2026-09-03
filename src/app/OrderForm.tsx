import { useMemo, useState } from 'react'
import { saveToHistory } from '../data/repo'
import { DEFAULTS } from '../domain/catalog'
import { buildAcceptedOrder, calcStateTotal, formatTotal } from '../domain/accept'
import { applyClientAndState, finishRepair } from '../domain/lifecycle'
import { digitsTel } from '../domain/format'
import type { Order, OrderItem, OrderSub } from '../domain/order'
import { hydrateStateItems, parseState, type OrderState } from '../domain/parse'
import { ServiceList } from '../ui/ServiceList'

const BRANDS = ['ROWER', 'INNY', 'KROSS', 'ROMET', 'TREK', 'GIANT', 'CUBE', 'SCOTT', 'SPECIALIZED', 'AUTHOR']

function emptyItems(): OrderItem[] {
  return DEFAULTS.map(d => ({ name: d.name, price: d.price, checked: !!d.checked, qty: d.qty }))
}

function emptySubs(): OrderSub[] {
  return [
    { name: '', price: 0, checked: false },
    { name: '', price: 0, checked: false },
    { name: '', price: 0, checked: false },
  ]
}

function stateFromOrder(order: Order, repair: boolean): OrderState {
  if (repair && order.raportKoncowy?.items?.length) {
    return hydrateStateItems({
      items: order.raportKoncowy.items,
      subs: order.raportKoncowy.subs?.length ? order.raportKoncowy.subs : emptySubs(),
      marka: order.marka,
      model: order.model,
      kolor: order.kolor,
      tel: order.tel,
      termin: order.termin,
    })
  }
  const parsed = parseState(order.state)
  const base: OrderState = parsed || { items: emptyItems(), subs: emptySubs() }
  return hydrateStateItems({
    ...base,
    marka: order.marka || base.marka,
    model: order.model || base.model,
    kolor: order.kolor || base.kolor,
    tel: order.tel || base.tel,
    termin: order.termin || base.termin,
    subs: base.subs.length ? base.subs : emptySubs(),
  })
}

type Mode = 'new' | 'edit' | 'repair'

export function OrderForm({
  mode,
  order,
  onDone,
}: {
  mode: Mode
  order?: Order
  onDone: () => void
}) {
  const initial = useMemo(() => {
    if (order) return stateFromOrder(order, mode === 'repair')
    return { items: emptyItems(), subs: emptySubs() } satisfies OrderState
  }, [order, mode])

  const [marka, setMarka] = useState(order?.marka || 'ROWER')
  const [model, setModel] = useState(order?.model || '')
  const [kolor, setKolor] = useState(order?.kolor || '')
  const [tel, setTel] = useState(order?.tel || '')
  const [termin, setTermin] = useState(order?.termin || '')
  const [notatka, setNotatka] = useState(order?.raportKoncowy?.notatka || '')
  const [error, setError] = useState('')
  const [items, setItems] = useState<OrderItem[]>(initial.items)
  const [subs, setSubs] = useState<OrderSub[]>(initial.subs.length ? initial.subs : emptySubs())

  const total = formatTotal(calcStateTotal({ items, subs }))
  const clientLocked = mode === 'repair'

  function save() {
    const phone = tel.replace(/\D/g, '')
    if ((!marka && !model.trim()) || phone.length < 9) {
      setError('Podaj markę/model i 9-cyfrowy telefon.')
      return
    }
    const client = {
      marka,
      model: model.trim().toUpperCase(),
      kolor: kolor.trim().toUpperCase(),
      tel: digitsTel(tel),
      termin,
    }
    const state: OrderState = { items, subs, ...client }
    if (mode === 'new') {
      saveToHistory(buildAcceptedOrder({ ...client, state }))
    } else if (order && mode === 'edit') {
      saveToHistory(applyClientAndState(order, client, state))
    } else if (order && mode === 'repair') {
      saveToHistory(finishRepair(order, state, notatka))
    }
    onDone()
  }

  return (
    <form className="new-order" onSubmit={e => { e.preventDefault(); save() }}>
      <div className="total-line">Suma: {total} zł</div>
      {error && <p className="form-error">{error}</p>}
      {!clientLocked && (
        <>
          <label>
            Marka
            <select value={marka} onChange={e => setMarka(e.target.value)}>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label>
            Model
            <input value={model} onChange={e => setModel(e.target.value)} />
          </label>
          <label>
            Kolor
            <input value={kolor} onChange={e => setKolor(e.target.value)} />
          </label>
          <label>
            Telefon
            <input inputMode="numeric" value={tel} onChange={e => setTel(digitsTel(e.target.value))} />
          </label>
          <label>
            Termin
            <input value={termin} onChange={e => setTermin(e.target.value)} placeholder="DD.MM.RRRR" />
          </label>
        </>
      )}
      {clientLocked && (
        <p className="hint">{[marka, model].filter(Boolean).join(' ')} · {tel}</p>
      )}
      <ServiceList items={items} subs={subs} onItems={setItems} onSubs={setSubs} />
      {mode === 'repair' && (
        <label>
          Notatka naprawy
          <input value={notatka} onChange={e => setNotatka(e.target.value)} />
        </label>
      )}
      <button type="submit" className="cta cta-add">
        {mode === 'repair' ? 'ZAKOŃCZ' : 'ZAPISZ'}
      </button>
    </form>
  )
}
