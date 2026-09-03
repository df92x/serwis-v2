import { STORAGE } from './keys'
import type { Order } from '../domain/order'
import { parseOrderList } from '../domain/parse'

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function readHistory(): Order[] {
  return parseOrderList(readJson(STORAGE.history, []))
}

export function readArchive(): Order[] {
  return parseOrderList(readJson(STORAGE.archive, []))
}

export function readTrash(): Order[] {
  return parseOrderList(readJson(STORAGE.trash, []))
}

export function writeHistory(orders: Order[]) {
  writeJson(STORAGE.history, orders)
}

export function writeArchive(orders: Order[]) {
  writeJson(STORAGE.archive, orders)
}

export function writeTrash(orders: Order[]) {
  writeJson(STORAGE.trash, orders)
}

export function findOrder(id: string | number): { order: Order; list: 'history' | 'archive' | 'trash' } | null {
  const sid = String(id)
  const hist = readHistory().find(o => String(o.id) === sid)
  if (hist) return { order: hist, list: 'history' }
  const arch = readArchive().find(o => String(o.id) === sid)
  if (arch) return { order: arch, list: 'archive' }
  const trash = readTrash().find(o => String(o.id) === sid)
  if (trash) return { order: trash, list: 'trash' }
  return null
}
