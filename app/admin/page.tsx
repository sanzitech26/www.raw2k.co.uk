import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { getSettings, money } from '@/lib/settings'
import { fmtDate } from '@/lib/vehicles'

export default async function Dashboard() {
  await requireAdmin()
  const [{ live, total, value }] = await q('select count(*) filter (where ends_at > now())::int live, count(*)::int total, coalesce(sum(price) filter (where ends_at > now()),0)::int value from vehicles')
  const [{ t }] = await q('select count(*)::int t from testimonials')
  const [{ p }] = await q('select count(*)::int p from news')
  const enq = await q('select id, data, created_at from enquiries order by id desc limit 15')
  const { sym } = await getSettings()
  const stat = (icon: string, label: string, v: string | number) => (
    <div className="col s6 m3"><div className="adm-card center-align"><i className="material-icons lime-text medium">{icon}</i><h4 style={{ margin: '4px 0' }}>{v}</h4><span className="grey-text">{label}</span></div></div>
  )
  return (
    <>
      <h4>Dashboard</h4>
      <div className="row">{stat('directions_car', 'Live auctions', live)}{stat('inventory_2', 'Total vehicles', total)}{stat('payments', 'Live bid value', money(value, sym))}{stat('article', `Posts · ${t} testimonials`, p)}</div>
      <div className="adm-card">
        <h5>Latest enquiries</h5>
        {!enq.length ? <p className="grey-text">No enquiries yet. Messages sent through the contact form appear here.</p> : (
          <table className="striped"><thead><tr><th>Received</th><th>From</th><th>Subject</th><th>Message</th></tr></thead><tbody>
            {enq.map((e) => (
              <tr key={e.id}><td>{fmtDate(e.created_at)}</td><td>{[e.data.forename, e.data.surname].filter(Boolean).join(' ')}<br /><a href={`mailto:${e.data.email}`}>{e.data.email}</a>{e.data.tel && <><br />{e.data.tel}</>}</td><td>{e.data.subject}</td><td style={{ whiteSpace: 'pre-line' }}>{e.data.message}</td></tr>
            ))}
          </tbody></table>
        )}
      </div>
    </>
  )
}
