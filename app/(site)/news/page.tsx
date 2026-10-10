import Link from 'next/link'
import type { Metadata } from 'next'
import { q } from '@/lib/db'

export const metadata: Metadata = { title: 'News', description: 'The latest news, guides and advice from RAW2K.' }
export const dynamic = 'force-dynamic'

export default async function News() {
  const posts = await q('select path, title, image, published from news order by published desc nulls last limit 60')
  return (
    <div className="container"><div className="row"><div className="col s12 xl10 offset-xl1">
      <section className="content-main blog featured-posts">
        <header className="page-header"><h1>News</h1></header>
        <div className="row"><div className="col s12"><div className="posts-area">
          {posts.map((p, i) => (
            <article key={p.path} className={`post ${i > 1 ? 'post-small' : ''}`}>
              <div className="img-thumbnail"><Link href={`/${p.path}`}>{p.image && <img src={p.image} alt={p.title} loading="lazy" />}</Link></div>
              <div className="caption">
                {i > 1 ? <h6 className="text-uppercase"><Link href={`/${p.path}`}>{p.title}</Link></h6> : <h4 className="text-uppercase"><Link href={`/${p.path}`}>{p.title}</Link></h4>}
                <div className="meta text-uppercase"><ul><li>News</li>{p.published && <li><time dateTime={String(p.published)}>{new Date(p.published).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</time></li>}</ul></div>
              </div>
            </article>
          ))}
        </div></div></div>
      </section>
    </div></div></div>
  )
}
