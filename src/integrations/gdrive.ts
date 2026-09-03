/** Ten sam OAuth client co stara appka SERWIS. */
export const GDRIVE_CLIENT_ID =
  '777523829575-8ash0ptk2rhlltjlq7tkpf3burcb2n9t.apps.googleusercontent.com'
export const GDRIVE_SCOPE =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email'
export const GDRIVE_FOLDER = 'Serwis Rowerowy'
export const GDRIVE_CURRENT_FILE = 'serwis-current.json'

export type DriveRemotePayload = {
  syncedAt?: string
  version?: number
  history?: unknown
  archive?: unknown
  kosz?: unknown
  purged?: Record<string, number>
  state?: string
}

type TokenClient = {
  requestAccessToken: (override?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string
            scope: string
            hint?: string
            prompt?: string
            callback: (resp: { access_token?: string; error?: string }) => void
            error_callback?: () => void
          }) => TokenClient
          revoke: (token: string, done: () => void) => void
        }
      }
    }
  }
}

let accessToken: string | null = null
let tokenTimer: ReturnType<typeof setTimeout> | null = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
  if (tokenTimer) clearTimeout(tokenTimer)
  tokenTimer = null
  if (token) {
    tokenTimer = setTimeout(() => {
      accessToken = null
    }, 55 * 60 * 1000)
  }
}

export function waitForGoogle(timeoutMs = 6000): Promise<boolean> {
  if (window.google?.accounts?.oauth2) return Promise.resolve(true)
  return new Promise(resolve => {
    const start = Date.now()
    const t = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(t)
        resolve(true)
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(t)
        resolve(false)
      }
    }, 200)
  })
}

export function requestGoogleToken(opts?: {
  hint?: string
  prompt?: '' | 'none' | 'consent'
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const ok = await waitForGoogle()
    if (!ok || !window.google?.accounts?.oauth2) {
      reject(new Error('gsi_unavailable'))
      return
    }
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GDRIVE_CLIENT_ID,
        scope: GDRIVE_SCOPE,
        hint: opts?.hint,
        prompt: opts?.prompt,
        error_callback: () => reject(new Error('token_error')),
        callback: resp => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error || 'token_error'))
            return
          }
          setAccessToken(resp.access_token)
          resolve(resp.access_token)
        },
      })
      client.requestAccessToken(opts?.prompt === 'none' ? { prompt: 'none' } : undefined)
    } catch (e) {
      reject(e instanceof Error ? e : new Error('token_error'))
    }
  })
}

export async function fetchUserInfo(token: string) {
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + token },
  })
  if (!r.ok) throw new Error('userinfo_' + r.status)
  return r.json() as Promise<{ email?: string; picture?: string }>
}

export function revokeGoogleToken() {
  const t = accessToken
  setAccessToken(null)
  if (t && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(t, () => {})
    } catch { /* ignore */ }
  }
}

async function driveReq(method: string, url: string, body?: string) {
  const token = accessToken
  if (!token) throw new Error('token_expired')
  const opts: RequestInit = {
    method,
    headers: { Authorization: 'Bearer ' + token },
  }
  if (body != null) {
    opts.body = body
    ;(opts.headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  const r = await fetch(url, opts)
  if (r.status === 401) {
    setAccessToken(null)
    throw new Error('token_expired')
  }
  if (!r.ok) throw new Error('drive_' + r.status)
  return r.json() as Promise<{ id?: string; files?: { id: string; modifiedTime?: string }[] }>
}

export async function getOrCreateFolderId(cachedId: string | null): Promise<string> {
  if (cachedId) return cachedId
  const res = await driveReq(
    'GET',
    'https://www.googleapis.com/drive/v3/files?q='
      + encodeURIComponent(
        `name='${GDRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      )
      + '&fields=files(id)',
  )
  if (res.files?.[0]?.id) return res.files[0].id
  const created = await driveReq(
    'POST',
    'https://www.googleapis.com/drive/v3/files',
    JSON.stringify({ name: GDRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
  )
  if (!created.id) throw new Error('folder_create_failed')
  return created.id
}

export async function saveDriveFile(
  folderId: string,
  filename: string,
  body: string | Blob,
  contentType = 'application/json',
) {
  const token = accessToken
  if (!token) throw new Error('token_expired')
  const fileBody = body instanceof Blob ? body : new Blob([body], { type: contentType })
  const q = encodeURIComponent(
    `name='${filename}' and '${folderId}' in parents and trashed=false`,
  )
  const search = await driveReq(
    'GET',
    'https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)',
  )
  const fileId = search.files?.[0]?.id
  if (fileId) {
    const r = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media',
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': contentType },
        body: fileBody,
      },
    )
    if (r.status === 401) {
      setAccessToken(null)
      throw new Error('token_expired')
    }
    if (!r.ok) throw new Error('drive_upload_' + r.status)
    return
  }
  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify({ name: filename, parents: [folderId] })], {
      type: 'application/json',
    }),
  )
  form.append('file', fileBody)
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: form,
  })
  if (r.status === 401) {
    setAccessToken(null)
    throw new Error('token_expired')
  }
  if (!r.ok) throw new Error('drive_create_' + r.status)
}

export async function fetchCurrentPayload(
  folderId: string | null,
): Promise<DriveRemotePayload | null> {
  const token = accessToken
  if (!token) throw new Error('token_expired')
  const q = folderId
    ? encodeURIComponent(
      `name='${GDRIVE_CURRENT_FILE}' and '${folderId}' in parents and trashed=false`,
    )
    : encodeURIComponent(`name='${GDRIVE_CURRENT_FILE}' and trashed=false`)
  const search = await driveReq(
    'GET',
    'https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,modifiedTime)',
  )
  if (!search.files?.[0]?.id) return null
  const fileResp = await fetch(
    'https://www.googleapis.com/drive/v3/files/' + search.files[0].id + '?alt=media',
    { headers: { Authorization: 'Bearer ' + token } },
  )
  if (fileResp.status === 401) {
    setAccessToken(null)
    throw new Error('token_expired')
  }
  if (!fileResp.ok) return null
  return fileResp.json() as Promise<DriveRemotePayload>
}
