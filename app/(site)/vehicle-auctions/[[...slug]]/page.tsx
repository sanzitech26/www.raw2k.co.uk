import BuyEnquiry from '@/components/BuyEnquiry'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Listing from '@/components/Listing'
import BidBox from '@/components/BidBox'
import Countdown from '@/components/Countdown'
import LivePrices from '@/components/LivePrices'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { q } from '@/lib/db'
import { cap } from '@/lib/nav'
import { fmtDate } from '@/lib/vehicles'
import { getSettings, money } from '@/lib/settings'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug?: string[] }>; searchParams: Promise<Record<string, string | undefined>> }
const unslug = (s: string) => s.split('-').map(cap).join(' ')
const FILTERS: Record<string, string> = { make: 'make', area: 'area', day: 'day', agent: 'agent' }

const byLot = async (slug: string) => (await q('select v.*, (select count(*)::int from bids b where b.lot = v.lot) bids from vehicles v where slug = $1', [slug]))[0]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [a, b] = (await params).slug ?? []
  if (a && !b && !(a in FILTERS) && a !== 'featured') { const v = await byLot(a); return v ? { title: v.title.trim(), description: `${v.title.trim()}, ${v.colour}. Lot ${v.lot} at RAW2K online vehicle auctions.`, openGraph: { images: [v.image] } } : {} }
  return { title: a === 'featured' ? 'Featured Auctions' : b ? `${unslug(b)} Auctions` : 'Vehicle Auctions' }
}

