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
  writeTrash(upsertById(readTrash(), order))
}

export function restoreFromTrash(order: Order) {
  writeTrash(removeById(readTrash(), order.id))
  if (order.archivedAt || order.dataWydania) writeArchive(upsertById(readArchive(), order))
  else writeHistory(upsertById(readHistory(), order))
}
