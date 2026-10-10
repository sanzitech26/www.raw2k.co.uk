import Flash, { PageHeader } from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { saveTestimonial, deleteTestimonial } from '../actions'

function Form({ t }: { t?: any }) {
  const pid = `p${t?.id ?? 'n'}`
  return (
    <form action={saveTestimonial}>
      <input type="hidden" name="id" value={t?.id ?? ''} />
      <div className="g">
        <div className="c4"><label className="lb">Name</label><input className="in" name="name" defaultValue={t?.name} required /></div>
        <div className="c4"><label className="lb">Location (optional)</label><input className="in" name="location" defaultValue={t?.location} /></div>
        <div className="c2" style={{ gridColumn: 'span 2' }}><label className="lb">Stars (1-5)</label><input className="in" name="rating" type="number" min="1" max="5" defaultValue={t?.rating ?? 5} /></div>
        <div className="chk" style={{ gridColumn: 'span 2' }}><input type="checkbox" id={pid} name="published" defaultChecked={t?.published ?? true} /><label htmlFor={pid}>Published</label></div>
        <div className="c12"><label className="lb">Testimonial</label><textarea className="in" name="body" defaultValue={t?.body} required /></div>
      </div>
      <div className="acts" style={{ marginTop: 14 }}><button className="ab p" type="submit">{t ? 'Save changes' : 'Add testimonial'}</button></div>
    </form>
  )
}

export default async function Testimonials({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const rows = await q('select * from testimonials order by id desc')
  return (
    <>
      <PageHeader title="Testimonials" sub="Customer reviews shown on the home page." />
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card"><h2>Add testimonial</h2><p className="sub">Published ones appear on the home page.</p><Form /></div>
      {rows.map((t) => (
        <div key={t.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div><b>{t.name}</b> <span style={{ color: '#10b981' }}>{'★'.repeat(t.rating)}</span> <span className={`pill ${t.published ? 'ok' : 'off'}`}>{t.published ? 'Published' : 'Hidden'}</span></div>
            <form action={deleteTestimonial}><input type="hidden" name="id" value={t.id} /><ConfirmButton className="ab d" message="Delete this testimonial?"><i className="material-icons">delete</i>Delete</ConfirmButton></form>
          </div>
          <Form t={t} />
        </div>
      ))}
      {!rows.length && <p className="empty">No testimonials yet.</p>}
    </>
  )
}
