import Link from 'next/link'
import { isAdmin } from '@/lib/admin'
import { logoutAction } from './actions'

export const metadata = { title: 'Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const links = [['dashboard', 'Dashboard', '/admin'], ['directions_car', 'Vehicles', '/admin/vehicles'], ['format_quote', 'Testimonials', '/admin/testimonials'], ['article', 'Blog posts', '/admin/blog'], ['settings', 'Settings', '/admin/settings'], ['lock', 'Login details', '/admin/account']]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f3f5' }}>
      <style>{`.adm-card{background:#fff;border-radius:20px;box-shadow:0 5px 14px rgba(0,0,0,.15);padding:20px;margin-bottom:24px}
        .adm-nav a{display:flex;align-items:center;gap:12px;color:#fff;padding:12px 20px;font-weight:500}.adm-nav a:hover{background:#444}
        .adm label{position:static;display:block;font-size:.8rem;color:#666;margin-top:12px}.adm input:not([type=checkbox]),.adm select,.adm textarea{width:100%;box-sizing:border-box}
        .adm textarea{min-height:90px;border:1px solid #ccc;border-radius:6px;padding:8px}.adm select{display:block}.adm table td,.adm table th{padding:8px 6px}
        .adm .msg{padding:10px 14px;border-radius:8px;margin-bottom:16px}.adm .ok{background:#e6f4d7}.adm .bad{background:#fde2e2}`}</style>
      {authed && (
        <aside className="grey darken-3" style={{ width: 230, flex: 'none' }}>
          <Link href="/admin" style={{ display: 'block', background: '#fff', padding: 16 }}><img src="/images/logo.png" alt="RAW2K" style={{ width: 130 }} /></Link>
          <nav className="adm-nav" style={{ marginTop: 12 }}>
            {links.map(([i, t, h]) => <Link key={h} href={h}><i className="material-icons">{i}</i>{t}</Link>)}
            <Link href="/" target="_blank"><i className="material-icons">open_in_new</i>View site</Link>
          </nav>
          <form action={logoutAction} style={{ padding: 20 }}><button className="btn white grey-text text-darken-3" type="submit">Log out</button></form>
        </aside>
      )}
      <main className="adm" style={{ flex: 1, padding: 24, minWidth: 0 }}>{children}</main>
    </div>
  )
}
