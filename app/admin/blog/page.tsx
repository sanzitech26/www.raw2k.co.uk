import Link from 'next/link'
import Flash, { PageHeader } from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { deletePost } from '../actions'

export default async function Blog({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const rows = await q('select path, title, image, published, body is not null mine from news order by published desc nulls last')
  return (
    <>
      <PageHeader title="Blog posts" sub="News and guides shown on the News page.">
        <Link className="ab p" href="/admin/blog/new"><i className="material-icons">add</i>New post</Link>
      </PageHeader>
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card">
        <h2>All posts <span style={{ color: '#6b7280', fontWeight: 500 }}>({rows.length})</span></h2>
        <table className="tbl" style={{ marginTop: 14 }}><thead><tr><th>Post</th><th>Date</th><th>Source</th><th></th></tr></thead><tbody>
          {rows.map((p) => {
            const slug = p.path.replace('news/', '')
            return (
              <tr key={p.path}>
                <td><Link className="veh" href={`/admin/blog/${slug}`}>{p.image ? <img src={p.image} alt="" /> : <span style={{ width: 56 }} />}<b>{p.title}</b></Link></td>
                <td>{p.published ? new Date(p.published).toLocaleDateString('en-GB') : ''}</td>
                <td><span className={`pill ${p.mine ? 'ok' : 'off'}`}>{p.mine ? 'Written here' : 'Imported'}</span></td>
                <td><div className="rowacts">
                  <a className="ab ic" href={`/${p.path}`} target="_blank" title="View"><i className="material-icons">open_in_new</i></a>
                  <Link className="ab ic" href={`/admin/blog/${slug}`} title="Edit"><i className="material-icons">edit</i></Link>
                  <form action={deletePost}><input type="hidden" name="path" value={p.path} /><ConfirmButton className="ab ic d" message="Delete this post?"><i className="material-icons">delete</i></ConfirmButton></form>
                </div></td>
              </tr>
            )
          })}
        </tbody></table>
        {!rows.length && <p className="empty">No posts yet.</p>}
      </div>
    </>
  )
}
