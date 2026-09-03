import type { OrderItem, OrderSub } from './order'
import type { OrderState } from './parse'

const GENERIC_BRANDS = new Set(['', 'ROWER', 'INNY'])

function itemHasProgress(it: OrderItem) {
  if (it.customName?.trim()) return true
  if (it.noteText?.trim()) return true
  if (it.name === 'Naprawa' && it.checked && !(Number(it.price) > 0)) return false
  if (it.name === 'Ochraniacz' && Number(it.price) === 6 && !it.checked) return false
  if (it.checked && it.name !== 'Naprawa') return true
  if (it.checked && Number(it.price) > 0) return true
  const qty = it.qty
  if (qty !== undefined && qty > 0 && it.name !== 'Ochraniacz') return true
  return false
}

export function draftHasProgress(state: Pick<OrderState, 'items' | 'subs'> & {
  marka?: string
  model?: string
  tel?: string
  kolor?: string
  termin?: string
}) {
  if ((state.model || '').trim() && !GENERIC_BRANDS.has((state.model || '').trim().toUpperCase())) return true
  if (state.marka && !GENERIC_BRANDS.has(state.marka)) return true
  if ((state.kolor || '').trim()) return true
  if ((state.termin || '').trim()) return true
  if ((state.tel || '').replace(/\D/g, '').length >= 9) return true
  if (state.items.some(itemHasProgress)) return true
  return state.subs.some(s => !!(s.name || '').trim() || Number(s.price) > 0)
}

export function snapshotDraft(input: {
  marka: string
  model: string
  kolor: string
  tel: string
  termin: string
  items: OrderItem[]
  subs: OrderSub[]
}): OrderState {
  return {
    marka: input.marka,
    model: input.model,
    kolor: input.kolor,
    tel: input.tel,
    termin: input.termin,
    items: input.items,
    subs: input.subs,
  }
}
