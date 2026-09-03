export type OrderStatus = 'przyjete' | 'gotowe' | 'wydane' | 'kosz'

export type OrderItem = {
  name: string
  price: number
  checked: boolean
  qty?: number
  customName?: string
  noteText?: string
  selectedPreset?: number
  customLabel?: string
  selectedOptions?: unknown[]
}

export type OrderSub = {
  name: string
  price: number
  checked: boolean
}

export type RaportKoncowy = {
  items: OrderItem[]
  subs: OrderSub[]
  total: string
  notatka?: string
  savedAt?: string
  dataZakonczenia?: string
}

export type Order = {
  id: number | string
  label?: string
  marka?: string
  model?: string
  kolor?: string
  tel?: string
  termin?: string
  total?: string
  ebike?: boolean
  cr?: boolean
  state?: string
  photos?: { dataUrl: string; name: string }[]
  raportKoncowy?: RaportKoncowy
  kodOdbioru?: string
  dataWydania?: string
  archivedAt?: string
  smsSent?: boolean
}

export function orderStatus(order: Order): OrderStatus {
  if (order.archivedAt || order.dataWydania) return 'wydane'
  if (order.raportKoncowy) return 'gotowe'
  return 'przyjete'
}
