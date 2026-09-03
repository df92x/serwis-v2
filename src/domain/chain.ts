export function calcChain(tarcza: number, kaseta: number, rozstawCm: number) {
  if (!tarcza || !kaseta || !rozstawCm) return null
  const C = rozstawCm / 2.54
  const L_inch = 2 * C + tarcza / 4 + kaseta / 4 + 1
  let ogniwa = Math.ceil(L_inch / 0.5)
  if (ogniwa % 2 !== 0) ogniwa++
  const dlugoscMm = ogniwa * 12.7
  return {
    ogniwa,
    dlugoscCm: (dlugoscMm / 10).toFixed(1),
    dlugoscMm: Math.round(dlugoscMm),
    cale: C.toFixed(2),
  }
}
