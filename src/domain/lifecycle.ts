import type { Order } from './order'
import { calcStateTotal, formatTotal } from './accept'
import { kodOdbioru, nowLabel, todayPl } from './format'
import type { OrderState } from './parse'

export function applyClientAndState(order: Order, client: {
  marka: string
  model: string
  kolor: string
  tel: string
  termin: string
  ebike?: boolean
}, state: OrderState): Order {
  return {
    ...order,
    marka: client.marka,
    model: client.model,
    kolor: client.kolor,
    tel: client.tel,
    termin: client.termin,
    ebike: !!client.ebike,
    cr: !!state.cr,
    total: formatTotal(calcStateTotal(state)),
    state: JSON.stringify({
      ...state,
      ...client,
      ebike: client.ebike ? '1' : '0',
      cr: !!state.cr,
    }),
  }
}

export function finishRepair(order: Order, state: OrderState, notatka: string): Order {
  const total = formatTotal(calcStateTotal(state))
  return {
    ...order,
    total,
    totalPrzedRaportem: order.totalPrzedRaportem || order.total,
    smsSent: false,
    kodOdbioru: order.kodOdbioru || kodOdbioru(),
    raportKoncowy: {
      items: state.items,
      subs: state.subs,
      total,
      notatka: notatka.trim(),
      savedAt: new Date().toISOString(),
      dataZakonczenia: todayPl(),
    },
  }
}

export function releaseOrder(order: Order): Order {
  const next = {
    ...order,
    archivedAt: new Date().toISOString(),
    dataWydania: todayPl(),
    kodOdbioru: order.kodOdbioru || kodOdbioru(),
    kwotaSprzedazy: order.kwotaSprzedazy || order.total,
  }
  delete next.unarchivedAt
  return next
}

export function unarchiveOrder(order: Order): Order {
  const next = {
    ...order,
    unarchivedAt: new Date().toISOString(),
  }
  delete next.archivedAt
  delete next.dataWydania
  return next
}

export function upsertById(list: Order[], order: Order) {
  const sid = String(order.id)
  const idx = list.findIndex(o => String(o.id) === sid)
  if (idx < 0) return [order, ...list]
  const next = list.slice()
  next[idx] = order
  return next
}

export function removeById(list: Order[], id: string | number) {
  const sid = String(id)
  return list.filter(o => String(o.id) !== sid)
}

export { nowLabel }
