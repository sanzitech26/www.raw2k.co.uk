import { NextResponse } from 'next/server'
import { q } from '@/lib/db'

// Stores contact-form submissions. ponytail: no email delivery yet; read them from the `enquiries` table or add Resend later.
export async function POST(req: Request) {
  const f = Object.fromEntries([...(await req.formData())].map(([k, v]) => [k, String(v).slice(0, 5000)]))
  const back = new URL(req.headers.get('referer') || '/help/contact', req.url)
  if (!/^\S+@\S+\.\S+$/.test(f.email || '') || !f.message) { back.searchParams.set('error', '1'); return NextResponse.redirect(back, 303) }
  await q('insert into enquiries (data) values ($1)', [JSON.stringify(f)])
  back.searchParams.set('sent', '1')
  return NextResponse.redirect(back, 303)
}
