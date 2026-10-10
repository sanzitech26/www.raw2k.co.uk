import Flash from '@/components/Flash'
import { requireAdmin, currentEmail } from '@/lib/admin'
import { saveAccount } from '../actions'

export default async function Account({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  return (
    <>
      <h4>Login details</h4><Flash saved={sp.saved} error={sp.error} />
      <div className="adm-card" style={{ maxWidth: 560 }}>
        <strong>Handing the site to a new owner?</strong>
        <p>Change the email to the new owner&apos;s address and set a new password below, then give them the details. They can sign in and change both again here at any time. A changed email may need confirming from the inbox, depending on your Supabase email settings.</p>
      </div>
      <form action={saveAccount} className="adm-card" style={{ maxWidth: 560 }}>
        <label>Login email</label><input name="email" type="email" defaultValue={await currentEmail()} required />
        <label>New password (leave blank to keep the current one)</label><input name="password" type="password" minLength={8} autoComplete="new-password" />
        <label>Current password (required to save)</label><input name="current" type="password" required autoComplete="current-password" />
        <br /><button className="btn blue-gradient white-text" type="submit">Save login details</button>
      </form>
    </>
  )
}
