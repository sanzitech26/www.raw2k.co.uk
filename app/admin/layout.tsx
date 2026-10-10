import { isAdmin, currentEmail } from '@/lib/admin'
import AdminNav from '@/components/AdminNav'
import { logoutAction } from './actions'

export const metadata = { title: 'Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin()
  const email = authed ? await currentEmail() : ''
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" precedence="default" />
      <link rel="stylesheet" href="/css/admin.css" precedence="default" />
      {!authed ? (
        <div className="adm login">{children}</div>
      ) : (
        <div className="adm">
          <div className="frame">
            <aside className="side">
              <div className="brand"><img src="/images/logo.png" alt="RAW2K" /></div>
              <AdminNav />
              <div style={{ flex: 1 }} />
              <form action={logoutAction}><button type="submit"><i className="material-icons">logout</i>Log out</button></form>
            </aside>
            <main className="main">
              <div className="top">
                <form className="search" action="/admin/vehicles" method="get">
                  <i className="material-icons">search</i>
                  <input className="in" name="search" placeholder="Search vehicles or lot numbers..." />
                </form>
                <div className="user"><span className="av">{email[0] ?? 'A'}</span><span><b>{email}</b><small>Administrator</small></span></div>
              </div>
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  )
}
