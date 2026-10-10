import { q } from '@/lib/db'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const cell = (v: unknown) => `"${String(v ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`

export async function GET() {
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 })
  const rows = await q('select lot, title, make, model, type, colour, fuel, transmission, odometer, location, opening, price, increment, ends_at from vehicles order by lot')
  const head = ['lot', 'title', 'make', 'model', 'type', 'colour', 'fuel', 'transmission', 'odometer', 'location', 'opening', 'price', 'increment', 'ends_at']
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => cell(h === 'ends_at' ? new Date(r[h]).toISOString() : r[h])).join(','))].join('\n')
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="vehicles.csv"' } })
}
