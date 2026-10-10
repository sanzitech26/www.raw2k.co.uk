import Flash from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { saveTestimonial, deleteTestimonial } from '../actions'

function Form({ t }: { t?: any }) {
  const pid = `p${t?.id ?? 'n'}`
  return (
    <form action={saveTestimonial} className="row">
      <input type="hidden" name="id" value={t?.id ?? ''} />
      <div className="col s12 m4"><label>Name</label><input name="name" defaultValue={t?.name} required /></div>
      <div className="col s12 m4"><label>Location (optional)</label><input name="location" defaultValue={t?.location} /></div>
      <div className="col s6 m2"><label>Stars (1-5)</label><input name="rating" type="number" min="1" max="5" defaultValue={t?.rating ?? 5} /></div>
      <div className="col s6 m2"><p><input type="checkbox" className="filled-in" id={pid} name="published" defaultChecked={t?.published ?? true} /><label htmlFor={pid} style={{ display: 'inline-block', paddingLeft: 28 }}>Published</label></p></div>
      <div className="col s12"><label>Testimonial</label><textarea name="body" defaultValue={t?.body} required /></div>
      <div className="col s12"><button className="btn blue-gradient white-text" type="submit">{t ? 'Save changes' : 'Add testimonial'}</button></div>
    </form>
  )
}

export default async function Testimonials({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const rows = await q('select * from testimonials order by id desc')
  return (
    <>
      <h4>Testimonials</h4><Flash saved={sp.saved} error={sp.error} />
      <div className="adm-card"><h5>Add testimonial</h5><Form /></div>
      {rows.map((t) => (
        <div key={t.id} className="adm-card">
          <Form t={t} />
          <form action={deleteTestimonial}><input type="hidden" name="id" value={t.id} /><ConfirmButton className="btn-flat red-text" message="Delete this testimonial?"><i className="material-icons left">delete</i>Delete</ConfirmButton></form>
        </div>
      ))}
    </>
  )
}
