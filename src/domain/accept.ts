import type { Order } from './order'
import { nowLabel } from './format'
import type { OrderState } from './parse'

export function formatTotal(n: number) {
  return n.toFixed(2).replace('.', ',')
}

export function calcStateTotal(state: OrderState) {
  let total = 0
  for (const it of state.items) {
    if (!it.checked) continue
    const qty = it.qty !== undefined ? (it.qty || 1) : 1
    total += (Number(it.price) || 0) * qty
  }
  for (const s of state.subs) {
    if (s.checked && Number(s.price) > 0) total += Number(s.price) || 0
  }
  return total
}

export function buildAcceptedOrder(input: {
  marka: string
  model: string
  kolor: string
  tel: string
  termin: string
  ebike?: boolean
  state: OrderState
  photos?: { dataUrl: string; name: string }[]
}): Order {
  const label = nowLabel()
  const total = formatTotal(calcStateTotal(input.state))
  const photos = input.photos || input.state.photos || []
  const state: OrderState = {
    ...input.state,
    marka: input.marka,
    model: input.model,
    kolor: input.kolor,
    tel: input.tel,
    termin: input.termin,
    ebike: input.ebike ? '1' : '0',
    photos,
  }
  return {
    id: Date.now(),
    label,
    marka: input.marka,
    model: input.model,
    kolor: input.kolor,
    tel: input.tel,
    termin: input.termin,
    ebike: !!input.ebike,
    total,
    photos,
    state: JSON.stringify(state),
  }
}
