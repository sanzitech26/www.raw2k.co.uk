import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { loginAction } from '../actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; changed?: string }> }) {
  if (await isAdmin()) redirect('/admin')
  const { error, changed } = await searchParams
  return (
    <div className="lcard">
      <img src="/images/logo.png" alt="RAW2K" />
      <h1>Welcome back</h1>
      <p className="sub">Log in to manage your auctions.</p>
      {error === 'signups' && <div className="msg bad">Login is blocked for safety: public sign-ups are enabled in Supabase, which would let anyone create an admin account. In Supabase go to Authentication → Sign In / Providers and turn off &quot;Allow new users to sign up&quot;, then try again.</div>}
      {error && error !== 'signups' && <div className="msg bad">Incorrect email or password.</div>}
      {changed && <div className="msg ok">Email updated. Log in with your new email.</div>}
      <form action={loginAction}>
        <label className="lb" htmlFor="email">Email</label><input className="in" id="email" name="email" type="email" required autoFocus />
        <label className="lb" htmlFor="password" style={{ marginTop: 14 }}>Password</label><input className="in" id="password" name="password" type="password" required />
        <button className="ab p" type="submit">Log in</button>
      </form>
    </div>
  )
}
