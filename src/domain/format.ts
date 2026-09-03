export function digitsTel(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 9)
  if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`
  return d
}

export function todayPl() {
  return new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function nowLabel() {
  const now = new Date()
  return todayPl() + ' ' + now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

export function kodOdbioru() {
  return String(Math.floor(10000 + Math.random() * 90000))
}
