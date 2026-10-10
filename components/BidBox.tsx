'use client'
import { useEffect, useState } from 'react'
import Countdown from './Countdown'

type S = { price: number; ends_at: string; bids: number; increment: number }

export default function BidBox({ lot, init, sym }: { lot: number; init: S; sym: string }) {
  const [s, setS] = useState(init)
  const ended = new Date(s.ends_at).getTime() <= Date.now()

  useEffect(() => {
    const t = setInterval(async () => { if (!document.hidden) { const r = await fetch(`/api/vehicles/${lot}`).catch(() => null); if (r?.ok) setS(await r.json()) } }, 3000)
    return () => clearInterval(t)
  }, [lot])

  return (
    <>
      <div className="row"><div className="col s12 center-align grey darken-3">
        <h5 className="white-text">Current Bid:</h5>
        <h4 className="lime-text"><span className="currentprice bold">{sym}<span className="changeprice bold">{s.price.toLocaleString('en-GB')}</span></span></h4>
      </div></div>
      {ended && <div className="row"><div className="col s12 center-align"><h5 className="white-text">This auction has ended</h5></div></div>}
    </>
  )
}
