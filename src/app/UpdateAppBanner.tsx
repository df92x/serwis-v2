import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateAppBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => { void registration.update() }, 60 * 60 * 1000)
      }
    },
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!needRefresh) setBusy(false)
  }, [needRefresh])

  if (!needRefresh) return null

  return (
    <div className="update-banner">
      <span>Dostępna aktualizacja</span>
      <button
        type="button"
        className="ok"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          void updateServiceWorker(true)
        }}
      >
        Update App
      </button>
      <button type="button" onClick={() => setNeedRefresh(false)}>Później</button>
    </div>
  )
}
