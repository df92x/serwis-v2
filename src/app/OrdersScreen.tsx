import { useMemo, useState } from 'react'
import { readArchive, readHistory, readTrash } from '../data/storage'
import { moveHistoryToArchive, moveToTrash, restoreFromTrash, unarchiveToHistory } from '../data/repo'
import { createRabForEntry, hasRabForEntry, templateById } from '../data/rabatyStore'
import { releaseOrder, unarchiveOrder } from '../domain/lifecycle'
import { orderStatus, type Order } from '../domain/order'
import { bikeDisplayName } from '../domain/parse'
import { copyText, downloadReportPdf, downloadReportPng, downloadText, orderReportText } from '../domain/report'
import { smsHref, smsPrzyjecieBody, smsWydanieBody } from '../domain/sms'
import { RABATY_TEMPLATES } from '../domain/rabaty'

type Tab = 'przyjete' | 'gotowe' | 'wydane' | 'kosz'

function loadTab(tab: Tab): Order[] {
  if (tab === 'wydane') return readArchive()
  if (tab === 'kosz') return readTrash()
  const hist = readHistory()
  if (tab === 'gotowe') return hist.filter(o => orderStatus(o) === 'gotowe')
  return hist.filter(o => orderStatus(o) === 'przyjete')
}

function fileBase(o: Order) {
  return `serwis-${String(o.id)}`
}

export function OrdersScreen({
  onEdit,
  onRepair,
}: {
  onEdit: (order: Order) => void
  onRepair: (order: Order) => void
}) {
  const [tab, setTab] = useState<Tab>('przyjete')
  const [q, setQ] = useState('')
  const [tick, setTick] = useState(0)
  const [flash, setFlash] = useState('')
  const refresh = () => setTick(n => n + 1)

  const orders = useMemo(() => {
    const list = loadTab(tab)
    const n = q.replace(/\D/g, '')
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(o => {
      const tel = String(o.tel || '').replace(/\D/g, '')
      const name = bikeDisplayName(o.marka, o.model).toLowerCase()
      const kod = String(o.kodOdbioru || '')
      return (n && tel.includes(n)) || name.includes(s) || kod.includes(s)
    })
  }, [tab, q, tick])

  function assignDefaultRab(o: Order) {
    if (hasRabForEntry(o)) {
      setFlash('Kod rabatowy już istnieje dla tego zlecenia.')
      return
    }
    const row = createRabForEntry(o, templateById(RABATY_TEMPLATES[0].id), '6')
    setFlash(row ? `Kod ${row.code}` : 'Nie udało się utworzyć kodu.')
    refresh()
  }

  async function shareReport(o: Order) {
    const text = orderReportText(o)
    if (await copyText(text)) setFlash('Raport skopiowany.')
    else {
      downloadText(fileBase(o) + '.txt', text)
      setFlash('Raport pobrany (TXT).')
    }
  }

  function pngReport(o: Order) {
    downloadReportPng(fileBase(o) + '.png', orderReportText(o))
    setFlash('PNG pobrany.')
  }

  function pdfReport(o: Order) {
    void downloadReportPdf(fileBase(o) + '.pdf', orderReportText(o)).then(() => {
      setFlash('PDF pobrany.')
    })
  }

  return (
    <div className="orders">
      <nav className="tabs">
        {(['przyjete', 'gotowe', 'wydane', 'kosz'] as const).map(t => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'tab on' : 'tab'}
            onClick={() => setTab(t)}
          >
            {t === 'przyjete' ? 'Przyjęte' : t === 'gotowe' ? 'Gotowe' : t === 'wydane' ? 'Wydane' : 'Kosz'}
          </button>
        ))}
      </nav>
      <input
        className="search"
        placeholder="Tel / model / kod"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      {flash && <p className="hint">{flash}</p>}
      {!orders.length && (
        <p className="muted">
          Brak zleceń. Dane ze starej appki w tej samej przeglądarce pojawią się automatycznie.
        </p>
      )}
      <ul className="order-list">
        {orders.map(o => {
          const acceptSms = smsHref(o.tel, smsPrzyjecieBody(o))
          const readySms = smsHref(o.tel, smsWydanieBody(o))
          return (
            <li key={String(o.id)} className="order-card">
              <div className="order-title">{bikeDisplayName(o.marka, o.model)}</div>
              <div className="order-meta">
                {o.tel && <span>{o.tel}</span>}
                {o.total && <span>{o.total} zł</span>}
              </div>
              {o.kodOdbioru && <div className="order-date">Kod: {o.kodOdbioru}</div>}
              {o.label && <div className="order-date">{o.label}</div>}
              {!!o.photos?.length && <div className="order-date">Zdjęcia: {o.photos.length}</div>}
              <div className="card-actions">
                {tab === 'przyjete' && (
                  <>
                    <button type="button" onClick={() => onEdit(o)}>EDYTUJ</button>
                    <button type="button" onClick={() => onRepair(o)}>NAPRAWA</button>
                    {acceptSms && <a className="link-btn" href={acceptSms}>SMS</a>}
                    <button type="button" onClick={() => shareReport(o)}>KOPIUJ</button>
                    <button type="button" className="danger" onClick={() => { moveToTrash(o, 'history'); refresh() }}>KOSZ</button>
                  </>
                )}
                {tab === 'gotowe' && (
                  <>
                    <button type="button" onClick={() => onRepair(o)}>EDYTUJ</button>
                    {readySms && <a className="link-btn" href={readySms}>SMS</a>}
                    <button type="button" onClick={() => shareReport(o)}>KOPIUJ</button>
                    <button type="button" onClick={() => pngReport(o)}>PNG</button>
                    <button type="button" onClick={() => pdfReport(o)}>PDF</button>
                    <button type="button" className="ok" onClick={() => { moveHistoryToArchive(releaseOrder(o)); refresh() }}>WYDAJ</button>
                    <button type="button" className="danger" onClick={() => { moveToTrash(o, 'history'); refresh() }}>KOSZ</button>
                  </>
                )}
                {tab === 'wydane' && (
                  <>
                    <button type="button" onClick={() => {
                      unarchiveToHistory(unarchiveOrder(o))
                      setTab('gotowe')
                      refresh()
                      setFlash('Cofnięto do Gotowe.')
                    }}>COFNIJ</button>
                    <button type="button" onClick={() => assignDefaultRab(o)}>RABAT</button>
                    <button type="button" onClick={() => shareReport(o)}>KOPIUJ</button>
                    <button type="button" onClick={() => pngReport(o)}>PNG</button>
                    <button type="button" onClick={() => pdfReport(o)}>PDF</button>
                    <button type="button" className="danger" onClick={() => { moveToTrash(o, 'archive'); refresh() }}>KOSZ</button>
                  </>
                )}
                {tab === 'kosz' && (
                  <button type="button" onClick={() => { restoreFromTrash(o); refresh() }}>PRZYWRÓĆ</button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
