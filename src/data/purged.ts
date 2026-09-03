import { STORAGE } from './keys'
import { readJson, writeJson } from './storage'
import type { PurgedMap } from '../domain/merge'

export function readPurgedMap(): PurgedMap {
  const raw = readJson<unknown>(STORAGE.purged, {})
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as PurgedMap : {}
}

export function writePurgedMap(map: PurgedMap) {
  writeJson(STORAGE.purged, map)
}
