import Link from 'next/link'
import { notFound } from 'next/navigation'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { fmtDate } from '@/lib/vehicles'
import { deleteEnquiry, setEnquiryRead } from '../../actions'

export default async function Enquiry({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const id = Number((await params).id)
  const [e] = Number.isInteger(id) ? await q('update enquiries set read = true where id = $1 returning id, data, created_at', [id]) : []
  if (!e) notFound()
  const d = e.data || {}
  const name = [d.forename, d.surname].filter(Boolean).join(' ') || 'Unknown sender'
  const subject = d.subject ? `Re: ${d.subject}` : 'Your RAW2K enquiry'
  const row = (label: string, v?: string, href?: string) => v ? (
    <div style={{ marginBottom: 14 }}><div className="hint" style={{ margin: 0 }}>{label}</div>{href ? <a href={href} style={{ color: '#059669', fontWeight: 600 }}>{v}</a> : <div>{v}</div>}</div>
  ) : null
  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/admin/enquiries" className="ab" style={{ marginBottom: 16 }}><i className="material-icons">arrow_back</i>All enquiries</Link>
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 20 }}>{d.subject || 'Enquiry'}</h2>
        <p className="sub">{name} · {fmtDate(e.created_at).slice(0, 16)}</p>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15 }}>{d.message}</p>
        <hr style={{ border: 0, borderTop: '1px solid #f1f2f4', margin: '22px 0' }} />
        {row('Email', d.email, `mailto:${d.email}?subject=${encodeURIComponent(subject)}`)}
        {row('Phone', d.tel, d.tel ? `tel:${d.tel}` : undefined)}
        <div className="acts" style={{ marginTop: 8 }}>
          <a className="ab p" href={`mailto:${d.email}?subject=${encodeURIComponent(subject)}`}><i className="material-icons">reply</i>Reply by email</a>
          <form action={setEnquiryRead}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="read" value="0" /><button className="ab" type="submit">Mark unread</button></form>
          <form action={deleteEnquiry}><input type="hidden" name="id" value={e.id} /><ConfirmButton className="ab d" message="Delete this enquiry?"><i className="material-icons">delete</i>Delete</ConfirmButton></form>
        </div>
      </div>
    </div>
  )
}
