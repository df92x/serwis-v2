import type { Order } from './order'

export type RabTemplate = {
  id: string
  label: string
  percent: number
  amount?: number
}

export type RabCode = {
  code: string
  percent: number
  amount?: number
  templateId: string
  templateLabel: string
  entryId: string | number | null
  entryKey: string
  tel: string
  kodOdbioru: string
  marka: string
  modelName: string
  model: string
  dataWydania: string
  validMonths: number
  validUntil: number
  createdAt: number
  promoOnly?: boolean
  smsSent?: boolean
  smsSentAt?: number
  usedAt?: number
}

export const RABATY_TEMPLATES: RabTemplate[] = [
  { id: 'DARMOWY_PO_ZLOZENIU', label: 'Darmowy Przegląd (po złożeniu)', percent: 0 },
  { id: 'USL35', label: 'Usługa Serwisowa -35%', percent: 35 },
  { id: 'USL50', label: 'Usługa Serwisowa -50%', percent: 50 },
  { id: 'PRZEGLAD_PODSTAWOWY_99', label: 'Przegląd Podstawowy 99zł', percent: 0, amount: 99 },
  { id: 'PRZEGLAD_GENERALNY_149', label: 'Przegląd Generalny 149zł', percent: 0, amount: 149 },
  { id: 'DARMOWY_PODSTAWOWY', label: 'Darmowy Przegląd Podstawowy', percent: 0 },
]

export type ValidityKey = '1' | '3' | '6' | '12' | 'fix2026'

export function rabEntryKey(entry: Order) {
  if (entry.id != null && entry.id !== '') return String(entry.id)
  return [entry.tel || '', entry.kodOdbioru || '', entry.dataWydania || '', entry.model || '', entry.marka || ''].join('|')
}

function addMonths(ts: number, months: number) {
  const d = new Date(ts)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() !== day) d.setDate(0)
  return d.getTime()
}

export function computeValidUntil(createdAt: number, key: ValidityKey) {
  if (key === 'fix2026') return new Date(2026, 11, 31, 23, 59, 59, 999).getTime()
  const mo = parseInt(key, 10)
  return addMonths(createdAt, [1, 3, 6, 12].includes(mo) ? mo : 6)
}

export function validityMonthsStored(key: ValidityKey) {
  if (key === 'fix2026') return 0
  const mo = parseInt(key, 10)
  return [1, 3, 6, 12].includes(mo) ? mo : 6
}

export function genUnique8(existing: string[]) {
  const set = new Set(existing)
  for (let i = 0; i < 30; i++) {
    const c = String(Math.floor(10000000 + Math.random() * 90000000))
    if (!set.has(c)) return c
  }
  return String(Date.now()).slice(-8)
}

export function fmtDatePl(ts: number) {
  try {
    return new Date(ts).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return ''
  }
}

export function smsRabatyBody(r: Pick<RabCode, 'code' | 'templateLabel' | 'validUntil'>) {
  return [
    'Przesyłamy kod rabatowy',
    (r.code || '-').trim(),
    (r.templateLabel || '').trim(),
    '(bez kosztów części)',
    'Data ważności - ' + (r.validUntil ? fmtDatePl(r.validUntil) : '-'),
    'Zapraszamy ponownie',
  ].filter(Boolean).join('\n')
}
