import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { loginAction } from '../actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; changed?: string }> }) {
  if (await isAdmin()) redirect('/admin')
  const { error, changed } = await searchParams
  return (
    <div className="adm-card" style={{ maxWidth: 420, margin: '10vh auto' }}>
      <img src="/images/logo.png" alt="RAW2K" style={{ width: 150 }} />
      <h5>Admin login</h5>
      {error === 'signups' && <div className="msg bad">Login is blocked for safety: public sign-ups are enabled in Supabase, which would let anyone create an admin account. In Supabase go to Authentication → Sign In / Providers and turn off &quot;Allow new users to sign up&quot;, then try again.</div>}
      {error && error !== 'signups' && <div className="msg bad">Incorrect email or password.</div>}
      {changed && <div className="msg ok">Email updated. Log in with your new email. If Supabase sent you a confirmation email, confirm it first; until then your old email still works.</div>}
      <form action={loginAction}>
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoFocus />
        <label htmlFor="password">Password</label><input id="password" name="password" type="password" required />
        <br /><button className="btn btn-large blue-gradient white-text" type="submit">Log in</button>
      </form>
    </div>
  )
}