export default async function Page({ params, searchParams }: Props) {
  const [a, b] = (await params).slug ?? []
  const sp = await searchParams
  if (!a) return <Listing title="Vehicle Auctions" sp={sp} />
  if (a === 'featured') return <Listing title="Featured Auctions" fixed={{ featured: '1' }} crumbs={[['Featured', '/vehicle-auctions/featured']]} sp={sp} />
  if (a in FILTERS) {
    if (!b) notFound()
    const label = a === 'make' ? `${unslug(b)} Auctions` : a === 'area' ? `${unslug(b)} Auctions` : a === 'day' ? `Auctions ending ${cap(b)}` : `Auctions from ${unslug(b.replace(/-\d+$/, ''))}`
    return <Listing title={label} fixed={a === 'make' ? { make: b.replaceAll('-', ' ') } : { [FILTERS[a]]: b }} crumbs={[[label, `/vehicle-auctions/${a}/${b}`]]} sp={sp} />
  }

  const v = await byLot(a)
  if (!v) notFound()
  const d = v.detail || {}
  const { sym } = await getSettings()
  const imgs: string[] = v.images?.length ? v.images : [v.image]
  const extra = imgs.length - 5
  const reg = /^(?:19|20)(\d\d)\b/.exec(v.title.trim())?.[1] ?? 'UNKNOWN'
  const bodyType = v.type
  const ends = new Date(v.ends_at).toISOString()
  const cell = (icon: string, text: string, on = false, help?: string) => (
    <div className="col s3 cell" title={help}>
      <i className={`material-icons small ${on ? 'lime-text' : 'grey-text text-darken-1'}`}>{icon}</i>
      {help && <i className="material-icons tooltip-icon">help_outline</i>}
      {text}
    </div>
  )
  const tile = (u: string, i: number) => (
    <div key={u} className="col s6 imagehold vehicle-image-wrapper" style={{ backgroundImage: `url('${u}')` }}>
      <a href={u} target="_blank"><img src={u} className="vehicle-image" alt={v.title} loading="lazy" />{i === 3 && extra > 0 && <div className="thumb-count-overlay">+{extra}</div>}</a>
    </div>
  )
  const card = { background: '#fff', padding: '14px 10px', borderRadius: 20, boxShadow: '0 5px 14px rgba(0,0,0,.15)' }
  return (
    <>
      <Breadcrumbs items={[['Vehicle Auctions', '/vehicle-auctions'], [v.title.trim(), `/vehicle-auctions/${v.slug}`]]} />
      <div className="container"><div className="container listing">
        <div className="row" style={{ marginBottom: 0 }}><br />
          <Link href="/vehicle-auctions" className="btn grey lighten-3 grey-text text-darken-2 left" style={{ fontSize: '80%', marginBottom: '1em' }}>Go Back <i className="material-icons left">navigate_before</i></Link>
        </div>
        <div className="row titlearea">
          <div className="col s8" style={{ margin: '2.1rem 0 1.68rem 0' }}>
            <h1 style={{ fontSize: '230%', margin: '0 0 15px 0', fontWeight: 'bold' }}>{v.title.trim()}</h1>
            <h2 style={{ fontSize: '160%', fontWeight: 300, margin: 0 }} className="grey-text text-darken-1">Lot No: <span className="lime-text bold">{v.lot}</span></h2>
          </div>
          <div className="col s4 right-align" style={{ margin: '2.1rem 0 1.68rem 0', fontSize: '100%' }}>
            <span style={{ fontWeight: 'bold' }}>AUCTION ENDS IN:<br /><br /><span className="grey-text text-darken-1 timeleft" style={{ fontSize: '130%' }}><Countdown endsAt={ends} /></span></span>
          </div>
        </div>
        <div className="row images">
          <div className="col s12 m7 l7 maincolumn">
            <div className="row center-align imageflex" style={card}>
              <div className="col s12 m6 main vehicle-image-wrapper" style={{ backgroundImage: `url('${imgs[0]}')` }}>
                <a href={imgs[0]} target="_blank"><img src={imgs[0]} className="vehicle-image" alt={v.title} /></a>
              </div>
              <div className="col s12 m6">
                <div className="row imageflex" style={{ marginBottom: 5 }}>{imgs.slice(1, 3).map((u, i) => tile(u, i))}</div>
                <div className="row imageflex" style={{ marginBottom: 0 }}>{imgs.slice(3, 5).map((u, i) => tile(u, i + 2))}</div>
                {imgs.slice(5).map((u) => <a key={u} href={u} target="_blank" />)}
              </div>
            </div>
            <div className="row"><div className="col s12 center"><span style={{ fontWeight: 500, letterSpacing: 3 }}>PLEASE NOTE VEHICLES CAN NOT BE DRIVEN FROM SITE</span></div></div>

            <div className="row" style={card}>
              <div className="col s12">
                <h5>Key facts about this <span className="bold">{bodyType}</span>:</h5><br />
                <div className="row center-align" style={{ marginBottom: 0 }}>
                  <div className="col s12 center-align miles"><i className="material-icons small grey-text text-darken-1">timer</i> <strong>Ends:</strong> <span className="timeleft"><Countdown endsAt={ends} /></span></div>
                  <div className="col s12"><br /></div>
                  <div className="col s12"><div className="row grid" style={{ marginBottom: 0 }}>
                    {cell('format_paint', v.colour)}
                    {cell('local_gas_station', v.fuel)}
                    {cell('swap_vert', v.transmission)}
                    {cell('font_download', `Reg: ${reg}`)}
                    {cell('thumb_up', v.starts && v.drives ? 'Starts & Drives' : v.starts ? 'Starts' : 'Non-Runner', v.starts && v.drives, 'The vehicle was tested on arrival only to the degree that it moved under its own power a short distance. It is not necessarily safe to drive.')}
                    {cell('build', v.category === 'Not Recorded' ? 'ABI Category Not Recorded' : `ABI Category ${v.category}`)}
                    {cell('description', v.has_v5 ? 'Log Book (V5)' : 'No Log Book (V5)', v.has_v5, v.has_v5 ? undefined : 'At the time of listing V5 not available, this may become available at a later date.')}
                    {cell('description', d.fsh || 'No FSH')}
                    {cell('vpn_key', v.has_keys ? 'Has Keys' : 'No Keys', v.has_keys)}
                    {cell('account_balance', d.vat || 'Not Vat Applicable')}
                    {cell('place', [d.area, d.town].filter(Boolean).join(' / ') || v.location)}
                    {d.stored && cell('home', `Stored at ${d.stored.replace(/^Stored at\s*/i, '')}`)}
                    {cell('network_check', v.odometer ? `Indicated Mileage: ${v.odometer.toLocaleString('en-GB')}` : 'Indicated Mileage: Unknown', false, 'Trade Descriptions Act 1968 - The recorded mileage has not been verified. The accuracy of this reading cannot be relied upon and should be disregarded.')}
                  </div></div>
                </div>
              </div>
              <div className="col s12"><div className="row">
                <div className="col s12 m6"><h5>Viewing:</h5><p>{d.viewing || 'Vehicles can be viewed on the day of collection only.'}</p></div>
                <div className="col s12 m6"><h5>Delivery:</h5><p>{d.delivery || 'We do not currently offer a delivery service, the buyer must arrange their own collection, please note vehicles may not be driven off site.'}</p></div>
              </div></div>
              {(d.extra || d.damage) && <div className="col s12"><div className="row">
                {d.extra && <div className="col s12 m6"><h5>Extra information:</h5><p>{d.extra}</p></div>}
                {d.damage && <div className="col s12 m6"><h5>Damage report:</h5><p style={{ whiteSpace: 'pre-line' }}>{d.damage}</p></div>}
              </div></div>}
              <br />
            </div>

            <div className="row" style={card}><div className="col s12 center-align"><p>
              <strong>All images and descriptions are only an indication of damage.</strong><br /><br />
              <strong>The category of a vehicle is checked when processed to auction and may be subject to change. RAW2K are not liable for these changes and you must do your own checks to ensure you are satisfied with the vehicle. For more information regarding ABI category changes please read our <Link href="/help/faqs">top questions</Link>.</strong><br /><br />
              <strong>Electric bikes, Scooters, Surrons and off-road motorcycles are not legally permitted for use on public roads, footpaths or cycleways unless appropriate insurance has been obtained. The vehicles may only be used on private land with the express permission of the landowner.</strong>
            </p></div></div>
          </div>

          <div className="col s12 m4 l4 offset-m1 offset-l1 maincolumn">
            <div className="row pullout-area"><div className="col s12">
              <BidBox sym={sym} lot={v.lot} init={{ price: v.price, ends_at: ends, bids: v.bids, increment: v.increment }} />
              <div className="row"><div className="col s12 center-align">
                <i className="material-icons medium white-text">account_circle</i>
                <h5 className="white-text center-align">Want this vehicle?<br />Register your interest</h5>
                <div className="row"><BuyEnquiry lot={v.lot} /></div>
                <p className="lime-text">{d.premium || 'This vehicle has a buyers premium of 6% of the winning bid + £22.5 + VAT. A Vehicle Release Fee of £25 + VAT will be charged which will include the loading of the vehicle if it is required.'}</p>
              </div></div>
              <div className="row">
                <div className="col s12 l6"><p className="white-text">Auction Began:<br />{fmtDate(v.started_at)}</p></div>
                <div className="col s12 l6"><p className="white-text">Auction Ends:<br />{fmtDate(v.ends_at)}</p></div>
                <div className="col s12 l6"><p className="white-text">Opening Price: {money(v.opening, sym)}</p></div>
                <div className="col s12 l6"><p className="white-text">Price Increment: {money(v.increment, sym)}</p></div>
                <div className="col s12"><p className="white-text">Payment Info: <Link className="white-text" href="/help/terms">Standard methods</Link></p></div>
              </div>
            </div></div>
            <div className="row carvertical-banner"><div className="col s12">
              <img src="/images/carvertical-logo.svg" alt="carVertical" />
              <a href="https://www.carvertical.com/" target="_blank" rel="noopener noreferrer">Get complete history report (-20% OFF)</a>
            </div></div>
            <div className="row pullout-area info"><div className="row">
              <div className="col s12 center-align"><i className="material-icons medium white-text">help</i>
                <h5 className="white-text center-align">Need some help?<br />Get in touch</h5>
                <p className="center-align white-text">Simply quote the lot number: {v.lot} if on the phone, or alternatively use the help options below.<br /><br /></p>
              </div><br />
              <div className="col s12"><div className="container"><div className="col s12">
                <div className="row"><div className="col s12"><Link className="btn btn-large waves-effect waves-dark white blue-text text-darken-1" href={`/help/contact/${v.lot}`}>Email Us<i className="material-icons left">email</i></Link></div></div>
                <div className="row"><div className="col s12"><Link className="btn btn-large waves-effect waves-dark white blue-text text-darken-1" href="/help">View Help<i className="material-icons left">help</i></Link></div></div>
              </div></div></div>
            </div></div>
          </div>
        </div>
      </div></div>
      <LivePrices />
    </>
  )
}
