import Link from 'next/link'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings } from '@/lib/settings'
import { saveVehicle } from '../../actions'

const F = ({ name, label, v = '', type = 'text', w = 's12 m6 l4', ...r }: any) => (
  <div className={`col ${w}`}><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={v} {...r} /></div>
)
const C = ({ name, label, on }: { name: string; label: string; on?: boolean }) => (
  <div className="col s6 m3"><p><input type="checkbox" className="filled-in" id={name} name={name} defaultChecked={on} /><label htmlFor={name} style={{ display: 'inline-block', paddingLeft: 28 }}>{label}</label></p></div>
)
const T = ({ name, label, v = '', w = 's12 m6' }: any) => <div className={`col ${w}`}><label htmlFor={name}>{label}</label><textarea id={name} name={name} defaultValue={v} /></div>

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
    <>
      <Link href="/admin/vehicles" className="btn grey lighten-3 grey-text text-darken-2"><i className="material-icons left">navigate_before</i>Back</Link>
      <h4>{isNew ? 'Add vehicle' : `Edit lot ${v.lot}`}</h4>
      <form action={saveVehicle}>
        <input type="hidden" name="lot" value={isNew ? '' : v.lot} />
        <div className="adm-card"><h5>Vehicle</h5><div className="row">
          <F w="s12" name="title" label="Title (e.g. 2017 AUDI Q2 TDI QUATTRO S LINE 1,968cc)" v={v?.title?.trim()} required />
          <F name="make" label="Make" v={v?.make} /><F name="model" label="Model" v={v?.model} /><F name="type" label="Body type (Hatchback, Estate, Motorcycle...)" v={v?.type} />
          <F name="colour" label="Colour" v={v?.colour} /><F name="fuel" label="Fuel" v={v?.fuel} /><F name="transmission" label="Transmission" v={v?.transmission} />
          <F name="odometer" label="Mileage (0 = unknown)" type="number" v={v?.odometer ?? 0} /><F name="category" label="ABI category (N, S, Not Recorded...)" v={v?.category ?? 'Not Recorded'} />
          <C name="starts" label="Starts" on={v?.starts ?? true} /><C name="drives" label="Drives" on={v?.drives ?? true} /><C name="has_keys" label="Has keys" on={v?.has_keys} /><C name="has_v5" label="Has V5" on={v?.has_v5} />
          <C name="featured" label="Featured (top picks)" on={v?.featured} />
        </div></div>
        <div className="adm-card"><h5>Auction ({sym} {currency})</h5><div className="row">
          <F name="opening" label="Opening price" type="number" min="0" v={v?.opening ?? ''} required /><F name="price" label="Current bid (blank = opening price)" type="number" min="0" v={v?.price ?? ''} />
          <F name="increment" label="Price increment" type="number" min="1" v={v?.increment ?? 10} /><F name="ends_at" label="Auction ends (UK time)" type="datetime-local" v={v?.ends_local ?? soon} required />
        </div></div>
        <div className="adm-card"><h5>Location &amp; storage</h5><div className="row">
          <F name="location" label="Town shown on cards" v={v?.location} /><F name="area" label="Region (e.g. North West)" v={d.area} /><F name="town" label="Town (detail page)" v={d.town} />
          <F w="s12 m6" name="stored" label="Stored at (yard name / postcode)" v={d.stored} /><F w="s12 m3" name="vat" label="VAT status" v={d.vat} /><F w="s12 m3" name="fsh" label="Service history" v={d.fsh} />
        </div></div>
        <div className="adm-card"><h5>Photos</h5><div className="row">
          <T w="s12" name="images" label="Image URLs, one per line (first is the main photo)" v={(v?.images ?? []).join('\n')} />
        </div><p className="grey-text">Paste links to hosted images. File upload needs a storage key, so tell me which provider you want.</p></div>
        <div className="adm-card"><h5>Descriptions</h5><div className="row">
          <T name="damage" label="Damage report" v={d.damage} /><T name="extra" label="Extra information" v={d.extra} />
          <T name="viewing" label="Viewing" v={d.viewing} /><T name="delivery" label="Delivery" v={d.delivery} /><T w="s12" name="premium" label="Buyer premium / fees text" v={d.premium} />
        </div></div>
        <button className="btn btn-large blue-gradient white-text" type="submit">Save vehicle</button>
      </form><br />
    </>
  )
}
