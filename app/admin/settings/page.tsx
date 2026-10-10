import Flash, { PageHeader } from '@/components/Flash'
import { requireAdmin } from '@/lib/admin'
import { getSettings, CURRENCIES } from '@/lib/settings'
import { saveSettings } from '../actions'

export default async function Settings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const sp = await searchParams
  const s = await getSettings()
  return (
    <form action={saveSettings} style={{ maxWidth: 760 }}>
      <PageHeader title="Settings" sub="Currency and contact details shown across the site.">
        <button className="ab p" type="submit"><i className="material-icons">check</i>Save settings</button>
      </PageHeader>
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card"><h2>Currency</h2><p className="sub">Changes the symbol only. Existing prices are not converted.</p>
        <div className="tiles">
          {Object.entries(CURRENCIES).map(([c, sym]) => (
            <label key={c} className="tile"><input type="radio" name="currency" value={c} defaultChecked={s.currency === c} /><span><b>{sym}</b>{c}</span></label>
          ))}
        </div>
      </div>
      <div className="card"><h2>Contact</h2><p className="sub">Shown in the site footer.</p><div className="g">
        <div className="c6"><label className="lb">Public contact email</label><input className="in" name="contact_email" type="email" defaultValue={s.contact_email} /></div>
        <div className="c6"><label className="lb">WhatsApp number</label><input className="in" name="whatsapp" defaultValue={s.whatsapp} placeholder="+44 7700 900123" /><p className="hint">International format. Adds a WhatsApp chat button to the footer.</p></div>
      </div></div>
    </form>
  )
}
