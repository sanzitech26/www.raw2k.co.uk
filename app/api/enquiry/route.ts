import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { getSettings, money } from '@/lib/settings'
import { sendMail } from '@/lib/mail'
import { fmtDate } from '@/lib/vehicles'

const yn = (b: boolean) => (b ? 'Yes' : 'No')

// Stores enquiries (contact form + per-car buying interest) and emails the admin contact address.
export async function POST(req: Request) {
  const f = Object.fromEntries([...(await req.formData())].map(([k, v]) => [k, String(v).slice(0, 5000)]))
  const json = (req.headers.get('accept') || '').includes('application/json')
  const back = new URL(req.headers.get('referer') || '/help/contact', req.url)
  const done = (ok: boolean) => {
    if (json) return NextResponse.json({ ok }, { status: ok ? 200 : 400 })
    back.searchParams.set(ok ? 'sent' : 'error', '1')
    return NextResponse.redirect(back, 303)
  }
  if (f.website) return done(true) // honeypot
  if (!/^\S+@\S+\.\S+$/.test(f.email || '')) return done(false)
  const lot = Number(f.lot) || 0
  // car details come from the DB, never from the client
  const [v] = lot ? await q('select * from vehicles where lot = $1', [lot]) : []
  if (lot && !v) return done(false)
  if (!lot && !f.message) return done(false)
  const name = f.name || [f.forename, f.surname].filter(Boolean).join(' ')
  const subject = v ? `Buying enquiry: ${v.title.trim()} (Lot ${v.lot})` : f.subject || 'Website enquiry'
  await q('insert into enquiries (data) values ($1)', [JSON.stringify({ ...f, website: undefined, name, subject, ...(v && { lot: v.lot, vehicle: v.title.trim() }) })])
  try {
    const s = await getSettings()
    const d = v?.detail || {}
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
    const car = v ? [
      '', '--- VEHICLE ---',
      `Lot: ${v.lot}`, `Vehicle: ${v.title.trim()}`, `Make / model: ${v.make} ${v.model}`, `Colour: ${v.colour}`, `Fuel: ${v.fuel}`, `Transmission: ${v.transmission}`,
      `Mileage: ${v.odometer ? Number(v.odometer).toLocaleString('en-GB') + ' miles' : 'Not recorded'}`, `Type: ${v.type}`, `Category: ${v.category}`,
      `Starts: ${yn(v.starts)}   Drives: ${yn(v.drives)}   Keys: ${yn(v.has_keys)}   V5: ${yn(v.has_v5)}`,
      `Location: ${[d.town || v.location, v.area].filter(Boolean).join(', ')}`, `Price: ${money(v.price, s.sym)}`,
      `Page: ${site}/vehicle-auctions/${v.slug}`,
    ] : []
    await sendMail({
      to: s.contact_email, replyTo: f.email, subject,
      text: ['--- CUSTOMER ---', `Name: ${name}`, `Email: ${f.email}`, `Phone: ${f.tel || '-'}`, '', f.message || '(no message)', ...car].join('\n'),
    })
  } catch (e) { console.error('enquiry email failed', e) }
  return done(true)
}
