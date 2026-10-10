'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { q } from '@/lib/db'
import { login, logout, requireAdmin, changeCredentials } from '@/lib/admin'
import { setSetting, CURRENCIES } from '@/lib/settings'

const s = (f: FormData, k: string) => String(f.get(k) ?? '').trim()
const n = (f: FormData, k: string, d = 0) => (Number.isFinite(Number(s(f, k))) && s(f, k) !== '' ? Math.round(Number(s(f, k))) : d)
const on = (f: FormData, k: string) => f.get(k) === 'on'
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const refresh = () => revalidatePath('/', 'layout')

export async function loginAction(f: FormData) {
  const r = await login(s(f, 'email'), String(f.get('password') ?? ''))
  redirect(r === 'ok' ? '/admin' : `/admin/login?error=${r === 'signups' ? 'signups' : '1'}`)
}
export async function logoutAction() { await logout(); redirect('/admin/login') }

// ---------- vehicles ----------
export async function saveVehicle(f: FormData) {
  await requireAdmin()
  const title = s(f, 'title')
  if (!title) redirect('/admin/vehicles?error=Title+is+required')
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(s(f, 'ends_at'))) redirect('/admin/vehicles?error=Auction+end+date+is+required')
  const images = s(f, 'images').split(/\s+/).filter((u) => /^https?:\/\//.test(u))
  const detail = JSON.stringify({
    area: s(f, 'area'), town: s(f, 'town'), stored: s(f, 'stored'), vat: s(f, 'vat'), fsh: s(f, 'fsh'), extra: s(f, 'extra'),
    damage: s(f, 'damage'), viewing: s(f, 'viewing'), delivery: s(f, 'delivery'), premium: s(f, 'premium'), opening: n(f, 'opening'), increment: n(f, 'increment', 10),
  })
  const row = [title, s(f, 'make'), s(f, 'model'), s(f, 'colour'), s(f, 'fuel'), s(f, 'transmission'), s(f, 'type'), s(f, 'category') || 'Not Recorded',
    s(f, 'location'), n(f, 'odometer'), on(f, 'starts'), on(f, 'drives'), on(f, 'has_keys'), on(f, 'has_v5'), on(f, 'featured'),
    n(f, 'opening'), n(f, 'price', n(f, 'opening')), n(f, 'increment', 10), s(f, 'ends_at'), images[0] ?? '', JSON.stringify(images), detail]
  const lot = n(f, 'lot')
  if (lot) {
    await q(`update vehicles set title=$1, make=$2, model=$3, colour=$4, fuel=$5, transmission=$6, type=$7, category=$8, location=$9, odometer=$10,
      starts=$11, drives=$12, has_keys=$13, has_v5=$14, featured=$15, opening=$16, price=$17, increment=$18,
      ends_at = $19::timestamp at time zone 'Europe/London', image=$20, images=array(select jsonb_array_elements_text($21::jsonb)), detail = detail || $22::jsonb, area=$23 where lot=$24`, [...row, detail && JSON.parse(detail).area, lot])
  } else {
    const [{ next }] = await q('select coalesce(max(lot), 0) + 1 as next from vehicles')
    await q(`insert into vehicles (title, make, model, colour, fuel, transmission, type, category, location, odometer, starts, drives, has_keys, has_v5, featured,
      opening, price, increment, ends_at, image, images, detail, area, lot, slug)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, $19::timestamp at time zone 'Europe/London', $20,array(select jsonb_array_elements_text($21::jsonb)),$22::jsonb,$23,$24,$25)`,
    [...row, JSON.parse(detail).area, next, `${slugify(title)}-${next}`])
  }
  refresh()
  redirect('/admin/vehicles?saved=1')
}

export async function deleteVehicle(f: FormData) {
  await requireAdmin()
  await q('delete from vehicles where lot = $1', [n(f, 'lot')])
  refresh()
  redirect('/admin/vehicles?saved=1')
}

// ---------- testimonials ----------
export async function saveTestimonial(f: FormData) {
  await requireAdmin()
  const id = n(f, 'id'), rating = Math.min(5, Math.max(1, n(f, 'rating', 5)))
  if (!s(f, 'name') || !s(f, 'body')) redirect('/admin/testimonials?error=Name+and+text+are+required')
  const v = [s(f, 'name'), s(f, 'location'), s(f, 'body'), rating, on(f, 'published')]
  if (id) await q('update testimonials set name=$1, location=$2, body=$3, rating=$4, published=$5 where id=$6', [...v, id])
  else await q('insert into testimonials (name, location, body, rating, published) values ($1,$2,$3,$4,$5)', v)
  refresh()
  redirect('/admin/testimonials?saved=1')
}
export async function deleteTestimonial(f: FormData) {
  await requireAdmin()
  await q('delete from testimonials where id = $1', [n(f, 'id')])
  refresh()
  redirect('/admin/testimonials?saved=1')
}

// ---------- blog (news table) ----------
export async function savePost(f: FormData) {
  await requireAdmin()
  const title = s(f, 'title'), old = s(f, 'path')
  if (!title || !s(f, 'body')) redirect('/admin/blog?error=Title+and+body+are+required')
  const path = old || `news/${slugify(title) || Date.now()}`
  await q(`insert into news (path, title, description, image, published, body, html) values ($1,$2,$3,$4,$5,$6,'')
    on conflict (path) do update set title=$2, description=$3, image=$4, published=$5, body=$6`,
  [path, title, s(f, 'description'), s(f, 'image'), s(f, 'published') || new Date().toISOString().slice(0, 10), s(f, 'body')])
  refresh()
  redirect('/admin/blog?saved=1')
}
export async function deletePost(f: FormData) {
  await requireAdmin()
  await q('delete from news where path = $1', [s(f, 'path')])
  refresh()
  redirect('/admin/blog?saved=1')
}

// ---------- settings & account ----------
export async function saveSettings(f: FormData) {
  await requireAdmin()
  const cur = s(f, 'currency')
  if (!(cur in CURRENCIES)) redirect('/admin/settings?error=Unknown+currency')
  const email = s(f, 'contact_email')
  if (email && !/^\S+@\S+\.\S+$/.test(email)) redirect('/admin/settings?error=Enter+a+valid+contact+email')
  await setSetting('currency', cur)
  await setSetting('contact_email', email)
  await setSetting('whatsapp', s(f, 'whatsapp').replace(/[^\d+ ]/g, ''))
  refresh()
  redirect('/admin/settings?saved=1')
}

export async function saveAccount(f: FormData) {
  await requireAdmin()
  const err = await changeCredentials(String(f.get('current') ?? ''), s(f, 'email'), String(f.get('password') ?? ''))
  redirect(err ? `/admin/account?error=${encodeURIComponent(err)}` : '/admin/account?saved=1')
}
