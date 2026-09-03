import { STORAGE } from './keys'
import { readJson, writeJson } from './storage'
import type { Order } from '../domain/order'
import { bikeDisplayName } from '../domain/parse'
import {
  computeValidUntil,
  genUnique8,
  rabEntryKey,
  RABATY_TEMPLATES,
  validityMonthsStored,
  type RabCode,
  type RabTemplate,
  type ValidityKey,
} from '../domain/rabaty'

export function readRabatyActive(): RabCode[] {
  const list = readJson<unknown>(STORAGE.rabatyActive, [])
  return Array.isArray(list) ? list as RabCode[] : []
}

export function readRabatyUsed(): RabCode[] {
  const list = readJson<unknown>(STORAGE.rabatyUsed, [])
  return Array.isArray(list) ? list as RabCode[] : []
}

export function writeRabatyActive(list: RabCode[]) {
  writeJson(STORAGE.rabatyActive, list)
}

export function writeRabatyUsed(list: RabCode[]) {
  writeJson(STORAGE.rabatyUsed, list)
}

export function hasRabForEntry(entry: Order) {
  const key = rabEntryKey(entry)
  return [...readRabatyActive(), ...readRabatyUsed()].some(
    x => String(x.entryKey || x.entryId || '') === key,
  )
}

export function createRabForEntry(
  entry: Order,
  template: RabTemplate,
  validity: ValidityKey,
): RabCode | null {
  if (hasRabForEntry(entry)) return null
  const createdAt = Date.now()
  const code = genUnique8(readRabatyActive().map(x => String(x.code || '')))
  const row: RabCode = {
    code,
    percent: template.percent,
    amount: template.amount || 0,
    templateId: template.id,
    templateLabel: template.label,
    entryId: entry.id,
    entryKey: rabEntryKey(entry),
    tel: entry.tel || '',
    kodOdbioru: entry.kodOdbioru || '',
    marka: entry.marka || '',
    modelName: entry.model || '',
    model: bikeDisplayName(entry.marka, entry.model),
    dataWydania: entry.dataWydania || '',
    validMonths: validityMonthsStored(validity),
    validUntil: computeValidUntil(createdAt, validity),
    createdAt,
  }
  writeRabatyActive([row, ...readRabatyActive()])
  return row
}

export function createPromoRab(template: RabTemplate, validity: ValidityKey): RabCode {
  const createdAt = Date.now()
  const code = genUnique8(readRabatyActive().map(x => String(x.code || '')))
  const row: RabCode = {
    code,
    percent: template.percent,
    amount: template.amount || 0,
    templateId: template.id,
    templateLabel: template.label,
    entryId: null,
    entryKey: `promo:${createdAt}:${code}`,
    tel: '',
    kodOdbioru: '',
    marka: '',
    modelName: '',
    model: '',
    dataWydania: '',
    validMonths: validityMonthsStored(validity),
    validUntil: computeValidUntil(createdAt, validity),
    createdAt,
    promoOnly: true,
  }
  writeRabatyActive([row, ...readRabatyActive()])
  return row
}

export function moveRabToUsed(code: string) {
  const c = String(code)
  const active = readRabatyActive()
  const idx = active.findIndex(x => String(x.code) === c)
  if (idx < 0) return
  const [row] = active.splice(idx, 1)
  writeRabatyActive(active)
  writeRabatyUsed([{ ...row, usedAt: Date.now() }, ...readRabatyUsed()])
}

export function markRabSmsSent(code: string) {
  const c = String(code)
  const patch = (list: RabCode[]) => {
    const i = list.findIndex(x => String(x.code) === c)
    if (i < 0) return null
    const next = list.slice()
    next[i] = { ...next[i], smsSent: true, smsSentAt: Date.now() }
    return next
  }
  const a = patch(readRabatyActive())
  if (a) { writeRabatyActive(a); return }
  const u = patch(readRabatyUsed())
  if (u) writeRabatyUsed(u)
}

export function templateById(id: string) {
  return RABATY_TEMPLATES.find(t => t.id === id) || RABATY_TEMPLATES[0]
}
