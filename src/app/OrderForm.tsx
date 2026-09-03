import { useEffect, useMemo, useRef, useState } from 'react'
import { clearDraft, markInterrupted, readDraft, writeDraft } from '../data/draftStore'
import { saveToHistory } from '../data/repo'
import { DEFAULTS } from '../domain/catalog'
import { buildAcceptedOrder, calcStateTotal, formatTotal } from '../domain/accept'
import { snapshotDraft } from '../domain/draft'
import { applyClientAndState, finishRepair } from '../domain/lifecycle'
import { digitsTel } from '../domain/format'
import { filesToPhotos, type Photo } from '../domain/photos'
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
      photos: order.photos,
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
    photos: order.photos || base.photos,
    subs: base.subs.length ? base.subs : emptySubs(),
  })
}

type Mode = 'new' | 'edit' | 'repair'

export function OrderForm({
  mode,
  order,
  resumeDraft,
  onDone,
}: {
  mode: Mode
  order?: Order
  resumeDraft?: boolean
  onDone: () => void
}) {
  const initial = useMemo(() => {
    if (order) return stateFromOrder(order, mode === 'repair')
    if (resumeDraft) {
      const draft = readDraft()
      if (draft) return draft
    }
    return { items: emptyItems(), subs: emptySubs() } satisfies OrderState
  }, [order, mode, resumeDraft])

  const [marka, setMarka] = useState(order?.marka || initial.marka || 'ROWER')
  const [model, setModel] = useState(order?.model || initial.model || '')
  const [kolor, setKolor] = useState(order?.kolor || initial.kolor || '')
  const [tel, setTel] = useState(order?.tel || initial.tel || '')
  const [termin, setTermin] = useState(order?.termin || initial.termin || '')
  const [notatka, setNotatka] = useState(order?.raportKoncowy?.notatka || '')
  const [error, setError] = useState('')
  const [items, setItems] = useState<OrderItem[]>(initial.items)
  const [subs, setSubs] = useState<OrderSub[]>(initial.subs.length ? initial.subs : emptySubs())
  const [photos, setPhotos] = useState<Photo[]>(
    (order?.photos || initial.photos || []).filter(p => p.dataUrl),
  )
  const fileRef = useRef<HTMLInputElement>(null)

  const total = formatTotal(calcStateTotal({ items, subs }))
  const clientLocked = mode === 'repair'

  useEffect(() => {
    const persistInterrupt = () => {
      writeDraft({
        ...snapshotDraft({ marka, model, kolor, tel, termin, items, subs }),
        photos,
      })
      markInterrupted()
    }
    const onVis = () => {
      if (document.visibilityState === 'hidden') persistInterrupt()
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', persistInterrupt)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', persistInterrupt)
    }
  }, [marka, model, kolor, tel, termin, items, subs, photos])

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    try {
      const added = await filesToPhotos(files)
      setPhotos(prev => [...prev, ...added])
    } catch {
      setError('Nie udało się dodać zdjęcia.')
    }
  }

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
    const state: OrderState = { items, subs, photos, ...client }
    if (mode === 'new') {
      saveToHistory(buildAcceptedOrder({ ...client, state, photos }))
    } else if (order && mode === 'edit') {
      saveToHistory({ ...applyClientAndState(order, client, state), photos })
    } else if (order && mode === 'repair') {
      saveToHistory({ ...finishRepair(order, state, notatka), photos })
    }
    clearDraft()
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

      <div className="photo-block">
        <button type="button" className="chip" onClick={() => fileRef.current?.click()}>+ Zdjęcie</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={e => {
            void onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <div className="photo-previews">
          {photos.map((p, i) => (
            <div key={p.name + i} className="photo-thumb">
              <img src={p.dataUrl} alt="" />
              <button type="button" className="remove-photo" onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      </div>

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
      <button
        type="button"
        className="cta"
        onClick={() => { clearDraft(); onDone() }}
      >
        Anuluj
      </button>
    </form>
  )
}
