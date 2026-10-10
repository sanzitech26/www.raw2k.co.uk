import Link from 'next/link'
import Flash from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings, money } from '@/lib/settings'
import { fmtDate } from '@/lib/vehicles'
import { deleteVehicle } from '../actions'

export default async function Vehicles({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const { sym } = await getSettings()
  const rows = await q(`select lot, title, price, ends_at, image, ends_at > now() live from vehicles
    where $1 = '' or title ilike '%' || $1 || '%' or lot::text = $1 order by ends_at > now() desc, ends_at limit 100`, [sp.search ?? ''])
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Vehicles</h4><Link className="btn blue-gradient white-text" href="/admin/vehicles/new"><i className="material-icons left">add</i>Add vehicle</Link>
      </div>
      <Flash saved={sp.saved} error={sp.error} />
      <div className="adm-card">
        <form><input name="search" placeholder="Search title or lot number" defaultValue={sp.search} /></form>
        <table className="striped"><thead><tr><th></th><th>Lot</th><th>Vehicle</th><th>Current bid</th><th>Ends</th><th></th></tr></thead><tbody>
          {rows.map((v) => (
            <tr key={v.lot}>
              <td><img src={v.image} alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6 }} /></td>
              <td>{v.lot}</td><td><Link href={`/admin/vehicles/${v.lot}`}>{v.title.trim()}</Link></td><td>{money(v.price, sym)}</td>
              <td>{fmtDate(v.ends_at)} {!v.live && <span className="grey-text">(ended)</span>}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <Link className="btn-flat" href={`/admin/vehicles/${v.lot}`}><i className="material-icons">edit</i></Link>
                <form action={deleteVehicle} style={{ display: 'inline' }}><input type="hidden" name="lot" value={v.lot} />
                  <ConfirmButton className="btn-flat red-text" message={`Delete lot ${v.lot}? This cannot be undone.`}><i className="material-icons">delete</i></ConfirmButton></form>
              </td>
            </tr>
          ))}
        </tbody></table>
        {!rows.length && <p className="grey-text">No vehicles found.</p>}
      </div>
    </>
  )
}
