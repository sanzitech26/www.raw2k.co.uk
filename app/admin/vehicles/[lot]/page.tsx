import Link from 'next/link'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings } from '@/lib/settings'
import { PageHeader } from '@/components/Flash'
import { saveVehicle } from '../../actions'

const F = ({ name, label, v = '', type = 'text', w = 'c4', ...r }: any) => (
  <div className={w}><label className="lb" htmlFor={name}>{label}</label><input className="in" id={name} name={name} type={type} defaultValue={v} {...r} /></div>
)
const C = ({ name, label, on }: { name: string; label: string; on?: boolean }) => (
  <div className="c3 chk"><input type="checkbox" id={name} name={name} defaultChecked={on} /><label htmlFor={name}>{label}</label></div>
)
const T = ({ name, label, v = '', w = 'c6', rows = 4 }: any) => (
  <div className={w}><label className="lb" htmlFor={name}>{label}</label><textarea className="in" id={name} name={name} defaultValue={v} rows={rows} /></div>
)

export default async function EditVehicle({ params }: { params: Promise<{ lot: string }> }) {
  await requireAdmin()
  const { lot } = await params
  const isNew = lot === 'new'
  const { sym, currency } = await getSettings()
  const [v] = isNew ? [null] : await q(`select *, to_char(ends_at at time zone 'Europe/London', 'YYYY-MM-DD"T"HH24:MI') ends_local from vehicles where lot = $1`, [Number(lot)])
  if (!isNew && !v) notFound()
  const d = v?.detail ?? {}
  const soon = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 16)
  return (
    <form action={saveVehicle}>
      <PageHeader title={isNew ? 'Add vehicle' : `Edit lot ${v.lot}`} sub={isNew ? 'Fill in the details exactly as buyers should see them.' : v.title.trim()}>
        <Link href="/admin/vehicles" className="ab">Cancel</Link>
        <button className="ab p" type="submit"><i className="material-icons">check</i>Save vehicle</button>
      </PageHeader>
      <input type="hidden" name="lot" value={isNew ? '' : v.lot} />
      <div className="card"><h2>Vehicle</h2><p className="sub">What it is.</p><div className="g">
        <F w="c12" name="title" label="Title (e.g. 2017 AUDI Q2 TDI QUATTRO S LINE 1,968cc)" v={v?.title?.trim()} required />
        <F name="make" label="Make" v={v?.make} /><F name="model" label="Model" v={v?.model} /><F name="type" label="Body type (Hatchback, Estate, Motorcycle...)" v={v?.type} />
        <F name="colour" label="Colour" v={v?.colour} /><F name="fuel" label="Fuel" v={v?.fuel} /><F name="transmission" label="Transmission" v={v?.transmission} />
        <F name="odometer" label="Mileage (0 = unknown)" type="number" v={v?.odometer ?? 0} /><F name="category" label="ABI category (N, S, Not Recorded...)" v={v?.category ?? 'Not Recorded'} />
        <div className="checks"><C name="starts" label="Starts" on={v?.starts ?? true} /><C name="drives" label="Drives" on={v?.drives ?? true} /><C name="has_keys" label="Has keys" on={v?.has_keys} /><C name="has_v5" label="Has V5" on={v?.has_v5} />
        <C name="featured" label="Featured (top picks)" on={v?.featured} /></div>
      </div></div>
      <div className="card"><h2>Auction</h2><p className="sub">Prices are in {currency} ({sym}).</p><div className="g">
        <F w="c3" name="opening" label="Opening price" type="number" min="0" v={v?.opening ?? ''} required /><F w="c3" name="price" label="Current bid (blank = opening)" type="number" min="0" v={v?.price ?? ''} />
        <F w="c3" name="increment" label="Price increment" type="number" min="1" v={v?.increment ?? 10} /><F w="c3" name="ends_at" label="Auction ends (UK time)" type="datetime-local" v={v?.ends_local ?? soon} required />
      </div></div>
      <div className="card"><h2>Location &amp; storage</h2><p className="sub">Where the vehicle is held.</p><div className="g">
        <F name="location" label="Town shown on cards" v={v?.location} /><F name="area" label="Region (e.g. North West)" v={d.area} /><F name="town" label="Town (detail page)" v={d.town} />
        <F w="c6" name="stored" label="Stored at (yard name / postcode)" v={d.stored} /><F w="c3" name="vat" label="VAT status" v={d.vat} /><F w="c3" name="fsh" label="Service history" v={d.fsh} />
      </div></div>
      <div className="card"><h2>Photos</h2><p className="sub">Paste image links, one per line. The first is the main photo.</p><div className="g">
        <T w="c12" name="images" label="Image URLs" v={(v?.images ?? []).join('\n')} rows={5} />
      </div><p className="hint">File upload needs a storage key. Tell me which provider you want.</p></div>
      <div className="card"><h2>Descriptions</h2><p className="sub">Shown on the vehicle page.</p><div className="g">
        <T name="damage" label="Damage report" v={d.damage} /><T name="extra" label="Extra information" v={d.extra} />
        <T name="viewing" label="Viewing" v={d.viewing} /><T name="delivery" label="Delivery" v={d.delivery} /><T w="c12" name="premium" label="Buyer premium / fees text" v={d.premium} rows={3} />
      </div></div>
      <div className="savebar"><Link href="/admin/vehicles" className="ab">Cancel</Link><button className="ab p" type="submit"><i className="material-icons">check</i>Save vehicle</button></div>
    </form>
  )
}
