'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const main: [string, string, string][] = [['dashboard', 'Dashboard', '/admin'], ['directions_car', 'Vehicles', '/admin/vehicles'], ['format_quote', 'Testimonials', '/admin/testimonials'], ['article', 'Blog posts', '/admin/blog'], ['mail', 'Enquiries', '/admin/enquiries']]
const support: [string, string, string][] = [['settings', 'Settings', '/admin/settings'], ['lock', 'Login details', '/admin/account']]

export default function AdminNav() {
  const path = usePathname()
  const on = (h: string) => (h === '/admin' ? path === h : path.startsWith(h))
  const item = ([i, t, h]: [string, string, string]) => (
    <Link key={h} href={h} className={on(h) ? 'on' : ''}><i className="material-icons">{i}</i>{t}</Link>
  )
  return (
    <nav className="nav">
      <div className="grp">MAIN</div>{main.map(item)}
      <div className="grp">SUPPORT</div>{support.map(item)}
      <a href="/" target="_blank"><i className="material-icons">open_in_new</i>View site</a>
    </nav>
  )
}
