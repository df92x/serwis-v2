import { readArchive, readHistory, readTrash, writeArchive, writeHistory, writeTrash } from './storage'
import type { Order } from '../domain/order'
import { removeById, upsertById } from '../domain/lifecycle'

export function saveToHistory(order: Order) {
  writeHistory(upsertById(readHistory(), order))
}

export function moveHistoryToArchive(order: Order) {
  writeHistory(removeById(readHistory(), order.id))
  writeArchive(upsertById(readArchive(), order))
}

export function moveToTrash(order: Order, from: 'history' | 'archive') {
  if (from === 'history') writeHistory(removeById(readHistory(), order.id))
  else writeArchive(removeById(readArchive(), order.id))
  writeTrash(upsertById(readTrash(), {
    ...order,
    deletedAt: order.deletedAt || Date.now(),
  }))
}

export function restoreFromTrash(order: Order) {
  const cleaned = { ...order }
  delete cleaned.deletedAt
  writeTrash(removeById(readTrash(), order.id))
  if (cleaned.archivedAt || cleaned.dataWydania) writeArchive(upsertById(readArchive(), cleaned))
  else writeHistory(upsertById(readHistory(), cleaned))
}
