import Link from 'next/link'
import { fmtDate } from '@/lib/vehicles'
import { getSettings } from '@/lib/settings'

const Cell = ({ icon, on, children }: any) => <div className="col s3"><i className={`material-icons small ${on ? 'lime-text' : 'grey-text text-darken-1'}`}>{icon}</i>{children}</div>

export default async function VehicleCard({ v, horizontal }: { v: any; horizontal?: boolean }) {
  const { sym } = await getSettings()
  const href = `/vehicle-auctions/${v.slug}`
  return (
    <div className={`card vehicle-card ${horizontal ? 'horizontal' : ''}`}>
      <Link href={href} className="coverlink" />
      <div className="card-image" style={{ backgroundImage: `url('${v.image}')` }}>
        <img src={v.image} className="vehicle-image" alt={v.title} loading="lazy" />
        <span className="card-id">Lot No: <span>{v.lot}</span></span>
        <span className="card-title"><strong>{v.make}</strong><span>{v.model}</span></span>
      </div>
      <div className="card-content">
        <div className="row"><div className="col s12 center-align miles timer-icon-area">
          <i className="material-icons small grey-text text-darken-1" style={{ verticalAlign: 'middle' }}>sell</i> <strong>For Sale</strong>
        </div></div>
        <div className="row" style={{ marginBottom: 0 }}>
          <Cell icon="thumb_up" on={v.starts && v.drives}>{v.starts && v.drives ? 'Starts & Drives' : v.starts ? 'Starts' : 'Non-Runner'}</Cell>
          <Cell icon="vpn_key" on={v.has_keys}>{v.has_keys ? 'Has Keys' : 'No Keys'}</Cell>
          <Cell icon="build">{v.category === 'Not Recorded' ? 'Category N/R' : `Cat ${v.category}`}</Cell>
          <Cell icon="description" on={v.has_v5}>{v.has_v5 ? 'Has V5' : 'No V5'}</Cell>
          <div className="col s12 icon-divider"><br style={{ clear: 'both' }} /><br /></div>
          <Cell icon="network_check">{v.odometer ? `${v.odometer.toLocaleString('en-GB')} miles` : 'Unknown Mileage'}</Cell>
          <Cell icon="swap_vert"><span>{v.transmission}</span></Cell>
          <Cell icon="place">{v.location}</Cell>
          <Cell icon="local_gas_station"><span>{v.fuel}</span></Cell>
        </div>
      </div>
      <div className="card-content grey darken-4 white-text center-align pricearea">
        <div className="row" style={{ marginBottom: 0 }}>
          <div className="col s6"><span><strong>PRICE:<br /><span className="price">{sym}<span className={`change-price-${v.lot}`}>{v.price.toLocaleString('en-GB')}</span></span></strong></span></div>
          <Link className="col s6 viewmore view-details-button white-text waves-effect" href={href}>View Details</Link>
        </div>
      </div>
    </div>
  )
}
