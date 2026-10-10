import Link from 'next/link'
import { Suspense } from 'react'
import VehicleCard from './VehicleCard'
import FilterSelect from './FilterSelect'
import LivePrices from './LivePrices'
import { Breadcrumbs } from './Breadcrumbs'
import { listVehicles } from '@/lib/vehicles'
import { q } from '@/lib/db'
import { getSettings } from '@/lib/settings'

type SP = Record<string, string | undefined>
const prices = [['0-100', 'Less than £100'], ['100-200', '£100 - £200'], ['200-300', '£200 - £300'], ['300-500', '£300 - £500'], ['500-750', '£500 - £750'], ['750-1000', '£750 - £1,000'], ['1000-2000', '£1,000 - £2,000'], ['2000-5000', '£2,000 - £5,000'], ['5000-8000', '£5,000 - £8,000'], ['8000-1000000', '£8,000 or more']] as [string, string][]
const miles = [['0', 'Unknown Mileage'], ['1-25000', 'Less than 25,000 miles'], ...[25, 50, 75, 100, 125, 150, 175, 200, 225].map((k) => [`${k * 1000}-${(k + 25) * 1000}`, `${k},000 miles - ${k + 25},000 miles`]), ['250000-5000000', '250,000 miles or more']] as [string, string][]

const distinct = async (col: string) => (await q(`select distinct ${col} v from vehicles where ends_at > now() and ${col} <> '' order by 1`)).map((r) => [r.v, r.v] as [string, string])

export default async function Listing({ title, crumbs = [], fixed = {}, sp, intro }: { title: string; crumbs?: [string, string][]; fixed?: SP; sp: SP; intro?: string }) {
  const { sym } = await getSettings()
  const cur = (l: [string, string][]) => l.map(([v, t]) => [v, t.replaceAll('£', sym)] as [string, string])
  const page = Math.max(1, Number(sp.page) || 1)
  const [{ rows, total, pages }, make, colour, fuel, transmission, location] = await Promise.all([
    listVehicles({ ...sp, ...fixed }, page), distinct('make'), distinct('colour'), distinct('fuel'), distinct('transmission'), distinct('location'),
  ])
  const href = (n: number) => `?${new URLSearchParams({ ...(Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) as SP), page: String(n) })}`
  return (
    <>
      <Breadcrumbs items={[['Vehicle Auctions', '/vehicle-auctions'], ...crumbs]} />
      <div className="container grid-listings row searchresults">
        <div className="col s12 l2 searchoptions" id="searchoptions"><div className="container">
          <div className="controls cf row"><div className="container"><div className="row center-align showmenu"><b className="less-bold white-text">Refine current results</b></div></div></div>
          <div className="searchfilter"><br /><div className="row">
            <form className="col s12" action="" method="get">
              <i className="material-icons left">search</i>
              <input className="control-field search-field form-control prefix filter-field" type="search" name="search" placeholder="Search" defaultValue={sp.search} />
            </form>
            <Suspense>
              <div className="col s12"><FilterSelect name="price" label="Price" options={cur(prices)} /></div>
              <div className="col s12"><FilterSelect name="miles" label="Odometer" options={miles} /></div>
              <div className="col s12"><FilterSelect name="make" label="Make" options={make} /></div>
              <div className="col s12"><FilterSelect name="colour" label="Colour" options={colour} /></div>
              <div className="col s12"><FilterSelect name="fuel" label="Fuel" options={fuel} /></div>
              <div className="col s12"><FilterSelect name="transmission" label="Transmission" options={transmission} /></div>
              <div className="col s12"><FilterSelect name="location" label="Location" options={location} /></div>
              <div className="col s12"><FilterSelect name="drives" label="Drives" options={[['Yes', 'Starts & Drives']]} /></div>
            </Suspense>
          </div></div>
        </div></div>
        <div className="col s12 l10">
          <h1 style={{ fontSize: '2rem' }}>{title}</h1>
          {intro && <p>{intro}</p>}
          <p className="grey-text">{total.toLocaleString('en-GB')} vehicle{total === 1 ? '' : 's'} found</p>
          {pages > 1 && (
            <ul className="pagination center-align">
              {page > 1 && <li className="waves-effect"><Link href={href(page - 1)}><i className="material-icons">chevron_left</i></Link></li>}
              {Array.from({ length: pages }, (_, i) => i + 1).filter((n) => Math.abs(n - page) < 4 || n === 1 || n === pages).map((n) => (
                <li key={n} className={n === page ? 'active' : 'waves-effect'}><Link href={href(n)}>{n}</Link></li>
              ))}
              {page < pages && <li className="waves-effect"><Link href={href(page + 1)}><i className="material-icons">chevron_right</i></Link></li>}
            </ul>
          )}
          <div className="grid row" id="searchlistings">
            {rows.map((v) => <div key={v.lot} className="col listingitem s12"><VehicleCard v={v} horizontal /></div>)}
            {!rows.length && <p className="center-align">No vehicles match your search.</p>}
          </div>
        </div>
      </div>
      <LivePrices />
    </>
  )
}
