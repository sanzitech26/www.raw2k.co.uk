import Link from 'next/link'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { savePost } from '../../actions'

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin()
  const { slug } = await params
  const isNew = slug === 'new'
  const [p] = isNew ? [null] : await q('select * from news where path = $1', [`news/${slug}`])
  if (!isNew && !p) notFound()
  // posts imported from the old site keep their original markup until edited here
  const body = p ? (p.body ?? (p.html ?? '').replace(/<[^>]+>/g, '').replace(/\n\s*\n+/g, '\n\n').trim()) : ''
  const day = (d: unknown) => (d ? new Date(d as string).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
  return (
    <>
      <Link href="/admin/blog" className="btn grey lighten-3 grey-text text-darken-2"><i className="material-icons left">navigate_before</i>Back</Link>
      <h4>{isNew ? 'New post' : 'Edit post'}</h4>
      {p && p.body === null && <div className="msg bad">This post was imported from the old site. Saving converts it to a plain-text post (headings and images in the body will be lost).</div>}
      <form action={savePost} className="adm-card">
        <input type="hidden" name="path" value={p?.path ?? ''} />
        <label>Title</label><input name="title" defaultValue={p?.title} required />
        <label>Date</label><input name="published" type="date" defaultValue={day(p?.published)} />
        <label>Cover image URL</label><input name="image" defaultValue={p?.image ?? ''} />
        <label>Short summary (search engines and previews)</label><input name="description" defaultValue={p?.description ?? ''} />
        <label>Post body (blank line = new paragraph)</label><textarea name="body" defaultValue={body} style={{ minHeight: 360 }} required />
        <br /><button className="btn btn-large blue-gradient white-text" type="submit">Save post</button>
      </form>
    </>
  )
}
