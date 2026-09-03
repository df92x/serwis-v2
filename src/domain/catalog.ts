export const NAME_ALIASES: Record<string, string> = {
  Pedały: 'Pedała',
  Korba: 'Mechanizm korbowy',
  Fajka: 'Fajka/Gumka',
  'Owijka/Chwyty': 'Owijka',
}

export function canonicalName(name: string) {
  return NAME_ALIASES[name] || name
}

export type CatalogItem = {
  name: string
  price: number
  checked: boolean
  qty?: number
}

/** Kolejność i domyślne ceny jak w starej appce (bez pełnych presetów). */
export const DEFAULTS: CatalogItem[] = [
  { name: 'Naprawa', price: 0, checked: true },
  { name: 'Mechanizm korbowy', price: 0, checked: false },
  { name: 'Support', price: 0, checked: false },
  { name: 'Łańcuch', price: 0, checked: false },
  { name: 'Kaseta', price: 0, checked: false },
  { name: 'Przerzutka przednia', price: 0, checked: false },
  { name: 'Przerzutka tylna', price: 0, checked: false },
  { name: 'Hak', price: 0, checked: false },
  { name: 'Pedała', price: 0, checked: false },
  { name: 'Dźwignie', price: 0, checked: false },
  { name: 'Hamulce', price: 0, checked: false },
  { name: 'Tarcza', price: 0, checked: false, qty: 0 },
  { name: 'Klocki', price: 0, checked: false, qty: 0 },
  { name: 'Płyn', price: 0, checked: false, qty: 0 },
  { name: 'Linka', price: 0, checked: false, qty: 0 },
  { name: 'Pancerz', price: 0, checked: false, qty: 0 },
  { name: 'Końcówki', price: 0, checked: false, qty: 0 },
  { name: 'Fajka/Gumka', price: 0, checked: false, qty: 0 },
  { name: 'Opona', price: 0, checked: false, qty: 0 },
  { name: 'Dętka', price: 0, checked: false, qty: 0 },
  { name: 'Ochraniacz', price: 6, checked: false, qty: 0 },
  { name: 'Koło tylne', price: 0, checked: false },
  { name: 'Koło przednie', price: 0, checked: false },
  { name: 'Owijka', price: 0, checked: false },
  { name: 'Siodło', price: 0, checked: false },
  { name: 'Amortyzator', price: 0, checked: false },
  { name: 'Akcesoria', price: 0, checked: false },
  { name: 'Części i akcesoria', price: 0, checked: false },
]
