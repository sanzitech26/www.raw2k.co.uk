import Link from 'next/link'
import Flash, { PageHeader } from '@/components/Flash'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { fmtDate } from '@/lib/vehicles'

const PER = 15

export default async function Enquiries({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const unreadOnly = sp.show === 'unread'
  const page = Math.max(1, Number(sp.page) || 1)
  const where = unreadOnly ? 'where not coalesce(read, false)' : ''
  const [{ all, unread }] = await q('select count(*)::int all, count(*) filter (where not coalesce(read, false))::int unread from enquiries')
  const rows = await q(`select id, data, created_at, coalesce(read, false) read from enquiries ${where} order by id desc limit ${PER} offset ${(page - 1) * PER}`)
  const total = unreadOnly ? unread : all
  const pages = Math.max(1, Math.ceil(total / PER))
  const tab = (label: string, href: string, on: boolean) => <Link href={href} className={`ab${on ? ' p' : ''}`}>{label}</Link>
  return (
    <>
      <PageHeader title="Enquiries" sub="Messages sent through the contact form." />
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card">
        <div className="tools">
          {tab(`All (${all})`, '/admin/enquiries', !unreadOnly)}
          {tab(`Unread (${unread})`, '/admin/enquiries?show=unread', unreadOnly)}
        </div>
        <table className="tbl"><thead><tr><th></th><th>From</th><th>Subject</th><th>Message</th><th>Received</th></tr></thead><tbody>
          {rows.map((e) => {
            const d = e.data || {}
            return (
              <tr key={e.id} style={{ fontWeight: e.read ? 400 : 600 }}>
                <td style={{ width: 24 }}>{!e.read && <span style={{ display: 'block', width: 9, height: 9, borderRadius: '50%', background: '#10b981' }} title="Unread" />}</td>
                <td><Link href={`/admin/enquiries/${e.id}`}>{[d.forename, d.surname].filter(Boolean).join(' ') || d.email}<small style={{ display: 'block', color: '#6b7280', fontWeight: 400 }}>{d.email}</small></Link></td>
                <td>{d.subject || '—'}</td>
                <td style={{ color: '#4b5563', fontWeight: 400, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(d.message ?? '')}</td>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 400 }}>{fmtDate(e.created_at).slice(0, 16)}</td>
              </tr>
            )
          })}
        </tbody></table>
        {!rows.length && <p className="empty">{unreadOnly ? 'No unread enquiries.' : 'No enquiries yet.'}</p>}
        {pages > 1 && (
          <div className="pager">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => p === page
              ? <span key={p} className="cur">{p}</span>
              : <Link key={p} href={`?${new URLSearchParams({ ...(unreadOnly ? { show: 'unread' } : {}), page: String(p) })}`}>{p}</Link>)}
          </div>
        )}
      </div>
    </>
  )
}
