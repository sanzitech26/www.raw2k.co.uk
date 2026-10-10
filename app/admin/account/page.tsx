import Flash, { PageHeader } from '@/components/Flash'
import { requireAdmin, currentEmail } from '@/lib/admin'
import { saveAccount } from '../actions'

export default async function Account({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  return (
    <div style={{ maxWidth: 760 }}>
      <PageHeader title="Login details" sub="Change the email and password used to sign in to this dashboard." />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={saveAccount} className="card">
        <h2>Sign-in</h2><p className="sub">Handing the site to a new owner? Set their email and a new password here, then give them the details. They can change both again at any time.</p>
        <label className="lb">Login email</label><input className="in" name="email" type="email" defaultValue={await currentEmail()} required />
        <label className="lb" style={{ marginTop: 14 }}>New password</label><input className="in" name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Leave blank to keep the current one" />
        <label className="lb" style={{ marginTop: 14 }}>Current password</label><input className="in" name="current" type="password" required autoComplete="current-password" />
        <p className="hint">Required to save any change.</p>
        <div className="acts" style={{ marginTop: 16 }}><button className="ab p" type="submit">Save login details</button></div>
      </form>
    </div>
  )
}
