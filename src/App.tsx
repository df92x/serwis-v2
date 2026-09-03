import { useEffect } from 'react'
import { AppShell } from './app/AppShell'
import { purgeExpiredKosz } from './data/repo'
import './styles/app.css'

export default function App() {
  useEffect(() => {
    try { purgeExpiredKosz() } catch { /* ignore */ }
  }, [])
  return <AppShell />
}
