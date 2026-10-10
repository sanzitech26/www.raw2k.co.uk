'use client'
import { useEffect, useState } from 'react'

export const left = (ms: number) => {
  if (ms <= 0) return 'Auction ended'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 86400)} Days, ${Math.floor(s / 3600) % 24} Hours, ${Math.floor(s / 60) % 60} Minutes, ${s % 60} Seconds`
}

// ponytail: uses the browser clock; the server re-checks ends_at on every bid, so drift only affects display.
export default function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  return <>{now === null ? '' : left(new Date(endsAt).getTime() - now)}</>
}
