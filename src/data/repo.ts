import { readArchive, readHistory, readTrash, writeArchive, writeHistory, writeTrash } from './storage'
import { readPurgedMap, writePurgedMap } from './purged'
import { filterAliveKosz } from '../domain/kosz'
import type { Order } from '../domain/order'
import { removeById, upsertById } from '../domain/lifecycle'

export function saveToHistory(order: Order) {
  writeHistory(upsertById(readHistory(), order))
}

export function moveHistoryToArchive(order: Order) {
  writeHistory(removeById(readHistory(), order.id))
  writeArchive(upsertById(readArchive(), order))
}

export function unarchiveToHistory(order: Order) {
  writeArchive(removeById(readArchive(), order.id))
  writeHistory(upsertById(readHistory(), order))
}

export function moveToTrash(order: Order, from: 'history' | 'archive') {
  if (from === 'history') writeHistory(removeById(readHistory(), order.id))
  else writeArchive(removeById(readArchive(), order.id))
  writeTrash(upsertById(readTrash(), {
    ...order,
    deletedAt: order.deletedAt || Date.now(),
    deletedFrom: from === 'archive' ? 'archiwum' : 'historia',
  }))
}

export function restoreFromTrash(order: Order) {
  const cleaned = { ...order }
  const from = cleaned.deletedFrom
  delete cleaned.deletedAt
  delete cleaned.deletedFrom
  writeTrash(removeById(readTrash(), order.id))
  if (from === 'archiwum' || cleaned.archivedAt || cleaned.dataWydania) {
    writeArchive(upsertById(readArchive(), cleaned))
  } else {
    writeHistory(upsertById(readHistory(), cleaned))
  }
}

export function recordPurgedIds(ids: Array<string | number>) {
  const map = readPurgedMap()
  const now = Date.now()
  for (const id of ids) map[String(id)] = now
  writePurgedMap(map)
}

/** Usuwa wpisy starsze niż 24h i oznacza je jako purged (sync). */
export function purgeExpiredKosz() {
  const { alive, expiredIds } = filterAliveKosz(readTrash())
  if (!expiredIds.length) return 0
  recordPurgedIds(expiredIds)
  writeTrash(alive)
  return expiredIds.length
}

export function emptyTrashPermanent() {
  const kosz = readTrash()
  if (!kosz.length) return 0
  recordPurgedIds(kosz.map(o => o.id))
  writeTrash([])
  return kosz.length
}

export function deleteFromTrashPermanent(order: Order) {
  recordPurgedIds([order.id])
  writeTrash(removeById(readTrash(), order.id))
}
