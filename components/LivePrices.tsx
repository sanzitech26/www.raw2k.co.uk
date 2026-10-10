'use client'
import { useEffect } from 'react'

// Polls current prices for every .change-price-<lot> on the page.
// ponytail: polling replaces the original's Socket.IO; swap to Ably/Pusher if sub-second updates matter.
export default function LivePrices({ every = 5000 }: { every?: number }) {
  useEffect(() => {
    const tick = async () => {
      const els = [...document.querySelectorAll<HTMLElement>('[class*="change-price-"]')]
      const lots = [...new Set(els.map((e) => /change-price-(\d+)/.exec(e.className)?.[1]).filter(Boolean))]
      if (!lots.length || document.hidden) return
      const r: Record<string, number> = await (await fetch(`/api/prices?lots=${lots.join(',')}`)).json().catch(() => ({}))
      els.forEach((e) => { const p = r[/change-price-(\d+)/.exec(e.className)![1]]; if (p != null) e.textContent = p.toLocaleString('en-GB') })
    }
    const t = setInterval(tick, every)
    return () => clearInterval(t)
  }, [every])
  return null
}
