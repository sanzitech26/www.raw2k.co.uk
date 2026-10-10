import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { loginAction } from '../actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect('/admin')
  const { error } = await searchParams
  return (
    <div className="adm-card" style={{ maxWidth: 420, margin: '10vh auto' }}>
      <img src="/images/logo.png" alt="RAW2K" style={{ width: 150 }} />
      <h5>Admin login</h5>
      {error && <div className="msg bad">Incorrect email or password.</div>}
      <form action={loginAction}>
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoFocus />
        <label htmlFor="password">Password</label><input id="password" name="password" type="password" required />
        <br /><button className="btn btn-large blue-gradient white-text" type="submit">Log in</button>
      </form>
    </div>
  )
}
