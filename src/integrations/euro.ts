export async function fetchEuroRate(dateStr: string) {
  const url = `https://api.frankfurter.dev/v1/${dateStr}?base=EUR&symbols=PLN`
  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!resp.ok) throw new Error('no_rate')
  const data = await resp.json() as { rates?: { PLN?: number }; date?: string }
  if (!data.rates?.PLN) throw new Error('no_pln')
  return {
    rate: Math.round(data.rates.PLN * 100) / 100,
    date: data.date || dateStr,
  }
}

export function plnToEur(pln: number, rate: number) {
  return Math.round(pln / rate * 100) / 100
}

export function eurToPln(eur: number, rate: number) {
  return Math.round(eur * rate * 100) / 100
}

export function todayIsoDate() {
  const d = new Date()
  return d.getFullYear()
    + '-' + String(d.getMonth() + 1).padStart(2, '0')
    + '-' + String(d.getDate()).padStart(2, '0')
}
