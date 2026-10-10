import Link from 'next/link'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { PageHeader } from '@/components/Flash'
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
    <form action={savePost}>
      <PageHeader title={isNew ? 'New post' : 'Edit post'} sub={isNew ? 'Write a news item or guide.' : p.title}>
        <Link href="/admin/blog" className="ab">Cancel</Link>
        <button className="ab p" type="submit"><i className="material-icons">check</i>Save post</button>
      </PageHeader>
      {p && p.body === null && <div className="msg bad">This post was imported from the old site. Saving converts it to a plain-text post (headings and images in the body will be lost).</div>}
      <input type="hidden" name="path" value={p?.path ?? ''} />
      <div className="twocol">
        <div className="card">
          <label className="lb">Title</label><input className="in" name="title" defaultValue={p?.title} required />
          <label className="lb" style={{ marginTop: 14 }}>Post body (blank line = new paragraph)</label>
          <textarea className="in" name="body" defaultValue={body} style={{ minHeight: 380 }} required />
        </div>
        <div className="card">
          <label className="lb">Date</label><input className="in" name="published" type="date" defaultValue={day(p?.published)} />
          <label className="lb" style={{ marginTop: 14 }}>Cover image URL</label><input className="in" name="image" defaultValue={p?.image ?? ''} />
          {p?.image && <img src={p.image} alt="" style={{ width: '100%', borderRadius: 10, marginTop: 10 }} />}
          <label className="lb" style={{ marginTop: 14 }}>Short summary</label><textarea className="in" name="description" defaultValue={p?.description ?? ''} />
          <p className="hint">Used for search engines and link previews.</p>
        </div>
      </div>
    </form>
  )
}
