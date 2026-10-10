import Link from 'next/link'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings, money } from '@/lib/settings'
import { fmtDate } from '@/lib/vehicles'
import { PageHeader } from '@/components/Flash'

export default async function Dashboard() {
  await requireAdmin()
  const [s] = await q(`select count(*)::int total, count(*) filter (where ends_at > now())::int live,
    count(*) filter (where ends_at > now() and ends_at < now() + interval '24 hours')::int soon,
    coalesce(sum(price) filter (where ends_at > now()), 0)::int value,
    coalesce(avg(price) filter (where ends_at > now()), 0)::int avg from vehicles`)
  const [{ posts }] = await q('select count(*)::int posts from news')
  const [{ tests }] = await q('select count(*) filter (where published)::int tests from testimonials')
  const [{ enq, enq7 }] = await q(`select count(*)::int enq, count(*) filter (where created_at > now() - interval '7 days')::int enq7 from enquiries`)
  const ending = await q(`select lot, title, image, price, ends_at from vehicles where ends_at > now() order by ends_at limit 6`)
  const inbox = await q('select id, data, created_at from enquiries order by id desc limit 6')
  const { sym } = await getSettings()
  const stat = (icon: string, label: string, v: string | number, badge: string, note: string) => (
    <div className="stat"><div className="t">{label}<i className="material-icons">{icon}</i></div><div className="v">{v}</div><span className="badge">{badge}<span>{note}</span></span></div>
  )
  return (
    <>
      <PageHeader title="Dashboard" sub="A quick look at your auctions and enquiries.">
        <Link href="/admin/vehicles/new" className="ab p"><i className="material-icons">add</i>Add vehicle</Link>
      </PageHeader>
      <div className="stats">
        {stat('directions_car', 'Total vehicles', s.total, `${s.live} live`, 'right now')}
        {stat('payments', 'Live bid value', money(s.value, sym), `${money(s.avg, sym)} avg`, 'per vehicle')}
        {stat('timer', 'Ending in 24h', s.soon, `${s.soon}`, 'closing soon')}
        {stat('mail', 'Enquiries', enq, `+${enq7}`, 'last 7 days')}
      </div>
      <div className="twocol">
        <div className="card">
          <h2>Ending soon</h2><p className="sub">The next auctions to close.</p>
          <table className="tbl"><thead><tr><th>Vehicle</th><th>Current bid</th><th>Ends</th></tr></thead><tbody>
            {ending.map((v) => (
              <tr key={v.lot}>
                <td><Link className="veh" href={`/admin/vehicles/${v.lot}`}><img src={v.image} alt="" /><span><b>{v.title.trim()}</b><small>Lot {v.lot}</small></span></Link></td>
                <td>{money(v.price, sym)}</td><td>{fmtDate(v.ends_at)}</td>
              </tr>
            ))}
          </tbody></table>
          {!ending.length && <p className="empty">No live auctions. Add a vehicle to get started.</p>}
        </div>
        <div>
          <div className="card">
            <h2>Latest enquiries</h2><p className="sub">From the contact form.</p>
            {inbox.map((e) => (
              <div key={e.id} style={{ padding: '10px 0', borderTop: '1px solid #f1f2f4' }}>
                <b>{[e.data.forename, e.data.surname].filter(Boolean).join(' ') || e.data.email}</b> <span style={{ color: '#6b7280' }}>· {fmtDate(e.created_at).slice(0, 10)}</span>
                <p style={{ color: '#4b5563', marginTop: 2 }}>{String(e.data.message ?? '').slice(0, 110)}</p>
              </div>
            ))}
            {!inbox.length && <p className="empty">No enquiries yet.</p>}
          </div>
          <div className="card">
            <h2>Content</h2><p className="sub">{posts} blog posts · {tests} published testimonials</p>
            <div className="acts"><Link className="ab" href="/admin/blog/new">New post</Link><Link className="ab" href="/admin/testimonials">Testimonials</Link></div>
          </div>
        </div>
      </div>
    </>
  )
}
