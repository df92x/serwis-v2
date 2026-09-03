import { STORAGE } from './keys'
import { writeJson } from './storage'
import { draftHasProgress } from '../domain/draft'
import { hydrateStateItems, parseState, type OrderState } from '../domain/parse'

export function readDraft(): OrderState | null {
  const parsed = parseState(localStorage.getItem(STORAGE.draft))
  if (!parsed?.items?.length) return null
  return hydrateStateItems(parsed)
}

export function writeDraft(state: OrderState) {
  if (!draftHasProgress(state)) {
    clearDraft()
    return
  }
  writeJson(STORAGE.draft, state)
}

export function clearDraft() {
  localStorage.removeItem(STORAGE.draft)
  localStorage.removeItem(STORAGE.draftInterrupted)
  localStorage.removeItem(STORAGE.raportDraft)
}

export function markInterrupted() {
  localStorage.setItem(STORAGE.draftInterrupted, '1')
}

export function consumeInterrupted() {
  const on = localStorage.getItem(STORAGE.draftInterrupted) === '1'
  if (on) localStorage.removeItem(STORAGE.draftInterrupted)
  return on
}
