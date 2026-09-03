import { canonicalName, DEFAULTS } from './catalog'
import type { Order, OrderItem, OrderSub, RaportKoncowy } from './order'

export type OrderState = {
  items: OrderItem[]
  subs: OrderSub[]
  groupOpen?: boolean
  cr?: boolean
  crState?: { assemblyId?: string; extras?: unknown[] }
  marka?: string
  model?: string
  kolor?: string
  tel?: string
  termin?: string
  notatka?: string
  ebike?: string | boolean
  photos?: { dataUrl: string; name: string }[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function asString(v: unknown) {
  if (v == null) return undefined
  return String(v)
}

function asBool(v: unknown) {
  if (v === true || v === '1' || v === 1) return true
  if (v === false || v === '0' || v === 0) return false
  return undefined
}

function parseItem(raw: unknown): OrderItem | null {
  if (!isRecord(raw) || typeof raw.name !== 'string') return null
  return {
    name: canonicalName(raw.name),
    price: Number(raw.price) || 0,
    checked: !!raw.checked,
    qty: raw.qty === undefined ? undefined : Number(raw.qty) || 0,
    customName: asString(raw.customName),
    noteText: asString(raw.noteText),
    selectedPreset: typeof raw.selectedPreset === 'number' ? raw.selectedPreset : undefined,
    customLabel: asString(raw.customLabel),
  }
}

function parseSub(raw: unknown): OrderSub | null {
  if (!isRecord(raw)) return null
  return {
    name: asString(raw.name) || '',
    price: Number(raw.price) || 0,
    checked: !!raw.checked,
  }
}

export function parseState(raw: unknown): OrderState | null {
  const obj = typeof raw === 'string'
    ? (() => { try { return JSON.parse(raw) as unknown } catch { return null } })()
    : raw
  if (!isRecord(obj) || !Array.isArray(obj.items)) return null
  const items = obj.items.map(parseItem).filter((x): x is OrderItem => !!x)
  const subs = Array.isArray(obj.subs)
    ? obj.subs.map(parseSub).filter((x): x is OrderSub => !!x)
    : []
  return {
    items,
    subs,
    groupOpen: obj.groupOpen !== false,
    cr: !!obj.cr,
    crState: isRecord(obj.crState) ? { assemblyId: asString(obj.crState.assemblyId), extras: Array.isArray(obj.crState.extras) ? obj.crState.extras : [] } : undefined,
    marka: asString(obj.marka),
    model: asString(obj.model),
    kolor: asString(obj.kolor),
    tel: asString(obj.tel),
    termin: asString(obj.termin),
    notatka: asString(obj.notatka),
    ebike: obj.ebike as string | boolean | undefined,
    photos: Array.isArray(obj.photos)
      ? obj.photos.filter(isRecord).map(p => ({ dataUrl: String(p.dataUrl || ''), name: String(p.name || '') }))
      : undefined,
  }
}

/** Slim state (tylko zaznaczone pozycje) → pełna lista DEFAULTS. */
export function hydrateStateItems(state: OrderState): OrderState {
  const byName = new Map(state.items.map(it => [canonicalName(it.name), it]))
  const items = DEFAULTS.map(def => {
    const saved = byName.get(def.name)
    if (!saved) {
      return {
        name: def.name,
        price: def.price,
        checked: !!def.checked,
        qty: def.qty,
      }
    }
    return {
      ...saved,
      name: def.name,
      qty: saved.qty !== undefined ? saved.qty : def.qty,
    }
  })
  return { ...state, items }
}

function parseRaport(raw: unknown): RaportKoncowy | undefined {
  if (!isRecord(raw) || !Array.isArray(raw.items)) return undefined
  return {
    items: raw.items.map(parseItem).filter((x): x is OrderItem => !!x),
    subs: Array.isArray(raw.subs) ? raw.subs.map(parseSub).filter((x): x is OrderSub => !!x) : [],
    total: asString(raw.total) || '0',
    notatka: asString(raw.notatka),
    savedAt: asString(raw.savedAt),
    dataZakonczenia: asString(raw.dataZakonczenia),
  }
}

export function parseOrder(raw: unknown): Order | null {
  if (!isRecord(raw) || raw.id == null || raw.id === '') return null
  return {
    id: raw.id as number | string,
    label: asString(raw.label),
    marka: asString(raw.marka),
    model: asString(raw.model),
    kolor: asString(raw.kolor),
    tel: asString(raw.tel),
    termin: asString(raw.termin),
    total: asString(raw.total),
    ebike: asBool(raw.ebike),
    cr: asBool(raw.cr),
    state: typeof raw.state === 'string' ? raw.state : raw.state != null ? JSON.stringify(raw.state) : undefined,
    photos: Array.isArray(raw.photos)
      ? raw.photos.filter(isRecord).map(p => ({ dataUrl: String(p.dataUrl || ''), name: String(p.name || '') }))
      : undefined,
    raportKoncowy: parseRaport(raw.raportKoncowy),
    kodOdbioru: asString(raw.kodOdbioru),
    dataWydania: asString(raw.dataWydania),
    archivedAt: asString(raw.archivedAt),
    smsSent: asBool(raw.smsSent),
  }
}

export function parseOrderList(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return []
  return raw.map(parseOrder).filter((x): x is Order => !!x)
}

export function bikeDisplayName(marka?: string, model?: string) {
  const m = (marka || '').trim()
  const mod = (model || '').trim()
  const brand = m === 'ROWER' || m === 'INNY' ? '' : m
  return [brand, mod].filter(Boolean).join(' ') || 'Bez nazwy'
}
