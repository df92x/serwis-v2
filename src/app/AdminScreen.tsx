import { STORAGE } from '../data/keys'
import { readArchive, readHistory, readTrash, writeArchive, writeHistory, writeTrash } from '../data/storage'
import { readRabatyActive, readRabatyUsed, writeRabatyActive, writeRabatyUsed } from '../data/rabatyStore'
import { parseOrderList } from '../domain/parse'
import type { RabCode } from '../domain/rabaty'
import {
  loginGoogleDrive,
  logoutGoogleDrive,
  manualDriveSync,
  readDriveSession,
} from '../integrations/sync'
import { useRef, useState } from 'react'

type Backup = {
  version: 1
  exportedAt: string
  history: unknown
  archive: unknown
  trash: unknown
  rabatyActive: unknown
  rabatyUsed: unknown
  draft?: string | null
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function fmtSync(iso: string) {
  if (!iso) return 'Brak synchronizacji'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
      + ' '
      + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function AdminScreen() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [session, setSession] = useState(() => readDriveSession())
  const fileRef = useRef<HTMLInputElement>(null)

  function refreshSession() {
    setSession(readDriveSession())
  }

  function exportBackup() {
    const payload: Backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      history: readHistory(),
      archive: readArchive(),
      trash: readTrash(),
      rabatyActive: readRabatyActive(),
      rabatyUsed: readRabatyUsed(),
      draft: localStorage.getItem(STORAGE.draft),
    }
    const stamp = new Date().toISOString().slice(0, 10)
    download(`serwis-backup-${stamp}.json`, JSON.stringify(payload, null, 2))
    setMsg('Backup pobrany.')
  }

  function importBackup(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}')) as Backup
        if (!data || typeof data !== 'object') throw new Error('Zły plik')
        writeHistory(parseOrderList(data.history ?? []))
        writeArchive(parseOrderList(data.archive ?? []))
        writeTrash(parseOrderList(data.trash ?? []))
        writeRabatyActive(Array.isArray(data.rabatyActive) ? data.rabatyActive as RabCode[] : [])
        writeRabatyUsed(Array.isArray(data.rabatyUsed) ? data.rabatyUsed as RabCode[] : [])
        if (typeof data.draft === 'string') localStorage.setItem(STORAGE.draft, data.draft)
        setMsg(`Import OK · ${new Date().toLocaleTimeString('pl-PL')}`)
      } catch {
        setMsg('Nie udało się wczytać backupu.')
      }
    }
    reader.readAsText(file)
  }

  async function onLogin() {
    setBusy(true)
    setMsg('')
    try {
      await loginGoogleDrive()
      refreshSession()
      setMsg('Zalogowano. Kliknij Synchronizuj.')
    } catch {
      setMsg('Logowanie Google nieudane.')
    } finally {
      setBusy(false)
    }
  }

  function onLogout() {
    logoutGoogleDrive()
    refreshSession()
    setMsg('Wylogowano.')
  }

  async function onSync() {
    setBusy(true)
    setMsg('Synchronizacja…')
    try {
      const r = await manualDriveSync()
      refreshSession()
      setMsg(r.changed > 0
        ? `Sync OK · zmieniono ${r.changed} zleceń`
        : 'Sync OK · bez zmian lokalnych')
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      setMsg(err === 'gsi_unavailable'
        ? 'Brak Google Sign-In — sprawdź sieć / odśwież.'
        : 'Sync błąd: ' + err)
      refreshSession()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="new-order">
      <div className="order-card">
        {session.hasSession ? (
          <>
            <div className="drive-row">
              {session.avatar ? (
                <img className="drive-avatar" src={session.avatar} alt="" />
              ) : null}
              <div>
                <div className="order-title" style={{ color: '#22c55e' }}>{session.emailMasked}</div>
                <div className="order-date">{fmtSync(session.lastSync)}</div>
              </div>
            </div>
            <div className="card-actions">
              <button type="button" className="ok" disabled={busy} onClick={() => void onSync()}>
                Synchronizuj
              </button>
              <button type="button" disabled={busy} onClick={onLogout}>Wyloguj</button>
            </div>
          </>
        ) : (
          <button type="button" className="cta cta-browse" disabled={busy} onClick={() => void onLogin()}>
            Zaloguj Google Drive
          </button>
        )}
      </div>

      <p className="hint">Kopia lokalna JSON (te same klucze co stara appka).</p>
      <button type="button" className="cta cta-browse" onClick={exportBackup}>Eksport JSON</button>
      <button type="button" className="cta cta-add" onClick={() => fileRef.current?.click()}>Import JSON</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) importBackup(f)
          e.target.value = ''
        }}
      />
      {msg && <p className="hint">{msg}</p>}
      <p className="muted">
        Historia: {readHistory().length} · Archiwum: {readArchive().length} · Kosz: {readTrash().length}
      </p>
    </div>
  )
}
