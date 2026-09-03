import type { Order } from './order'

/** Priorytet konfliktu — jak w starej appce. */
export function entryMergeRank(e: Order): number {
  if (e.deletedAt) return 6
  if (e.unarchivedAt && !e.dataWydania && !e.archivedAt) return 5.5
  if (e.dataWydania || e.archivedAt) return 5
  if (e.raportKoncowy) return e.smsSent ? 4 : 3
  return e.smsSent ? 2 : 1
}

function isUnarchivedState(e: Order) {
  return !!(e.unarchivedAt && !e.dataWydania && !e.archivedAt)
}

export function parseDateDmy(s?: string) {
  if (!s) return 0
  const p = String(s).split('.')
  if (p.length < 2) return 0
  const d = parseInt(p[0], 10)
  const m = parseInt(p[1], 10) - 1
  const y = p.length >= 3 ? parseInt(p[2], 10) : new Date().getFullYear()
  return new Date(y, m, d).getTime()
}

function archivedAtMs(e: Order) {
  if (e.archivedAt) return Date.parse(e.archivedAt) || 0
  if (e.dataWydania) return parseDateDmy(e.dataWydania)
  return 0
}

export function pickMergeWinner(ex: Order, entry: Order): Order {
  const exUn = isUnarchivedState(ex)
  const enUn = isUnarchivedState(entry)
  const exAr = !!(ex.dataWydania || ex.archivedAt)
  const enAr = !!(entry.dataWydania || entry.archivedAt)

  if (exUn && enAr) {
    return archivedAtMs(entry) >= (Date.parse(ex.unarchivedAt || '') || 0) ? entry : ex
  }
  if (enUn && exAr) {
    return archivedAtMs(ex) >= (Date.parse(entry.unarchivedAt || '') || 0) ? ex : entry
  }

  const se = entryMergeRank(entry)
  const sx = entryMergeRank(ex)
  if (se > sx) return entry
  if (sx > se) return ex
  const merged = { ...ex, ...entry }
  if (ex.smsSent || entry.smsSent) merged.smsSent = true
  return merged
}

export type PurgedMap = Record<string, number>

export function mergePurgedMaps(local: PurgedMap, remote: PurgedMap): PurgedMap {
  const out: PurgedMap = { ...remote }
  for (const [id, ts] of Object.entries(local || {})) {
    if (!out[id] || ts > out[id]) out[id] = ts
  }
  return out
}

export function isPurgedId(id: string | number, purged: PurgedMap) {
  return !!purged[String(id)]
}

export type MergedBuckets = {
  history: Order[]
  archive: Order[]
  trash: Order[]
  purged: PurgedMap
  changed: number
}

export function mergeOrderBuckets(input: {
  localHistory: Order[]
  localArchive: Order[]
  localTrash: Order[]
  localPurged: PurgedMap
  remoteHistory: Order[]
  remoteArchive: Order[]
  remoteTrash: Order[]
  remotePurged: PurgedMap
}): MergedBuckets {
  const purged = mergePurgedMaps(input.localPurged, input.remotePurged)
  const map = new Map<string, Order>()

  const add = (entry: Order) => {
    const id = String(entry.id)
    if (isPurgedId(id, purged)) return
    const ex = map.get(id)
    if (!ex) {
      map.set(id, entry)
      return
    }
    map.set(id, pickMergeWinner(ex, entry))
  }

  // Remote first, local second → local wins on equal status (Object.assign in winner)
  ;[...input.remoteHistory, ...input.remoteArchive, ...input.remoteTrash].forEach(add)
  ;[...input.localHistory, ...input.localArchive, ...input.localTrash].forEach(add)

  const history: Order[] = []
  const archive: Order[] = []
  const trash: Order[] = []
  for (const e of map.values()) {
    if (isPurgedId(e.id, purged)) continue
    if (e.deletedAt) trash.push(e)
    else if (e.dataWydania || e.archivedAt) archive.push(e)
    else history.push(e)
  }

  const localAll = [...input.localHistory, ...input.localArchive, ...input.localTrash]
  const mergedAll = [...history, ...archive, ...trash]
  const localMap = new Map(localAll.map(e => [String(e.id), JSON.stringify(e)]))
  const changed = mergedAll.filter(e => localMap.get(String(e.id)) !== JSON.stringify(e)).length

  return { history, archive, trash, purged, changed }
}
