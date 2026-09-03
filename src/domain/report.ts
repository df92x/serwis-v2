import type { Order, OrderItem, OrderSub } from './order'
import { bikeDisplayName, hydrateStateItems, parseState } from './parse'

function lineItem(it: OrderItem) {
  if (!it.checked && !(it.qty && it.qty > 0)) return null
  const qty = it.qty !== undefined && it.qty > 0 ? ` x${it.qty}` : ''
  const name = it.customName?.trim() || it.name
  const price = (Number(it.price) || 0).toFixed(2).replace('.', ',')
  return `${name}${qty}: ${price} zł`
}

function lineSub(s: OrderSub) {
  if (!(s.name || '').trim() && !(Number(s.price) > 0)) return null
  if (!s.checked && !(Number(s.price) > 0)) return null
  return `${s.name || 'Inne'}: ${(Number(s.price) || 0).toFixed(2).replace('.', ',')} zł`
}

export function orderReportText(order: Order) {
  const lines: string[] = []
  lines.push('SERWIS ROW-POL')
  lines.push(bikeDisplayName(order.marka, order.model))
  if (order.kolor) lines.push('Kolor: ' + order.kolor)
  if (order.tel) lines.push('Tel: ' + order.tel)
  if (order.termin) lines.push('Termin: ' + order.termin)
  if (order.label) lines.push('Przyjęto: ' + order.label)
  if (order.kodOdbioru) lines.push('Kod odbioru: ' + order.kodOdbioru)
  lines.push('')

  const raport = order.raportKoncowy
  const state = raport
    ? hydrateStateItems({ items: raport.items, subs: raport.subs || [] })
    : hydrateStateItems(parseState(order.state) || { items: [], subs: [] })

  lines.push(raport ? 'Raport końcowy:' : 'Zlecone:')
  for (const it of state.items) {
    const row = lineItem(it)
    if (row) lines.push('• ' + row)
  }
  for (const s of state.subs) {
    const row = lineSub(s)
    if (row) lines.push('• ' + row)
  }
  lines.push('')
  lines.push('Suma: ' + (raport?.total || order.total || '0') + ' zł')
  if (raport?.notatka) {
    lines.push('')
    lines.push('Notatka: ' + raport.notatka)
  }
  if (order.dataWydania) lines.push('Wydano: ' + order.dataWydania)
  return lines.join('\n')
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function renderReportCanvas(text: string) {
  const rows = text.split('\n')
  const pad = 24
  const lineH = 22
  const w = 720
  const h = pad * 2 + rows.length * lineH
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = Math.max(h, 200)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111827'
  ctx.font = '16px Segoe UI, Arial, sans-serif'
  rows.forEach((row, i) => {
    ctx.fillText(row, pad, pad + (i + 1) * lineH - 6)
  })
  return canvas
}

/** Prosty PNG z tekstem — bez html2canvas. */
export function downloadReportPng(filename: string, text: string) {
  const canvas = renderReportCanvas(text)
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  a.click()
}

/** PDF jako obraz tekstu — polskie znaki bez osobnej czcionki. */
export async function downloadReportPdf(filename: string, text: string) {
  const canvas = renderReportCanvas(text)
  if (!canvas) return
  const { jsPDF } = await import('jspdf')
  const img = canvas.toDataURL('image/jpeg', 0.92)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 36
  const maxW = pageW - margin * 2
  const maxH = pageH - margin * 2
  const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1)
  const w = canvas.width * scale
  const h = canvas.height * scale
  pdf.addImage(img, 'JPEG', margin, margin, w, h)
  pdf.save(filename)
}
