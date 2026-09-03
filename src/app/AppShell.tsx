import { useState } from 'react'
import { CalcScreen } from './CalcScreen'
import { OrderForm } from './OrderForm'
import { OrdersScreen } from './OrdersScreen'
import { consumeInterrupted, readDraft } from '../data/draftStore'
import type { Screen } from './screens'
import type { Order } from '../domain/order'

const PLACEHOLDERS: Partial<Record<Screen, string>> = {
  admin: 'Administracja (sync / kopia) — kolejna faza',
  kody: 'Kody rabatowe — kolejna faza',
  lancuch: 'Kalkulator łańcucha — kolejna faza',
}

type View =
  | { screen: Screen }
  | { screen: 'nowe'; resume?: boolean }
  | { screen: 'przegladaj' }
  | { screen: 'edit'; order: Order }
  | { screen: 'repair'; order: Order }

function title(view: View) {
  if (view.screen === 'edit') return 'Edycja'
  if (view.screen === 'repair') return 'Naprawa'
  if (view.screen === 'przegladaj') return 'Zlecenia'
  if (view.screen === 'nowe') return 'Nowe zlecenie'
  if (view.screen === 'admin') return 'Administracja'
  if (view.screen === 'kody') return 'Kody rabatowe'
  if (view.screen === 'kalkulator') return 'Kalkulator'
  if (view.screen === 'lancuch') return 'Łańcuch'
  return 'SERWIS'
}

export function AppShell() {
  const [view, setView] = useState<View>(() => (
    consumeInterrupted() && readDraft()
      ? { screen: 'nowe', resume: true }
      : { screen: 'menu' }
  ))
  const backToBrowse = view.screen === 'edit' || view.screen === 'repair'

  if (view.screen !== 'menu') {
    return (
      <div className="shell">
        <header className="shell-head">
          <button
            type="button"
            className="ghost"
            onClick={() => setView({ screen: backToBrowse ? 'przegladaj' : 'menu' })}
          >
            ← Wstecz
          </button>
          <h1>{title(view)}</h1>
        </header>
        {view.screen === 'przegladaj' && (
          <OrdersScreen
            onEdit={order => setView({ screen: 'edit', order })}
            onRepair={order => setView({ screen: 'repair', order })}
          />
        )}
        {view.screen === 'nowe' && (
          <OrderForm
            mode="new"
            resumeDraft={'resume' in view ? !!view.resume : false}
            onDone={() => setView({ screen: 'przegladaj' })}
          />
        )}
        {view.screen === 'edit' && (
          <OrderForm mode="edit" order={view.order} onDone={() => setView({ screen: 'przegladaj' })} />
        )}
        {view.screen === 'repair' && (
          <OrderForm mode="repair" order={view.order} onDone={() => setView({ screen: 'przegladaj' })} />
        )}
        {view.screen === 'kalkulator' && <CalcScreen />}
        {PLACEHOLDERS[view.screen as Screen] && (
          <p className="muted">{PLACEHOLDERS[view.screen as Screen]}</p>
        )}
      </div>
    )
  }

  return (
    <div className="shell">
      <header className="brand">
        <h1>SERWIS</h1>
        <p className="muted">v2 — przebudowa (projekt równoległy)</p>
      </header>
      <button type="button" className="cta cta-add" onClick={() => setView({ screen: 'nowe' })}>
        DODAJ
      </button>
      <button type="button" className="cta cta-browse" onClick={() => setView({ screen: 'przegladaj' })}>
        PRZEGLĄDAJ
      </button>
      <div className="row">
        <button type="button" className="tile" onClick={() => setView({ screen: 'kody' })}>Rabaty</button>
        <button type="button" className="tile" onClick={() => setView({ screen: 'kalkulator' })}>Kalkulator</button>
        <button type="button" className="tile" onClick={() => setView({ screen: 'lancuch' })}>Łańcuch</button>
        <button type="button" className="tile" onClick={() => setView({ screen: 'admin' })}>Admin</button>
      </div>
    </div>
  )
}
