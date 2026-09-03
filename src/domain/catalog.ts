export const NAME_ALIASES: Record<string, string> = {
  Pedały: 'Pedała',
  Korba: 'Mechanizm korbowy',
  Fajka: 'Fajka/Gumka',
  'Owijka/Chwyty': 'Owijka',
}

export function canonicalName(name: string) {
  return NAME_ALIASES[name] || name
}

export type Preset = { label: string; price: number }
export type NaprawaOption = { id: string; label: string; price: number }

export type CatalogItem = {
  name: string
  price: number
  checked: boolean
  qty?: number
  presets?: Preset[]
  options?: NaprawaOption[]
  note?: boolean
}

export const NAPRAWA_SERVICES: NaprawaOption[] = [
  { id: 'drobne', label: 'Drobne naprawy', price: 50 },
  { id: 'przygotowanie', label: 'Przygotowanie', price: 100 },
  { id: 'przeglad_podst', label: 'Przegląd podstawowy', price: 150 },
  { id: 'przeglad_pelny', label: 'Przegląd pełny', price: 250 },
  { id: 'diag_ebike', label: 'Diagnostyka e-Bike', price: 100 },
  { id: 'zlozenie_100', label: 'Złożenie roweru 100', price: 100 },
  { id: 'zlozenie_150', label: 'Złożenie roweru 150', price: 150 },
  { id: 'zlozenie_200', label: 'Złożenie roweru 200', price: 200 },
  { id: 'zlozenie_250', label: 'Złożenie roweru 250', price: 250 },
]

/** Kolejność, ceny i presety jak w starej appce. */
export const DEFAULTS: CatalogItem[] = [
  { name: 'Naprawa', price: 0, checked: true, options: NAPRAWA_SERVICES.map(x => ({ ...x })) },
  {
    name: 'Mechanizm korbowy', price: 0, checked: false,
    presets: [
      { label: 'Kwadrat', price: 119 },
      { label: 'Octalink', price: 189 },
      { label: 'Hollowtech', price: 229 },
    ],
  },
  {
    name: 'Support', price: 0, checked: false,
    presets: [
      { label: 'Neco', price: 45 },
      { label: 'Nexelo', price: 65 },
      { label: 'Octalink', price: 80 },
      { label: 'Hollowtech', price: 79 },
      { label: 'Hollowtech Pro', price: 129 },
      { label: 'TOKEN', price: 229 },
    ],
  },
  {
    name: 'Łańcuch', price: 0, checked: false,
    presets: [
      { label: '7/8s KMC', price: 39 },
      { label: '7/8s Shimano HG40', price: 59 },
      { label: '7/8s Shimano HG71', price: 70 },
      { label: '7/8s KMC X8', price: 65 },
      { label: '7/8s KMC X8S', price: 79 },
      { label: '9s KMC X9', price: 85 },
      { label: '10s Shimano', price: 79 },
      { label: '10s KMC X10', price: 89 },
      { label: '10s KMC X10S', price: 109 },
      { label: '11s KMC X11', price: 99 },
      { label: '11s KMC X11BS', price: 119 },
      { label: '12s KMC X12', price: 169 },
      { label: 'E10 KMC', price: 129 },
      { label: 'E11 KMC', price: 139 },
      { label: 'E12 KMC', price: 159 },
      { label: 'Wippermann', price: 199 },
    ],
  },
  {
    name: 'Kaseta', price: 0, checked: false,
    presets: [
      { label: '6s Wolnobieg SHI', price: 69 },
      { label: '7s Wolnobieg SHI', price: 79 },
      { label: '8s Shimano', price: 99 },
      { label: '9s Shimano', price: 109 },
      { label: '10s Shimano', price: 149 },
    ],
  },
  { name: 'Przerzutka przednia', price: 0, checked: false },
  {
    name: 'Przerzutka tylna', price: 0, checked: false,
    presets: [
      { label: 'Kółka maszynowe', price: 45 },
      { label: '6/7/8', price: 69 },
      { label: '7/8', price: 89 },
      { label: '8/9', price: 99 },
      { label: '10/11', price: 149 },
    ],
  },
  { name: 'Hak', price: 0, checked: false },
  {
    name: 'Pedała', price: 0, checked: false,
    presets: [
      { label: 'Plastikowe', price: 25 },
      { label: 'Aluminium', price: 39 },
      { label: 'Nexelo', price: 79 },
      { label: 'Zeray', price: 119 },
    ],
  },
  { name: 'Dźwignie', price: 0, checked: false },
  { name: 'Hamulce', price: 0, checked: false },
  {
    name: 'Tarcza', price: 0, checked: false, qty: 0,
    presets: [
      { label: 'RT10', price: 45 },
      { label: 'RT56', price: 65 },
      { label: 'RT66', price: 90 },
      { label: 'Centerline', price: 120 },
      { label: 'Magura', price: 120 },
    ],
  },
  {
    name: 'Klocki', price: 0, checked: false, qty: 0,
    presets: [
      { label: 'VBreak', price: 30 },
      { label: 'Zamiennik', price: 39 },
      { label: 'Oryginał', price: 55 },
      { label: 'Oryginał+', price: 79 },
      { label: 'E-bike', price: 60 },
    ],
  },
  {
    name: 'Płyn', price: 0, checked: false, qty: 0,
    presets: [
      { label: 'Shimano', price: 20 },
      { label: 'Magura', price: 30 },
      { label: 'SRAM', price: 40 },
    ],
  },
  { name: 'Linka', price: 0, checked: false, qty: 0 },
  { name: 'Pancerz', price: 0, checked: false, qty: 0 },
  { name: 'Końcówki', price: 0, checked: false, qty: 0 },
  { name: 'Fajka/Gumka', price: 0, checked: false, qty: 0 },
  { name: 'Opona', price: 0, checked: false, qty: 0 },
  {
    name: 'Dętka', price: 0, checked: false, qty: 0,
    presets: [
      { label: 'Standard', price: 25 },
      { label: 'Vittoria/Vredestein', price: 39 },
      { label: 'Premium', price: 49 },
    ],
  },
  { name: 'Ochraniacz', price: 6, checked: false, qty: 0 },
  { name: 'Koło tylne', price: 0, checked: false },
  { name: 'Koło przednie', price: 0, checked: false },
  { name: 'Owijka', price: 0, checked: false },
  { name: 'Siodło', price: 0, checked: false },
  { name: 'Amortyzator', price: 0, checked: false },
  { name: 'Akcesoria', price: 0, checked: false },
  { name: 'Części i akcesoria', price: 0, checked: false, note: true },
]

export function findDefault(name: string) {
  return DEFAULTS.find(d => d.name === canonicalName(name))
}

export type SelectedOption = { id: string; label: string; price: number }

export function applyNaprawaOptions(selected: SelectedOption[]) {
  const total = selected.reduce((s, o) => s + (Number(o.price) || 0), 0)
  return {
    price: total,
    customName: selected.map(o => o.label).filter(Boolean).join(' + '),
    checked: selected.length > 0,
    selectedOptions: selected,
  }
}

export function applyPreset(price: number, label: string, zeroBasedIndex: number) {
  return {
    price,
    customName: label,
    /** 1-based jak w starej appce (0 / -1 = brak). */
    selectedPreset: zeroBasedIndex + 1,
    checked: true,
  }
}
