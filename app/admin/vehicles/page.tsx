import Link from 'next/link'
import Flash, { PageHeader } from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings, money } from '@/lib/settings'
import { fmtDate } from '@/lib/vehicles'
import { deleteVehicle } from '../actions'

const PER = 12

export default async function Vehicles({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const { sym } = await getSettings()
  const page = Math.max(1, Number(sp.page) || 1)
  const [search, status, make] = [sp.search ?? '', sp.status ?? '', sp.make ?? '']
  const where = `($1 = '' or title ilike '%' || $1 || '%' or lot::text = $1)
    and ($2 = '' or ($2 = 'live' and ends_at > now()) or ($2 = 'ended' and ends_at <= now())) and ($3 = '' or make = $3)`
  const [{ n }] = await q(`select count(*)::int n from vehicles where ${where}`, [search, status, make])
  const rows = await q(`select lot, title, make, price, ends_at, image, ends_at > now() live from vehicles where ${where}
    order by ends_at > now() desc, ends_at limit ${PER} offset ${(page - 1) * PER}`, [search, status, make])
  const makes = (await q("select distinct make from vehicles where make <> '' order by 1")).map((r) => r.make as string)
  const pages = Math.max(1, Math.ceil(n / PER))
  const href = (p: number) => `?${new URLSearchParams(Object.fromEntries(Object.entries({ search, status, make, page: String(p) }).filter(([, v]) => v)))}`
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
  return (
    <>
      <PageHeader title="Vehicles" sub="Add, edit and remove the cars listed for auction.">
        <a className="ab" href="/admin/vehicles/export"><i className="material-icons">download</i>Export</a>
        <Link className="ab p" href="/admin/vehicles/new"><i className="material-icons">add</i>Add vehicle</Link>
      </PageHeader>
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card">
        <h2>All vehicles <span style={{ color: '#6b7280', fontWeight: 500 }}>({n})</span></h2>
        <form className="tools" style={{ marginTop: 14 }}>
          <input className="in grow" name="search" placeholder="Search title or lot number" defaultValue={search} />
          <select className="in sel" name="status" defaultValue={status}><option value="">All status</option><option value="live">Live</option><option value="ended">Ended</option></select>
          <select className="in sel" name="make" defaultValue={make}><option value="">All makes</option>{makes.map((m) => <option key={m}>{m}</option>)}</select>
          <button className="ab" type="submit"><i className="material-icons">filter_list</i>Filter</button>
          {(search || status || make) && <Link className="ab" href="/admin/vehicles">Clear</Link>}
        </form>
        <table className="tbl"><thead><tr><th>Vehicle</th><th>Lot</th><th>Make</th><th>Current bid</th><th>Ends</th><th>Status</th><th></th></tr></thead><tbody>
          {rows.map((v) => (
            <tr key={v.lot}>
              <td><Link className="veh" href={`/admin/vehicles/${v.lot}`}><img src={v.image} alt="" /><b>{v.title.trim()}</b></Link></td>
              <td>{v.lot}</td><td>{v.make}</td><td>{money(v.price, sym)}</td><td>{fmtDate(v.ends_at)}</td>
              <td><span className={`pill ${v.live ? 'ok' : 'off'}`}>{v.live ? 'Live' : 'Ended'}</span></td>
              <td><div className="rowacts">
                <Link className="ab ic" href={`/admin/vehicles/${v.lot}`} title="Edit"><i className="material-icons">edit</i></Link>
                <form action={deleteVehicle}><input type="hidden" name="lot" value={v.lot} />
                  <ConfirmButton className="ab ic d" message={`Delete lot ${v.lot}? This cannot be undone.`}><i className="material-icons">delete</i></ConfirmButton></form>
              </div></td>
            </tr>
          ))}
        </tbody></table>
        {!rows.length && <p className="empty">No vehicles found.</p>}
        {pages > 1 && (
          <div className="pager">
            {page > 1 && <Link href={href(page - 1)}><i className="material-icons">chevron_left</i></Link>}
            {nums.map((p, i) => <span key={p} style={{ display: 'contents' }}>{i > 0 && p - nums[i - 1] > 1 && <span className="gap">…</span>}{p === page ? <span className="cur">{p}</span> : <Link href={href(p)}>{p}</Link>}</span>)}
            {page < pages && <Link href={href(page + 1)}><i className="material-icons">chevron_right</i></Link>}
          </div>
        )}
      </div>
    </>
  )
}
