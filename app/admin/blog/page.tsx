import Link from 'next/link'
import Flash from '@/components/Flash'
import ConfirmButton from '@/components/ConfirmButton'
import { q } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { deletePost } from '../actions'

export default async function Blog({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const rows = await q('select path, title, published from news order by published desc nulls last')
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Blog posts</h4><Link className="btn blue-gradient white-text" href="/admin/blog/new"><i className="material-icons left">add</i>New post</Link>
      </div>
      <Flash saved={sp.saved} error={sp.error} />
      <div className="adm-card"><table className="striped"><thead><tr><th>Title</th><th>Date</th><th></th></tr></thead><tbody>
        {rows.map((p) => (
          <tr key={p.path}>
            <td><Link href={`/admin/blog/${p.path.replace('news/', '')}`}>{p.title}</Link></td>
            <td>{p.published ? new Date(p.published).toLocaleDateString('en-GB') : ''}</td>
            <td style={{ whiteSpace: 'nowrap' }}>
              <a className="btn-flat" href={`/${p.path}`} target="_blank"><i className="material-icons">open_in_new</i></a>
              <Link className="btn-flat" href={`/admin/blog/${p.path.replace('news/', '')}`}><i className="material-icons">edit</i></Link>
              <form action={deletePost} style={{ display: 'inline' }}><input type="hidden" name="path" value={p.path} />
                <ConfirmButton className="btn-flat red-text" message="Delete this post?"><i className="material-icons">delete</i></ConfirmButton></form>
            </td>
          </tr>
        ))}
      </tbody></table></div>
    </>
  )
}
