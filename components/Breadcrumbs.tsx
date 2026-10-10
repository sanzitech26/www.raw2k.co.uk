import Link from 'next/link'

export function Breadcrumbs({ items }: { items: [string, string][] }) {
  return (
    <nav className="grey darken-2 breads hide-on-small-and-down"><div className="nav-wrapper breadcrumb-wrapper">
      <ol className="col s12 breadcrumbs" style={{ height: '100%' }}>
        {[['Home', '/'] as [string, string], ...items].map(([n, h]) => <li key={h} className="breadcrumb"><Link href={h}><span>{n}</span></Link></li>)}
      </ol>
    </div></nav>
  )
}
