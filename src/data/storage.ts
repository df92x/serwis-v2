import { STORAGE } from './keys'

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

export function readHistory() {
  return readJson(STORAGE.history, [] as unknown[])
}

export function readArchive() {
  return readJson(STORAGE.archive, [] as unknown[])
}
