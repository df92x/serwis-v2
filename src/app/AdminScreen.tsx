import { STORAGE } from '../data/keys'
import { readArchive, readHistory, readTrash, writeArchive, writeHistory, writeTrash } from '../data/storage'
import { readRabatyActive, readRabatyUsed, writeRabatyActive, writeRabatyUsed } from '../data/rabatyStore'
import { parseOrderList } from '../domain/parse'
import type { RabCode } from '../domain/rabaty'
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

export function AdminScreen() {
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="new-order">
      <p className="hint">Kopia lokalna (te same klucze co stara appka). Google Drive — później.</p>
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
