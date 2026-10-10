import Link from 'next/link'
import VehicleCard from './VehicleCard'

// CSS-only marquee: cards rendered twice, track slides by half its width. ponytail: no JS, no carousel lib
export default function BrandSlider({ make, rows, dir }: { make: string; rows: any[]; dir: 'ltr' | 'rtl' }) {
  const cards = (k: string) => rows.map((v) => <div key={k + v.lot} className="slide" aria-hidden={k === 'b' || undefined}><VehicleCard v={v} /></div>)
  return (
    <section className="brand-slider">
      <div className="container"><h5 className="grey-text text-darken-2">{make} <Link href={`/vehicle-auctions?make=${encodeURIComponent(make)}`} className="lime-text" style={{ fontSize: '1rem', marginLeft: 12 }}>View all</Link></h5></div>
      <div className="brand-marquee"><div className={`slider-track ${dir}`} style={{ animationDuration: `${rows.length * 8}s` }}>{cards('a')}{cards('b')}</div></div>
    </section>
  )
}
