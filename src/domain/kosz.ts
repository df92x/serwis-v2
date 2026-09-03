export const KOSZ_TTL_MS = 24 * 60 * 60 * 1000

export function deletedAtMs(deletedAt: string | number | undefined) {
  if (deletedAt == null) return 0
  if (typeof deletedAt === 'number') return deletedAt
  const n = Number(deletedAt)
  if (Number.isFinite(n) && String(deletedAt).trim() === String(n)) return n
  return Date.parse(deletedAt) || 0
}

export function isWithinKoszTtl(deletedAt: string | number | undefined, now = Date.now()) {
  const ms = deletedAtMs(deletedAt)
  if (!ms) return false
  return (now - ms) < KOSZ_TTL_MS
}

export function filterAliveKosz<T extends { deletedAt?: string | number; id?: string | number }>(
  list: T[],
  now = Date.now(),
) {
  const alive: T[] = []
  const expiredIds: Array<string | number> = []
  for (const e of list) {
    if (isWithinKoszTtl(e.deletedAt, now)) alive.push(e)
    else if (e.id != null) expiredIds.push(e.id)
  }
  return { alive, expiredIds }
}
