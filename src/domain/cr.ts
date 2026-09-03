export type CrAssembly = { id: string; label: string; price: number }
export type CrExtra = { id: string; label: string; price: number; priceLabel?: string }

export const CR_ASSEMBLY_CLASSIC: CrAssembly[] = [
  { id: 'mtb', label: 'MTB/Cross/Miejski/Trekkingowy/Składany', price: 149 },
  { id: 'kids', label: 'Dziecięcy/BMX/Dirt/Street', price: 99 },
  { id: 'road', label: 'Szosowy/Gravelowy/Przełajowy', price: 199 },
]

export const CR_ASSEMBLY_EBIKE: CrAssembly[] = [
  { id: 'mtb', label: 'MTB/Cross/Miejski/Trekkingowy/Składany', price: 199 },
  { id: 'kids', label: 'Dziecięcy/BMX/Dirt/Street', price: 149 },
  { id: 'road', label: 'Szosowy/Gravelowy/Przełajowy', price: 199 },
]

export const CR_EXTRAS: CrExtra[] = [
  { id: 'bagażnik', label: 'Montaż Bagażnik', price: 49, priceLabel: '49 - 59 zł' },
  { id: 'blotniki', label: 'Montaż Błotniki', price: 29 },
  { id: 'licznik', label: 'Montaż Licznik rowerowy', price: 29 },
  { id: 'oswietlenie', label: 'Montaż Oświetlenie rowerowe', price: 19 },
  { id: 'stopka', label: 'Montaż Stopka/podpórka rowerowa', price: 19 },
]

export type CrState = { assemblyId: string; extras: string[] }

export function crAssemblyOptions(ebike: boolean) {
  return ebike ? CR_ASSEMBLY_EBIKE : CR_ASSEMBLY_CLASSIC
}

/** Mapuje wybór CR na pozycję Naprawa (jak stara appka). */
export function applyCrToItems(
  items: Array<{ name: string; price: number; checked: boolean; qty?: number; customName?: string }>,
  cr: CrState,
  ebike: boolean,
) {
  const assembly = crAssemblyOptions(ebike).find(a => a.id === cr.assemblyId)
  const lines: string[] = []
  let total = 0
  if (assembly) {
    lines.push(`Złożenie roweru (${ebike ? 'e-Bike' : 'klasyczny'}): ${assembly.label}`)
    total += assembly.price
  }
  for (const ex of CR_EXTRAS) {
    if (cr.extras.includes(ex.id)) {
      lines.push(ex.label)
      total += ex.price
    }
  }
  return items.map(it => {
    if (it.name === 'Naprawa') {
      return {
        ...it,
        checked: !!assembly,
        price: total,
        customName: lines.join('; '),
      }
    }
    return {
      ...it,
      checked: false,
      price: it.name === 'Ochraniacz' ? it.price : 0,
      qty: it.qty !== undefined ? 0 : it.qty,
      customName: '',
    }
  })
}

export function calcCrTotal(cr: CrState, ebike: boolean) {
  const assembly = crAssemblyOptions(ebike).find(a => a.id === cr.assemblyId)
  let total = assembly?.price || 0
  for (const ex of CR_EXTRAS) {
    if (cr.extras.includes(ex.id)) total += ex.price
  }
  return total
}
