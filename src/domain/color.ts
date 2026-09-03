const COLOR_MAP: Record<string, string> = {
  CZARNY: '#111',
  BRĄZOWY: '#6b4423',
  SZARY: '#9ca3af',
  BIAŁY: '#f0f0f0',
  CZERWONY: '#dc2626',
  NIEBIESKI: '#2563eb',
  FIOLETOWY: '#9333ea',
  ZIELONY: '#16a34a',
  ZŁOTY: '#d97706',
}

export function kolorCss(token: string) {
  if (!token) return null
  const t = String(token).trim()
  if (/^#?[0-9a-fA-F]{6}$/.test(t)) return t[0] === '#' ? t : '#' + t
  return COLOR_MAP[t.toUpperCase()] || null
}

export function kolorBackgroundStyle(kolor?: string) {
  if (!kolor) return 'transparent'
  const k = String(kolor).trim()
  if (k.includes('/')) {
    const parts = k.split('/').map(s => s.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const c1 = kolorCss(parts[0]!)
      const c2 = kolorCss(parts[1]!)
      if (c1 && c2) {
        return `linear-gradient(180deg,${c1} 0,${c1} 50%,${c2} 50%,${c2} 100%)`
      }
    }
  }
  const css = kolorCss(k)
  if (css) return css
  return 'repeating-linear-gradient(45deg,#6b7280 0 4px,#111827 4px 8px)'
}
