import { useState } from 'react'
import type { Screen } from './screens'

const PLACEHOLDERS: Partial<Record<Screen, string>> = {
  przegladaj: 'Lista zleceń — kolejna faza',
  nowe: 'Przyjęcie zlecenia — kolejna faza',
  admin: 'Administracja — kolejna faza',
  kody: 'Kody rabatowe — kolejna faza',
  kalkulator: 'Kalkulator — kolejna faza',
  lancuch: 'Łańcuch — kolejna faza',
}

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('menu')

  if (screen !== 'menu') {
    return (
      <div className="shell">
        <header className="shell-head">
          <button type="button" className="ghost" onClick={() => setScreen('menu')}>
            ← Menu
          </button>
          <h1>{screen}</h1>
        </header>
        <p className="muted">{PLACEHOLDERS[screen]}</p>
        <p className="hint">Stara aplikacja w folderze SERWIS działa niezależnie.</p>
      </div>
    )
  }

  return (
    <div className="shell">
      <header className="brand">
        <h1>SERWIS</h1>
        <p className="muted">v2 — przebudowa (projekt równoległy)</p>
      </header>
      <button type="button" className="cta cta-add" onClick={() => setScreen('nowe')}>
        DODAJ
      </button>
      <button type="button" className="cta cta-browse" onClick={() => setScreen('przegladaj')}>
        PRZEGLĄDAJ
      </button>
      <div className="row">
        <button type="button" className="tile" onClick={() => setScreen('kody')}>
          Rabaty
        </button>
        <button type="button" className="tile" onClick={() => setScreen('kalkulator')}>
          Kalkulator
        </button>
        <button type="button" className="tile" onClick={() => setScreen('lancuch')}>
          Łańcuch
        </button>
        <button type="button" className="tile" onClick={() => setScreen('admin')}>
          Admin
        </button>
      </div>
    </div>
  )
}
