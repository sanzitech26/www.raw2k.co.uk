import Flash from '@/components/Flash'
import { requireAdmin } from '@/lib/admin'
import { getSettings, CURRENCIES } from '@/lib/settings'
import { saveSettings } from '../actions'

export default async function Settings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const s = await getSettings()
  return (
    <>
      <h4>Settings</h4><Flash saved={sp.saved} error={sp.error} />
      <form action={saveSettings} className="adm-card" style={{ maxWidth: 560 }}>
        <label>Currency shown across the site</label>
        <select className="browser-default" name="currency" defaultValue={s.currency}>
          {Object.entries(CURRENCIES).map(([c, sym]) => <option key={c} value={c}>{c} ({sym})</option>)}
        </select>
        <p className="grey-text">Changes the symbol only. Existing prices are not converted.</p>
        <label>Public contact email (shown in the site footer)</label><input name="contact_email" type="email" defaultValue={s.contact_email} />
        <label>WhatsApp number (international format, e.g. +44 7700 900123)</label><input name="whatsapp" defaultValue={s.whatsapp} />
        <br /><button className="btn blue-gradient white-text" type="submit">Save settings</button>
      </form>
    </>
  )
}
