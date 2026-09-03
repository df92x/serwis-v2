import { useEffect, useState } from 'react'
import {
  applyNaprawaOptions,
  applyPreset,
  findDefault,
  NAPRAWA_SERVICES,
} from '../domain/catalog'
import { evalExpr } from '../domain/evalExpr'
import type { OrderItem, OrderSub, SelectedServiceOption } from '../domain/order'

type Props = {
  items: OrderItem[]
  subs: OrderSub[]
  onItems: (items: OrderItem[]) => void
  onSubs: (subs: OrderSub[]) => void
}

function patchItem(items: OrderItem[], name: string, patch: Partial<OrderItem>) {
  return items.map(it => it.name === name ? { ...it, ...patch } : it)
}

function PriceInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [raw, setRaw] = useState(value ? String(value) : '')
  useEffect(() => {
    setRaw(value ? String(value) : '')
  }, [value])
  return (
    <input
      className="price"
      inputMode="decimal"
      value={raw}
      onChange={e => setRaw(e.target.value)}
      onBlur={() => {
        const n = evalExpr(raw)
        const next = Number.isFinite(n) ? n : 0
        setRaw(next ? String(next) : '')
        onCommit(next)
      }}
    />
  )
}

export function ServiceList({ items, subs, onItems, onSubs }: Props) {
  function toggle(name: string) {
    onItems(items.map(it => {
      if (it.name !== name) return it
      return { ...it, checked: !it.checked }
    }))
  }

  function setPrice(name: string, price: number) {
    onItems(patchItem(items, name, {
      price,
      checked: true,
      selectedPreset: -1,
    }))
  }

  function setQty(name: string, qty: number) {
    const q = Math.max(0, qty)
    onItems(patchItem(items, name, {
      qty: q,
      checked: q > 0 || items.find(i => i.name === name)?.checked,
    }))
  }

  function onPreset(name: string, presetIndex: number) {
    const def = findDefault(name)
    if (!def?.presets?.length) return
    if (presetIndex < 0) {
      onItems(patchItem(items, name, { selectedPreset: -1, customName: '' }))
      return
    }
    const p = def.presets[presetIndex]
    if (!p) return
    onItems(patchItem(items, name, applyPreset(p.price, p.label, presetIndex)))
  }

  function toggleNaprawa(opt: SelectedServiceOption) {
    const it = items.find(x => x.name === 'Naprawa')
    if (!it) return
    const cur = Array.isArray(it.selectedOptions) ? it.selectedOptions.slice() : []
    const idx = cur.findIndex(o => o.id === opt.id)
    if (idx >= 0) cur.splice(idx, 1)
    else cur.push(opt)
    onItems(patchItem(items, 'Naprawa', applyNaprawaOptions(cur)))
  }

  function setSub(i: number, patch: Partial<OrderSub>) {
    onSubs(subs.map((s, idx) => idx === i
      ? { ...s, ...patch, checked: patch.checked ?? (Number(patch.price) > 0 || !!s.name || !!s.checked) }
      : s))
  }

  return (
    <>
      <h2 className="list-h">Usługi</h2>
      <ul className="svc-list">
        {items.map(it => {
          const def = findDefault(it.name)
          const hasQty = def?.qty !== undefined || it.qty !== undefined
          const presets = def?.presets
          const isNaprawa = it.name === 'Naprawa'
          const note = !!def?.note
          const open = it.checked || (isNaprawa && (it.selectedOptions?.length || 0) > 0)

          return (
            <li key={it.name} className="svc-item">
              <label className={hasQty ? 'svc-row qty' : 'svc-row'}>
                <input type="checkbox" checked={it.checked} onChange={() => toggle(it.name)} />
                <span className="svc-name">
                  {it.name}
                  {it.customName ? <em> — {it.customName}</em> : null}
                </span>
                {hasQty && (
                  <input
                    className="qty"
                    inputMode="numeric"
                    value={it.qty ?? 0}
                    onChange={e => setQty(it.name, Number(e.target.value) || 0)}
                    aria-label={`Ilość ${it.name}`}
                  />
                )}
                <PriceInput value={it.price || 0} onCommit={n => setPrice(it.name, n)} />
              </label>

              {open && presets && presets.length > 0 && (
                <select
                  className="preset-select"
                  value={it.selectedPreset != null && it.selectedPreset > 0 ? it.selectedPreset - 1 : ''}
                  onChange={e => {
                    const v = e.target.value
                    onPreset(it.name, v === '' ? -1 : Number(v))
                  }}
                >
                  <option value="">Wybierz wariant…</option>
                  {presets.map((p, i) => (
                    <option key={p.label + i} value={i}>
                      {p.label} — {p.price} zł
                    </option>
                  ))}
                </select>
              )}

              {open && isNaprawa && (
                <div className="naprawa-opts">
                  {(def?.options || NAPRAWA_SERVICES).map(svc => {
                    const on = (it.selectedOptions || []).some(o => o.id === svc.id)
                    return (
                      <label key={svc.id} className="naprawa-opt">
                        <input type="checkbox" checked={on} onChange={() => toggleNaprawa(svc)} />
                        <span>{svc.label}</span>
                        <strong>{svc.price} zł</strong>
                      </label>
                    )
                  })}
                </div>
              )}

              {open && note && (
                <input
                  className="note-input"
                  placeholder="Opis części…"
                  value={it.noteText || it.customName || ''}
                  onChange={e => onItems(patchItem(items, it.name, {
                    noteText: e.target.value,
                    customName: e.target.value,
                    checked: true,
                  }))}
                />
              )}
            </li>
          )
        })}
      </ul>

      <h2 className="list-h">Inne części</h2>
      <ul className="svc-list">
        {subs.map((s, i) => (
          <li key={i}>
            <label className="svc-row sub">
              <input
                placeholder={i === 0 ? 'Części koło' : i === 1 ? 'Łożyska' : 'Nazwa'}
                value={s.name}
                onChange={e => setSub(i, { name: e.target.value, checked: !!e.target.value || s.checked })}
              />
              <PriceInput
                value={s.price || 0}
                onCommit={n => setSub(i, { price: n, checked: n > 0 || !!s.name })}
              />
            </label>
          </li>
        ))}
      </ul>
    </>
  )
}
