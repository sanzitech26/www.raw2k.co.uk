import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
const post = async (slug: string) => (await q('select * from news where lower(path) = lower($1)', [`news/${slug}`]))[0]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await post((await params).slug)
  return p ? { title: p.title, description: p.description, openGraph: { images: p.image ? [p.image] : [] } } : {}
}

export default async function Post({ params }: Props) {
  const p = await post((await params).slug)
  if (!p) notFound()
  return (
    <>
      <Breadcrumbs items={[['News', '/news'], [p.title, `/${p.path}`]]} />
      {p.body ? (
        <div className="container"><div className="row"><div className="col s12 m10 offset-m1 l8 offset-l2"><br />
          <h1>{p.title}</h1>
          {p.image && <img src={p.image} alt={p.title} style={{ maxWidth: '100%', borderRadius: 8 }} />}
          <div style={{ whiteSpace: 'pre-line' }}>{p.body}</div><br />
        </div></div></div>
      ) : <div dangerouslySetInnerHTML={{ __html: p.html }} />}
    </>
  )
}
