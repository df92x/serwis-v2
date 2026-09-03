import { STORAGE } from '../data/keys'
import { readArchive, readHistory, readTrash, writeArchive, writeHistory, writeTrash } from '../data/storage'
import { readPurgedMap, writePurgedMap } from '../data/purged'
import { mergeOrderBuckets } from '../domain/merge'
import { parseOrderList } from '../domain/parse'
import {
  fetchCurrentPayload,
  fetchUserInfo,
  getAccessToken,
  getOrCreateFolderId,
  requestGoogleToken,
  revokeGoogleToken,
  saveDriveFile,
  setAccessToken,
  type DriveRemotePayload,
} from './gdrive'

export type SyncStatus = 'idle' | 'busy' | 'ok' | 'error'

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!domain) return email.slice(0, 3) + '***'
  return user.slice(0, 3) + '***@' + domain
}

export function readDriveSession() {
  const email = localStorage.getItem(STORAGE.gdriveEmail) || ''
  const avatar = localStorage.getItem(STORAGE.gdriveAvatar) || ''
  const lastSync = localStorage.getItem(STORAGE.gdriveLastSync) || ''
  return {
    email,
    emailMasked: email ? maskEmail(email) : '',
    avatar,
    lastSync,
    hasSession: !!email,
    hasToken: !!getAccessToken(),
  }
}

export async function loginGoogleDrive() {
  const token = await requestGoogleToken()
  setAccessToken(token)
  try {
    const info = await fetchUserInfo(token)
    if (info.email) localStorage.setItem(STORAGE.gdriveEmail, info.email)
    if (info.picture) localStorage.setItem(STORAGE.gdriveAvatar, info.picture)
  } catch { /* email optional */ }
  return readDriveSession()
}

export function logoutGoogleDrive() {
  revokeGoogleToken()
  localStorage.removeItem(STORAGE.gdriveEmail)
  localStorage.removeItem(STORAGE.gdriveAvatar)
  localStorage.removeItem(STORAGE.gdriveFolderId)
}

async function ensureToken(): Promise<boolean> {
  if (getAccessToken()) return true
  const email = localStorage.getItem(STORAGE.gdriveEmail)
  if (!email) return false
  try {
    await requestGoogleToken({ hint: email, prompt: 'none' })
    return !!getAccessToken()
  } catch {
    return false
  }
}

function applyRemoteMerge(remote: DriveRemotePayload) {
  const result = mergeOrderBuckets({
    localHistory: readHistory(),
    localArchive: readArchive(),
    localTrash: readTrash(),
    localPurged: readPurgedMap(),
    remoteHistory: parseOrderList(remote.history ?? []),
    remoteArchive: parseOrderList(remote.archive ?? []),
    remoteTrash: parseOrderList(remote.kosz ?? []),
    remotePurged: (remote.purged && typeof remote.purged === 'object') ? remote.purged : {},
  })
  writeHistory(result.history)
  writeArchive(result.archive)
  writeTrash(result.trash)
  writePurgedMap(result.purged)
  return result.changed
}

async function pushToDrive() {
  let folderId = localStorage.getItem(STORAGE.gdriveFolderId)
  folderId = await getOrCreateFolderId(folderId)
  localStorage.setItem(STORAGE.gdriveFolderId, folderId)
  const now = new Date()
  const payload = JSON.stringify({
    syncedAt: now.toISOString(),
    version: 2,
    history: readHistory(),
    archive: readArchive(),
    kosz: readTrash(),
    purged: readPurgedMap(),
    state: localStorage.getItem(STORAGE.draft) || '',
  })
  await saveDriveFile(folderId, 'serwis-current.json', payload)
  await saveDriveFile(folderId, 'serwis-' + now.toISOString().slice(0, 10) + '.json', payload)
  localStorage.setItem(STORAGE.gdriveLastSync, now.toISOString())
  localStorage.setItem(STORAGE.lastBackupGdrive, now.toISOString())
}

/** Pełna sync: pobierz → scal → wyślij. Jak stara appka — tylko na żądanie. */
export async function fullDriveSync(): Promise<{ changed: number }> {
  if (!getAccessToken()) {
    const ok = await ensureToken()
    if (!ok) {
      await loginGoogleDrive()
    }
  }
  if (!getAccessToken()) throw new Error('not_logged_in')

  const folderId = localStorage.getItem(STORAGE.gdriveFolderId)
  const remote = await fetchCurrentPayload(folderId)
  let changed = 0
  if (remote) changed = applyRemoteMerge(remote)
  await pushToDrive()
  return { changed }
}

export async function manualDriveSync(): Promise<{ changed: number; neededLogin: boolean }> {
  if (getAccessToken()) {
    return { ...(await fullDriveSync()), neededLogin: false }
  }
  if (localStorage.getItem(STORAGE.gdriveEmail)) {
    const ok = await ensureToken()
    if (ok) return { ...(await fullDriveSync()), neededLogin: false }
    await loginGoogleDrive()
    return { ...(await fullDriveSync()), neededLogin: true }
  }
  await loginGoogleDrive()
  return { changed: 0, neededLogin: true }
}
